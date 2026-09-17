import uuid
import asyncio
from datetime import datetime, timedelta, UTC
from typing import Optional, Dict, Any, List
from sqlalchemy import select, and_, or_

from app.models.models import TelemetryRecord, DigitalTwinNode, Alert
from app.services.alert_service import AlertService
from app.repositories.alert_repository import AlertRepository

ALERT_RULES = {
    "water_level": {
        "metric": "water_level",
        "category": "WATER_LEVEL",
        "incident_category": "Flood",
        "thresholds": [
            {"min_value": 4.5, "severity": "CRITICAL", "title": "Critical Flooding Alert", "description": "Water level breached critical threshold"},
            {"min_value": 4.0, "severity": "HIGH", "title": "High Water Level Alert", "description": "Water level breached warning threshold"}
        ]
    },
    "aqi": {
        "metric": "aqi",
        "category": "AIR_QUALITY",
        "incident_category": "Air Quality",
        "thresholds": [
            {"min_value": 300.0, "severity": "CRITICAL", "title": "Severe AQI Alert", "description": "AQI level is hazardous"},
            {"min_value": 200.0, "severity": "HIGH", "title": "Poor AQI Alert", "description": "AQI level is unhealthy"}
        ]
    },
    "temperature": {
        "metric": "temperature",
        "category": "WEATHER",
        "incident_category": "Fire",
        "thresholds": [
            {"min_value": 55.0, "severity": "CRITICAL", "title": "Extreme Heat & Fire Risk Alert", "description": "Critical ambient temperature recorded"},
            {"min_value": 42.0, "severity": "HIGH", "title": "High Heat Alert", "description": "Warning level ambient temperature recorded"}
        ]
    },
    "smoke_density": {
        "metric": "smoke_density",
        "category": "FIRE",
        "incident_category": "Fire",
        "thresholds": [
            {"min_value": 60.0, "severity": "CRITICAL", "title": "Critical Smoke Density Alert", "description": "Dense combustion particulate detected"},
            {"min_value": 35.0, "severity": "HIGH", "title": "Elevated Smoke Warning", "description": "Smoke density breached warning threshold"}
        ]
    },
    "co_gas_ppm": {
        "metric": "co_gas_ppm",
        "category": "HAZMAT",
        "incident_category": "Hazardous Material",
        "thresholds": [
            {"min_value": 150.0, "severity": "CRITICAL", "title": "Critical Toxic Gas Alert", "description": "Lethal toxic gas concentration detected"},
            {"min_value": 50.0, "severity": "HIGH", "title": "Hazardous Gas Leak Warning", "description": "Gas concentration breached threshold"}
        ]
    },
    "gas_leak": {
        "metric": "gas_leak",
        "category": "HAZMAT",
        "incident_category": "Hazardous Material",
        "thresholds": [
            {"min_value": 150.0, "severity": "CRITICAL", "title": "Critical Toxic Gas Alert", "description": "Lethal toxic gas concentration detected"},
            {"min_value": 50.0, "severity": "HIGH", "title": "Hazardous Gas Leak Warning", "description": "Gas concentration breached threshold"}
        ]
    },
    "seismic_acceleration": {
        "metric": "seismic_acceleration",
        "category": "SEISMIC",
        "incident_category": "Earthquake",
        "thresholds": [
            {"min_value": 0.35, "severity": "CRITICAL", "title": "Critical Seismic Acceleration Alert", "description": "Severe ground shaking detected"},
            {"min_value": 0.15, "severity": "HIGH", "title": "Seismic Activity Warning", "description": "Elevated ground vibration detected"}
        ]
    },
    "traffic_congestion_pct": {
        "metric": "traffic_congestion_pct",
        "category": "TRAFFIC",
        "incident_category": "Traffic Disruption",
        "thresholds": [
            {"min_value": 85.0, "severity": "CRITICAL", "title": "Severe Traffic Gridlock Alert", "description": "Corridor gridlock detected"},
            {"min_value": 70.0, "severity": "HIGH", "title": "Heavy Congestion Warning", "description": "Traffic flow rate severely degraded"}
        ]
    },
    "traffic_congestion": {
        "metric": "traffic_congestion",
        "category": "TRAFFIC",
        "incident_category": "Traffic Disruption",
        "thresholds": [
            {"min_value": 85.0, "severity": "CRITICAL", "title": "Severe Traffic Gridlock Alert", "description": "Corridor gridlock detected"},
            {"min_value": 70.0, "severity": "HIGH", "title": "Heavy Congestion Warning", "description": "Traffic flow rate severely degraded"}
        ]
    }
}

