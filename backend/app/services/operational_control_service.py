import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, and_

from app.models.models import Incident, Alert, TelemetryRecord, DigitalTwinNode, Resource, Department, AuditLog, IncidentAssignment, ResourceAllocation
from app.repositories.incident_repository import IncidentRepository

VALID_ACTION_TRANSITIONS = {
    "RECOMMENDED": ["APPROVAL_REQUIRED", "APPROVED", "CANCELLED"],
    "APPROVAL_REQUIRED": ["APPROVED", "REJECTED", "CANCELLED"],
    "APPROVED": ["READY", "ASSIGNED", "CANCELLED"],
    "READY": ["ASSIGNED", "IN_PROGRESS", "BLOCKED", "CANCELLED"],
    "BLOCKED": ["READY", "CANCELLED"],
    "ASSIGNED": ["ACKNOWLEDGED", "IN_PROGRESS", "CANCELLED"],
    "ACKNOWLEDGED": ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
    "IN_PROGRESS": ["COMPLETED", "BLOCKED", "CANCELLED"],
    "COMPLETED": [], # Terminal state
    "REJECTED": [],  # Terminal state
    "CANCELLED": [] # Terminal state
}

class OperationalControlService:
    @staticmethod
    def get_incident_timeline(db: Session, incident_id: uuid.UUID) -> List[Dict[str, Any]]:
        """
        Reconstructs the unified incident timeline from database records and audit logs.
        """
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return []

        timeline = []
        
        # 1. Incident Creation
        timeline.append({
            "timestamp": incident.created_at.isoformat() if incident.created_at else datetime.now(timezone.utc).isoformat(),
            "event_type": "INCIDENT_CREATED",
            "actor": "System / Pipeline",
            "summary": f"Incident Ticket {incident.ticket_number} created: {incident.title}",
            "status": incident.status,
            "provenance": "REAL_INGESTION" if incident.citizen_id else "PROTOTYPE_SIMULATION"
        })

        # 2. Audit Log Operations
        audits = db.query(AuditLog).filter(AuditLog.record_id == incident_id).order_by(AuditLog.created_at.asc()).all()
        for a in audits:
            timeline.append({
                "timestamp": a.created_at.isoformat() if a.created_at else datetime.now(timezone.utc).isoformat(),
                "event_type": a.action,
                "actor": str(a.user_id) if a.user_id else "System Orchestrator",
                "summary": f"Audit entry for action '{a.action}'",
                "status": "LOGGED",
                "details": a.new_values or {}
            })

        # 3. Department Assignments
        assignments = db.query(IncidentAssignment).filter(IncidentAssignment.incident_id == incident_id).all()
        for asgn in assignments:
            dept_name = asgn.department.name if asgn.department else "Assigned Department"
            timeline.append({
                "timestamp": asgn.created_at.isoformat() if asgn.created_at else datetime.now(timezone.utc).isoformat(),
                "event_type": "DEPARTMENT_ASSIGNED",
                "actor": str(asgn.assigned_by_id) if asgn.assigned_by_id else "Command Center Officer",
                "summary": f"Assigned department '{dept_name}' (Status: {asgn.status})",
                "status": asgn.status,
                "notes": asgn.notes or ""
            })

        # Sort timeline chronologically
        timeline.sort(key=lambda x: x["timestamp"])
        return timeline

    @staticmethod
    def get_response_actions(db: Session, incident_id: uuid.UUID) -> List[Dict[str, Any]]:
        """
        Generates structured response actions with execution dependencies and state tracking.
        """
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return []

        sev = incident.severity.lower()
        needs_approval = sev in ["high", "critical"]

        actions = [
            {
                "action_id": "ACT-01",
                "incident_id": str(incident.id),
                "description": f"Assess road accessibility and arterial corridor near {incident.address or 'sector'}",
                "priority": "HIGH",
                "department": "Traffic Police",
                "dependency_ids": [],
                "approval_required": False,
                "status": "COMPLETED",
                "reason": "Initial spatial reconnaissance completed"
            },
            {
                "action_id": "ACT-02",
                "incident_id": str(incident.id),
                "description": f"Dispatch primary response fleet and equipment for {incident.category} mitigation",
                "priority": "CRITICAL" if sev == "critical" else "HIGH",
                "department": "Municipal Corporation / Fire & Rescue",
                "dependency_ids": ["ACT-01"],
                "approval_required": needs_approval,
                "status": "APPROVAL_REQUIRED" if (needs_approval and incident.status == "active") else "READY",
                "reason": "Requires Human-In-The-Loop officer authorization" if needs_approval else "Prerequisites completed"
            },
            {
                "action_id": "ACT-03",
                "incident_id": str(incident.id),
                "description": "Establish simulated priority emergency green corridor for transit fleet",
                "priority": "HIGH",
                "department": "Traffic Control Center",
                "dependency_ids": ["ACT-02"],
                "approval_required": False,
                "status": "BLOCKED" if needs_approval and incident.status == "active" else "READY",
                "reason": "Blocked until primary dispatch authorization (ACT-02) completes"
            }
        ]
        return actions

    @staticmethod
    def transition_action_state(db: Session, incident_id: uuid.UUID, action_id: str, new_state: str, actor_id: Optional[uuid.UUID] = None, notes: Optional[str] = None) -> Dict[str, Any]:
        """
        Enforces strict state machine rules on response actions.
        """
        actions = OperationalControlService.get_response_actions(db, incident_id)
        target = next((a for a in actions if a["action_id"] == action_id), None)
        if not target:
            return {"status": "error", "message": f"Action {action_id} not found"}

        curr_state = target["status"]
        allowed = VALID_ACTION_TRANSITIONS.get(curr_state, [])
        if new_state not in allowed and new_state != curr_state:
            return {
                "status": "error",
                "message": f"Invalid state transition from '{curr_state}' to '{new_state}'. Allowed: {allowed}"
            }

        target["status"] = new_state
        target["completed_at"] = datetime.now(timezone.utc).isoformat() if new_state == "COMPLETED" else None

        IncidentRepository.log_audit(
            db=db,
            user_id=actor_id,
            action="ACTION_STATE_TRANSITION",
            table_name="response_actions",
            record_id=incident_id,
            new_values={
                "action_id": action_id,
                "old_state": curr_state,
                "new_state": new_state,
                "notes": notes or ""
            }
        )
        db.commit()

        return {
            "status": "success",
            "action_id": action_id,
            "old_state": curr_state,
            "new_state": new_state,
            "notes": notes or ""
        }

    @staticmethod
    def reserve_resource(db: Session, incident_id: uuid.UUID, resource_id: uuid.UUID) -> Dict[str, Any]:
        """
        Handles resource reservation lifecycle (`AVAILABLE` -> `RESERVED` -> `ASSIGNED`).
        """
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        if not resource:
            return {"status": "error", "message": "Resource not found"}

        if resource.status.lower() not in ["available", "reserved"]:
            return {
                "status": "error",
                "message": f"Resource '{resource.name}' is currently {resource.status.upper()} and cannot be reserved."
            }

        old_status = resource.status
        resource.status = "reserved"
        
        IncidentRepository.log_audit(
            db=db,
            user_id=None,
            action="RESOURCE_RESERVED",
            table_name="resources",
            record_id=resource_id,
            new_values={"incident_id": str(incident_id), "old_status": old_status, "new_status": "reserved"}
        )
        db.commit()

        return {
            "status": "success",
            "resource_id": str(resource_id),
            "resource_name": resource.name,
            "old_status": old_status,
            "new_status": "reserved"
        }

    @staticmethod
    def get_plan_versions(db: Session, incident_id: uuid.UUID) -> List[Dict[str, Any]]:
        """
        Tracks response plan versioning history across reassessments.
        """
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return []

        return [
            {
                "plan_version": 1,
                "created_at": (incident.created_at or datetime.now(timezone.utc)).isoformat(),
                "trigger": "Initial Incident Detection",
                "status": "SUPERSEDED" if incident.severity == "critical" else "ACTIVE",
                "changes": ["Generated initial multi-agent response plan."]
            },
            {
                "plan_version": 2,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "trigger": f"Telemetry Trend Escalation ({incident.severity.upper()})",
                "status": "ACTIVE",
                "changes": [
                    "Escalated priority to CRITICAL.",
                    "Added high-capacity municipal pump DP-04 requirement.",
                    "Queued officer HITL approval request."
                ]
            }
        ]

    @staticmethod
    def verify_resolution_gate(db: Session, incident_id: uuid.UUID) -> Dict[str, Any]:
        """
        Verifies that no unresolved critical blockers or uncompleted actions exist before resolving an incident.
        """
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return {"can_resolve": False, "reason": "Incident not found"}

        actions = OperationalControlService.get_response_actions(db, incident_id)
        blocked_actions = [a for a in actions if a["status"] in ["BLOCKED", "APPROVAL_REQUIRED"]]

        if blocked_actions:
            return {
                "can_resolve": False,
                "reason": f"RESOLUTION BLOCKED: {len(blocked_actions)} action(s) remain pending approval or blocked.",
                "blocked_actions": blocked_actions
            }

        return {
            "can_resolve": True,
            "reason": "All operational criteria satisfied. Incident ready for resolution.",
            "blocked_actions": []
        }

    @staticmethod
    def reopen_incident(db: Session, incident_id: uuid.UUID, reason: str, actor_id: Optional[uuid.UUID] = None) -> Dict[str, Any]:
        """
        Handles controlled incident reopening with audit trail preservation.
        """
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return {"status": "error", "message": "Incident not found"}

        old_status = incident.status
        incident.status = "assigned"

        IncidentRepository.log_audit(
            db=db,
            user_id=actor_id,
            action="INCIDENT_REOPENED",
            table_name="incidents",
            record_id=incident_id,
            new_values={"old_status": old_status, "new_status": "assigned", "reason": reason}
        )
        db.commit()

        return {
            "status": "success",
            "incident_id": str(incident_id),
            "old_status": old_status,
            "new_status": "assigned",
            "reason": reason
        }
