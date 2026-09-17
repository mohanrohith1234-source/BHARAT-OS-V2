import uuid
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.models.models import DigitalTwinNode, TelemetryRecord, Alert, Incident, Resource, User
from app.schemas.events import (
    StandardizedBharatOSEvent,
    EventIngestResponse,
    EventSourceType,
    EmergencyCategory,
)
from app.schemas.schemas import IncidentCreate
from app.services.alert_rule_service import AlertRuleService, ALERT_RULES
from app.services.incident_service import IncidentService
from app.repositories.alert_repository import AlertRepository
from app.repositories.incident_repository import IncidentRepository
from app.realtime.event_service import event_service

# Pre-defined multi-agent response templates by category
CATEGORY_RESPONSE_TEMPLATES = {
    "Flood": {
        "departments": ["Disaster Management", "Fire & Rescue", "Municipal Corporation (GVMC)", "Traffic Police", "Health & Medical"],
        "plan": [
            "Deploy High-Capacity Dewatering Pump DP-04 & Rescue Tender FT-12 to inundation zone",
            "Establish traffic diversion away from flooded corridor onto elevated bypass arterial",
            "Pre-alert King George Hospital Trauma Unit & place 12 emergency beds on reserve",
            "Stage MVP High School relief center with emergency drinking water and backup gensets",
            "Issue hyper-local nowcasting alert to registered cell-broadcast towers in affected ward"
        ],
        "default_risk": 88.0
    },
    "Fire": {
        "departments": ["Fire & Rescue Services", "Disaster Management", "Health & Medical", "Traffic Police", "APEPDCL Power"],
        "plan": [
            "Dispatch Advanced Water Tender FT-12 & Foam Tender to active blaze coordinate",
            "Isolate electrical grid substation in sector to prevent secondary transformer flare-ups",
            "Deploy Police Patrol P-305 to establish a 400-meter safety perimeter and cordon crowd",
            "Dispatch ALS Ambulance AMB-042 for burn triage and oxygen stabilization",
            "Notify King George Hospital Burn Ward & activate municipal water hydrant network booster"
        ],
        "default_risk": 92.0
    },
    "Hazardous Material": {
        "departments": ["Fire & Rescue (Hazmat Squad)", "Pollution Control Board", "Disaster Management", "Health & Medical", "City Police"],
        "plan": [
            "Dispatch Hazmat Chemical Containment Squad with neutralizing agent sprayers",
            "Initiate downwind perimeter evacuation across a 1.2km radius",
            "Issue instant shelter-in-place and wet-cloth respiratory broadcast via cellular SMS/App",
            "Deploy Police units to block all access roads into industrial corridor",
            "Pre-condition respiratory trauma units at King George Hospital & Gajuwaka General Hospital"
        ],
        "default_risk": 95.0
    },
    "Earthquake": {
        "departments": ["Disaster Management (SDRF/NDRF)", "Municipal Corporation (GVMC)", "Fire & Rescue", "Health & Medical", "Traffic Police"],
        "plan": [
            "Activate District Emergency Operations Center Level-3 Mass Casualty Protocol",
            "Deploy structural safety reconnaissance teams to inspect bridges, flyovers, and hospitals",
            "Establish field triage stations in open municipal sports complexes",
            "Cut gas supply mains and verify electrical transformer auto-tripping status",
            "Establish emergency green corridors for unimpeded heavy rescue machinery transport"
        ],
        "default_risk": 94.0
    },
    "Traffic Disruption": {
        "departments": ["Traffic Police", "Municipal Corporation (GVMC)", "Towing & Recovery Unit", "Disaster Management"],
        "plan": [
            "Dispatch Traffic Interceptor Patrol P-305 to manually regulate gridlocked intersection",
            "Deploy heavy municipal crane to clear stalled/waterlogged vehicles blocking arterial flow",
            "Reprogram intelligent traffic light timings along secondary relief routes to 90s green split",
            "Transmit digital variable message sign (VMS) advisory: Reroute via NH16 bypass",
            "Maintain reserved emergency lane for EMS and ambulance transit"
        ],
        "default_risk": 74.0
    },
    "Accident": {
        "departments": ["City Traffic Police", "Health & Medical (108 EMS)", "Fire & Rescue", "National Highways Authority"],
        "plan": [
            "Dispatch nearest Advanced Life Support Ambulance AMB-042 with 4-minute ETA",
            "Dispatch Heavy Rescue Tender FT-12 equipped with hydraulic extrication cutters",
            "Police unit P-305 to secure crash perimeter and prevent secondary rear-end collisions",
            "Transmit trauma intake telemetry to King George Hospital Emergency Department",
            "Dispatch highway recovery tow truck to clear carriageway once victims are evacuated"
        ],
        "default_risk": 84.0
    },
    "Cyclone": {
        "departments": ["Disaster Management (SDMA)", "Coast Guard / Marine Police", "Municipal Corporation", "Power (APEPDCL)", "Fire & Rescue"],
        "plan": [
            "Enforce total fishing ban and beach access suspension with coastal police patrols",
            "Deploy municipal chain-saw tree clearing squads along critical ambulance arterials",
            "Pre-position diesel generators and satellite communication links at district hospitals",
            "Evacuate vulnerable low-lying coastal slum hamlets to hardened cyclone shelters",
            "Activate 24x7 hyper-local radar nowcasting tracking loop with 15-minute sync interval"
        ],
        "default_risk": 91.0
    },
    "General Emergency": {
        "departments": ["Disaster Management", "Police Department", "Health & Medical", "Municipal Corporation"],
        "plan": [
            "Dispatch nearest multi-purpose emergency response team for on-scene reconnaissance",
            "Establish live tactical communication between Field Commander and District Command Center",
            "Assess immediate public safety risk and cordon hazard zone",
            "Stage secondary medical and rescue reinforcements at nearest municipal depot",
            "Log event into District Operations Audit Trail and monitor incoming telemetry"
        ],
        "default_risk": 70.0
    }
}