class AlertRuleService:
    @staticmethod
    def evaluate_telemetry(db, telemetry: TelemetryRecord) -> Optional[Alert]:
        """Evaluate a single telemetry record against deterministic rules and generate an Alert if threshold is breached."""
        metric = telemetry.metric_type
        if metric not in ALERT_RULES:
            return None

        rule_config = ALERT_RULES[metric]
        matched_threshold = None
        
        # Sort thresholds descending by min_value to match highest breach first
        sorted_thresholds = sorted(rule_config["thresholds"], key=lambda x: x["min_value"], reverse=True)
        for t in sorted_thresholds:
            if telemetry.value >= t["min_value"]:
                matched_threshold = t
                break

        if not matched_threshold:
            return None

        # Resolve geographic info from telemetry node
        node = db.get(DigitalTwinNode, telemetry.node_id)
        if not node:
            return None

        source = "REAL_IOT" if getattr(telemetry, "source_type", None) == "REAL_IOT" else "SIMULATED"
        if source == "REAL_IOT":
            title = f"[REAL IoT] {matched_threshold['title']} at {node.name}"
        else:
            title = f"[SIMULATED] {matched_threshold['title']} at {node.name}"

        description = f"{matched_threshold['description']}: {telemetry.value}{telemetry.unit or ''} at sensor '{node.name}' (Node ID: {node.id})."
        severity = matched_threshold["severity"]
        category = rule_config["category"]

        # Deduplication Strategy:
        # Check if there is an already ACTIVE or ACKNOWLEDGED alert for this category/city/node recently
        repo = AlertRepository(db)
        existing_stmt = select(Alert).where(
            and_(
                Alert.city_id == node.city_id,
                Alert.category == category,
                or_(
                    Alert.status == "ACTIVE",
                    Alert.status == "ACKNOWLEDGED"
                ),
                Alert.title == title
            )
        )
        existing_alerts = list(db.execute(existing_stmt).scalars().all())

        if existing_alerts:
            # Duplicate found! Update/retain the existing alert instead of creating a duplicate
            existing_alert = existing_alerts[0]
            # Update description with latest value and extend expiration
            update_data = {
                "description": description,
                "expires_at": datetime.utcnow() + timedelta(hours=2)
            }
            repo.update_alert(existing_alert, data=update_data)
            db.commit()
            return existing_alert

        # No duplicate, create a new alert
        alert_data = {
            "title": title,
            "description": description,
            "severity": severity,
            "category": category,
            "state_id": node.state_id,
            "city_id": node.city_id,
            "source": source,
            "status": "ACTIVE",
            "expires_at": datetime.utcnow() + timedelta(hours=2)
        }

        # We need a system/user context or bypass RBAC check for telemetry ingestion.
        # We can construct a system dummy User or call repo.create_alert directly.
        # Since it's system-generated telemetry, calling repo.create_alert directly is clean and safe,
        # but let's make sure it is auditable or logged.
        new_alert = repo.create_alert(data=alert_data)
        
        # Log system action to audit log
        from app.repositories.incident_repository import IncidentRepository
        IncidentRepository.log_audit(
            db=db,
            user_id=None,  # system-generated
            action="ALERT_CREATED",
            table_name="alerts",
            record_id=new_alert.id,
            new_values={
                "title": new_alert.title,
                "severity": new_alert.severity,
                "category": new_alert.category,
                "source": source,
                "telemetry_record_id": str(telemetry.id)
            }
        )
        db.commit()

        # Check and create automatic incident for real IoT alerts
        if source == "REAL_IOT" and severity in ["HIGH", "CRITICAL"]:
            from app.models.models import Incident
            from app.services.incident_service import IncidentService
            from app.schemas.schemas import IncidentCreate
            
            # Dynamic category & title determination
            rule_info = ALERT_RULES.get(metric, {})
            inc_category = rule_info.get("incident_category", "Flood" if metric == "water_level" else "General Emergency")
            
            if metric == "water_level":
                inc_title = f"[REAL IoT ALERT] Critical water level at {node.name}"
                inc_desc = f"Automatic flood incident generated by BHARATOS IoT sensor '{node.name}'. Reading: {telemetry.value}{telemetry.unit or ''}."
            else:
                inc_title = f"[REAL IoT ALERT] {matched_threshold['title']} at {node.name}"
                inc_desc = f"Automatic {inc_category.lower()} incident generated by BHARATOS sensor '{node.name}'. Reading: {telemetry.value}{telemetry.unit or ''}."

            # Deduplication check: check if an active (non-resolved) incident already exists for this node
            existing_incident = db.query(Incident).filter(
                Incident.status != "resolved",
                Incident.title == inc_title
            ).first()
            
            if not existing_incident:
                # Create automatic incident
                incident_in = IncidentCreate(
                    category=inc_category,
                    title=inc_title,
                    description=inc_desc,
                    latitude=node.latitude,
                    longitude=node.longitude,
                    address=node.name,
                    severity=severity.lower(),
                    zone_id=None,
                    ward_id=None,
                    image_urls=[]
                )
                # Create using IncidentService
                incident = IncidentService.create_incident(db, incident_in, citizen_id=None)
                db.commit()
                db.refresh(incident)
                
                # Publish incident created WebSocket event
                from app.realtime.event_service import event_service
                try:
                    loop = asyncio.get_running_loop()
                    if loop.is_running():
                        loop.create_task(event_service.publish_incident_created(db, incident))
                    else:
                        loop.run_until_complete(event_service.publish_incident_created(db, incident))
                except RuntimeError:
                    asyncio.run(event_service.publish_incident_created(db, incident))

        return new_alert
