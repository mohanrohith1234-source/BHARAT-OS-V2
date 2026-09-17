import pytest
import uuid
from app.db.session import SessionLocal
from app.models.models import Incident, Resource
from app.services.operational_control_service import OperationalControlService

def test_action_state_machine_and_timeline():
    db = SessionLocal()
    try:
        inc = Incident(
            id=uuid.uuid4(),
            ticket_number=f"INC-{uuid.uuid4().hex[:6].upper()}",
            category="Flood",
            title="[TEST] Flood Control Action",
            description="Testing operational action state machine",
            latitude=17.7210,
            longitude=83.3180,
            severity="critical",
            status="active"
        )
        db.add(inc)
        db.commit()
        db.refresh(inc)

        # 1. Retrieve actions
        actions = OperationalControlService.get_response_actions(db, inc.id)
        assert len(actions) >= 3

        # 2. Valid Transition RECOMMENDED -> APPROVED
        res_valid = OperationalControlService.transition_action_state(db, inc.id, "ACT-01", "COMPLETED")
        assert res_valid["status"] == "success"

        # 3. Invalid Transition COMPLETED -> IN_PROGRESS
        res_invalid = OperationalControlService.transition_action_state(db, inc.id, "ACT-01", "IN_PROGRESS")
        assert res_invalid["status"] == "error"

        # 4. Timeline
        timeline = OperationalControlService.get_incident_timeline(db, inc.id)
        assert len(timeline) >= 2

        # 5. Plan versions
        versions = OperationalControlService.get_plan_versions(db, inc.id)
        assert len(versions) == 2

        # 6. Resolution gate check
        gate = OperationalControlService.verify_resolution_gate(db, inc.id)
        assert "can_resolve" in gate
    finally:
        db.close()

def test_resource_reservation_and_reopen():
    db = SessionLocal()
    try:
        inc = Incident(
            id=uuid.uuid4(),
            ticket_number=f"INC-{uuid.uuid4().hex[:6].upper()}",
            category="Accident",
            title="[TEST] Collision Response",
            description="Testing resource reservation",
            latitude=17.7202,
            longitude=83.3156,
            severity="high",
            status="resolved"
        )
        res = Resource(
            id=uuid.uuid4(),
            name="TEST-AMB-99",
            type="Ambulance",
            status="available",
            latitude=17.7200,
            longitude=83.3150
        )
        db.add(inc)
        db.add(res)
        db.commit()

        # Reserve resource
        res_out = OperationalControlService.reserve_resource(db, inc.id, res.id)
        assert res_out["status"] == "success"
        assert res_out["new_status"] == "reserved"

        # Reopen incident
        reopen_out = OperationalControlService.reopen_incident(db, inc.id, "New corroborating evidence received")
        assert reopen_out["status"] == "success"
        assert reopen_out["new_status"] == "assigned"
    finally:
        db.close()
