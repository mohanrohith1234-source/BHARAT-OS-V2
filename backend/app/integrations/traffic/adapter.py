"""
BharatOS Traffic Event Adapter
==============================
Translates traffic perception outputs, YOLO detections, and simulation payloads
into StandardizedBharatOSEvent format.
"""

import sys
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Add bharatos-traffic-simulation to sys.path for modular access
module_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "bharatos-traffic-simulation"))
if module_dir not in sys.path:
    sys.path.insert(0, module_dir)

from app.schemas.events import (
    StandardizedBharatOSEvent,
    EventSourceType,
    EmergencyCategory,
)


class TrafficEventAdapter:
    """
    Adapter converting traffic simulation events into StandardizedBharatOSEvent instances.
    """

    @staticmethod
    def adapt_emergency_dispatch(
        vehicle_type: str = "AMBULANCE",
        resource_id: str = "RES-AMB-01",
        simulation_id: str = "AMB-021",
        route: Optional[list] = None,
        origin: Optional[dict] = None,
        destination: Optional[dict] = None,
    ) -> StandardizedBharatOSEvent:
        route_str = " -> ".join(route) if route else "Siripuram Circle -> KGH Emergency Gate"
        return StandardizedBharatOSEvent(
            event_id=f"DISPATCH-{uuid.uuid4().hex[:8].upper()}",
            source_type=EventSourceType.CCTV_YOLO,
            category=EmergencyCategory.TRAFFIC_DISRUPTION,
            severity="critical",
            title=f"🚨 EMERGENCY GREEN CORRIDOR: {vehicle_type} ({resource_id})",
            description=f"YOLO Vision emergency vehicle detected ({simulation_id}). Transit route: {route_str}.",
            latitude=origin.get("latitude", 17.7215) if origin else 17.7215,
            longitude=origin.get("longitude", 83.3055) if origin else 83.3055,
            address=origin.get("label", "Siripuram Junction") if origin else "Siripuram Junction",
            evidence={
                "vehicle_type": vehicle_type,
                "resource_id": resource_id,
                "simulation_id": simulation_id,
                "route": route,
                "origin": origin,
                "destination": destination,
            },
            timestamp=datetime.now(timezone.utc),
            provenance="PROTOTYPE_SIMULATION"
        )

    @staticmethod
    def adapt_traffic_analysis(
        camera_id: str,
        junction_id: str,
        total_pcu: float,
        congestion_level: str,
        emergency_detected: bool = False,
    ) -> StandardizedBharatOSEvent:
        severity = "critical" if emergency_detected else ("high" if congestion_level in ["HEAVY", "GRIDLOCK"] else "medium")
        category = EmergencyCategory.TRAFFIC_DISRUPTION

        return StandardizedBharatOSEvent(
            event_id=f"TRAFFIC-{uuid.uuid4().hex[:8].upper()}",
            source_type=EventSourceType.CCTV_YOLO,
            category=category,
            sensor_id=camera_id,
            sensor_name=f"Traffic Camera ({camera_id})",
            metric_type="traffic_congestion_pct",
            metric_value=min(100.0, total_pcu * 5.0),
            metric_unit="%",
            severity=severity,
            title=f"Traffic Analysis Alert: {junction_id} [{congestion_level}]",
            description=f"Camera {camera_id} at {junction_id} reported density {total_pcu:.1f} PCU ({congestion_level}).",
            latitude=17.7215,
            longitude=83.3055,
            address=f"{junction_id}, Visakhapatnam",
            evidence={
                "camera_id": camera_id,
                "junction_id": junction_id,
                "total_pcu": total_pcu,
                "congestion_level": congestion_level,
                "emergency_detected": emergency_detected,
            },
            timestamp=datetime.now(timezone.utc),
            provenance="PROTOTYPE_SIMULATION"
        )