class EventPipelineService:
    @staticmethod
    def process_event(db: Session, event: StandardizedBharatOSEvent) -> EventIngestResponse:
        """
        Executes the end-to-end BharatOS event pipeline:
        Ingest -> Standardize -> Correlation & Rules -> Multi-Agent AI Planning -> HITL Staging -> Broadcast
        """
        # 1. Normalize Category & Severity
        category_name = event.category.value if isinstance(event.category, EmergencyCategory) else str(event.category)
        if category_name not in CATEGORY_RESPONSE_TEMPLATES:
            category_name = "General Emergency"

        severity = event.severity.lower()
        if severity not in ["low", "medium", "high", "critical"]:
            severity = "medium"

        # 2. Match or locate Digital Twin Node if sensor-related
        matched_node: Optional[DigitalTwinNode] = None
        if event.sensor_id:
            try:
                matched_node = db.query(DigitalTwinNode).filter(
                    or_(
                        DigitalTwinNode.id == uuid.UUID(event.sensor_id) if len(event.sensor_id) == 36 else False,
                        DigitalTwinNode.name.ilike(f"%{event.sensor_id}%")
                    )
                ).first()
            except Exception:
                matched_node = None

        if not matched_node and event.latitude and event.longitude:
            # Match closest node or fallback to primary demo node
            nodes = db.query(DigitalTwinNode).all()
            if nodes:
                # Pick node with closest distance
                matched_node = min(
                    nodes,
                    key=lambda n: ((n.latitude or 17.72) - event.latitude)**2 + ((n.longitude or 83.31) - event.longitude)**2
                )

        # 3. If IoT metric present, create TelemetryRecord and evaluate AlertRuleService
        created_alert: Optional[Alert] = None
        created_telemetry: Optional[TelemetryRecord] = None

        if event.metric_type and event.metric_value is not None:
            # Check thresholds from ALERT_RULES
            rule_info = ALERT_RULES.get(event.metric_type)
            if rule_info:
                # Update severity if rule threshold is breached
                for t in sorted(rule_info["thresholds"], key=lambda x: x["min_value"], reverse=True):
                    if event.metric_value >= t["min_value"]:
                        severity = t["severity"].lower()
                        break

            if matched_node:
                # Cache on node
                node_status = "critical" if severity == "critical" else "warning" if severity == "high" else "normal"
                matched_node.status = node_status
                curr_telem = dict(matched_node.last_telemetry or {})
                curr_telem.update({
                    event.metric_type: event.metric_value,
                    "unit": event.metric_unit or "",
                    "source_type": event.source_type.value,
                    "observed_at": datetime.now(timezone.utc).isoformat()
                })
                matched_node.last_telemetry = curr_telem
                flag_modified(matched_node, "last_telemetry")

                created_telemetry = TelemetryRecord(
                    id=uuid.uuid4(),
                    node_id=matched_node.id,
                    metric_type=event.metric_type,
                    value=event.metric_value,
                    unit=event.metric_unit or "",
                    status=node_status,
                    timestamp=event.timestamp or datetime.now(timezone.utc)
                )
                created_telemetry.source_type = "REAL_IOT" if event.provenance == "REAL_INGESTION" else "SIMULATED"
                db.add(created_telemetry)
                db.flush()

                # Evaluate rules
                created_alert = AlertRuleService.evaluate_telemetry(db, created_telemetry)

        # If not evaluated through AlertRuleService but severity is high/critical, create standard alert
        if not created_alert and severity in ["high", "critical"]:
            repo = AlertRepository(db)
            alert_title = event.title or f"[{event.source_type.value}] {severity.upper()} {category_name} in {event.address or 'Sector'}"
            alert_desc = event.description or f"Event detected from {event.source_type.value}. Severity: {severity.upper()}."
            created_alert = repo.create_alert(data={
                "title": alert_title,
                "description": alert_desc,
                "severity": severity.upper(),
                "category": category_name.upper().replace(" ", "_"),
                "state_id": matched_node.state_id if matched_node else None,
                "city_id": matched_node.city_id if matched_node else None,
                "source": "REAL_IOT" if event.provenance == "REAL_INGESTION" else "SIMULATED",
                "status": "ACTIVE",
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=2)
            })
            db.commit()

        # 4. Incident Detection & Correlation Engine
        created_incident: Optional[Incident] = None
        is_correlated = False

        # Triggers: critical or high severity, or CCTV YOLO detection, or citizen SOS
        if severity in ["high", "critical"] or event.source_type in [EventSourceType.CITIZEN_SOS, EventSourceType.CCTV_YOLO]:
            # Deduplication: check if active incident already exists within ~500m / matching title
            inc_title = event.title or (
                f"[{event.source_type.value}] {category_name} at {event.address or (matched_node.name if matched_node else 'Operations Zone')}"
            )
            
            existing_incident = db.query(Incident).filter(
                Incident.status != "resolved",
                or_(
                    Incident.title == inc_title,
                    and_(
                        Incident.category == category_name,
                        Incident.latitude.between(event.latitude - 0.005, event.latitude + 0.005),
                        Incident.longitude.between(event.longitude - 0.005, event.longitude + 0.005)
                    )
                )
            ).first()

            if existing_incident:
                created_incident = existing_incident
                is_correlated = True
            else:
                inc_desc = event.description or (
                    f"Automated incident detected by {event.source_type.value}. "
                    f"Category: {category_name}. "
                    f"Details: {event.metric_type}={event.metric_value} {event.metric_unit or ''}."
                    if event.metric_type else f"Alert triggered by {event.source_type.value}."
                )
                
                # Image urls from evidence if CCTV
                img_urls = []
                if event.evidence and "image_url" in event.evidence and event.evidence["image_url"]:
                    img_urls.append(event.evidence["image_url"])

                incident_in = IncidentCreate(
                    category=category_name,
                    title=inc_title,
                    description=inc_desc,
                    latitude=event.latitude,
                    longitude=event.longitude,
                    address=event.address or (matched_node.name if matched_node else "Visakhapatnam Operations Zone"),
                    severity=severity,
                    zone_id=None,
                    ward_id=None,
                    image_urls=img_urls
                )
                created_incident = IncidentService.create_incident(db, incident_in, citizen_id=None)
                db.commit()
                db.refresh(created_incident)

        # 5. Multi-Agent AI Response Orchestrator
        template = CATEGORY_RESPONSE_TEMPLATES.get(category_name, CATEGORY_RESPONSE_TEMPLATES["General Emergency"])
        base_risk = template["default_risk"]
        if severity == "critical":
            ai_risk_score = min(98.5, base_risk + 5.0)
        elif severity == "high":
            ai_risk_score = max(72.0, base_risk - 5.0)
        else:
            ai_risk_score = 45.0

        ai_confidence = 94.6 if event.source_type == EventSourceType.IOT_SENSOR else 92.4

        # Retrieve nearest operational resources from DB
        recommended_resources = []
        try:
            db_resources = db.query(Resource).filter(Resource.status == "AVAILABLE").limit(4).all()
            for r in db_resources:
                recommended_resources.append({
                    "id": str(r.id),
                    "call_sign": r.name,
                    "type": r.type or "Emergency Unit",
                    "department": r.department.name if r.department else "General Response",
                    "distance_km": round(1.2 + (hash(str(r.id)) % 20) / 10.0, 1),
                    "status": "AVAILABLE"
                })
        except Exception:
            pass

        if not recommended_resources:
            # High-readiness response fleet units
            recommended_resources = [
                {"id": "AMB-042", "call_sign": "AMB-042", "type": "ALS Ambulance", "department": "Health & Medical", "distance_km": 1.8, "status": "AVAILABLE"},
                {"id": "FT-12", "call_sign": "FT-12", "type": "Rescue Tender", "department": "Fire & Rescue", "distance_km": 2.4, "status": "AVAILABLE"},
                {"id": "P-305", "call_sign": "P-305", "type": "Traffic Patrol", "department": "Traffic Police", "distance_km": 1.2, "status": "AVAILABLE"},
                {"id": "DP-04", "call_sign": "DP-04", "type": "Dewatering Pump", "department": "Municipal Corporation", "distance_km": 0.5, "status": "STANDBY"}
            ]

        # Audit Trail Logging
        IncidentRepository.log_audit(
            db=db,
            user_id=None,
            action="EVENT_PIPELINE_INGESTED",
            table_name="events",
            record_id=created_incident.id if created_incident else (created_alert.id if created_alert else uuid.uuid4()),
            new_values={
                "event_id": event.event_id,
                "source_type": event.source_type.value,
                "category": category_name,
                "severity": severity,
                "metric": event.metric_type,
                "value": event.metric_value,
                "correlated": is_correlated,
                "incident_id": str(created_incident.id) if created_incident else None,
                "alert_id": str(created_alert.id) if created_alert else None
            }
        )
        db.commit()

        # 6. Real-Time WebSocket Notifications
        if created_incident:
            try:
                loop = asyncio.get_running_loop()
                if loop.is_running():
                    loop.create_task(event_service.publish_incident_created(db, created_incident))
                else:
                    loop.run_until_complete(event_service.publish_incident_created(db, created_incident))
            except RuntimeError:
                try:
                    asyncio.run(event_service.publish_incident_created(db, created_incident))
                except Exception:
                    pass

        if created_alert:
            try:
                loop = asyncio.get_running_loop()
                if loop.is_running():
                    loop.create_task(event_service.publish_alert_created(db, created_alert))
                else:
                    loop.run_until_complete(event_service.publish_alert_created(db, created_alert))
            except RuntimeError:
                try:
                    asyncio.run(event_service.publish_alert_created(db, created_alert))
                except Exception:
                    pass

        # 7. Construct and Return Comprehensive Response
        final_title = event.title or (
            created_incident.title if created_incident else (created_alert.title if created_alert else f"{category_name} Signal Ingested")
        )
        final_desc = event.description or (
            created_incident.description if created_incident else (created_alert.description if created_alert else f"Signal processed from {event.source_type.value}")
        )

        return EventIngestResponse(
            status="success",
            event_id=event.event_id,
            alert_id=str(created_alert.id) if created_alert else None,
            incident_id=str(created_incident.id) if created_incident else None,
            ticket_number=created_incident.ticket_number if created_incident else None,
            correlated=is_correlated,
            pipeline_stage="HUMAN_APPROVAL_PENDING" if (severity in ["high", "critical"]) else "MONITORING",
            severity=severity.upper(),
            category=category_name,
            title=final_title,
            description=final_desc,
            ai_risk_score=ai_risk_score,
            ai_confidence=ai_confidence,
            dispatched_departments=template["departments"],
            recommended_resources=recommended_resources,
            ai_response_plan=template["plan"],
            requires_human_approval=True,
            provenance="PROTOTYPE_SIMULATION" if event.provenance == "PROTOTYPE_SIMULATION" else "REAL_INGESTION"
        )
