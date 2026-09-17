"""
Traffic Incident & Event Generator
==================================
Translates raw traffic telemetry into structured BharatOS incident & dispatch events:
1. Emergency Vehicle Detected -> Emergency Dispatch / Green Corridor Request
2. Severe Traffic Jam -> Traffic Congestion Alert
3. Stalled Vehicle -> Road Hazard Incident
"""

from typing import Dict, Any, List, Optional
import uuid
import time
from pydantic import BaseModel, Field

from simulator.traffic_analyzer import TrafficAnalysisResult


class BharatOSEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: f"EVT-{uuid.uuid4().hex[:8].upper()}")
    event_type: str  # EMERGENCY_VEHICLE_DETECTED, CONGESTION_ALERT, ROAD_HAZARD
    timestamp: float = Field(default_factory=time.time)
    source: str = "BHARATOS_TRAFFIC_YOLO_SIMULATOR"
    provenance: str = "SIMULATED"
    payload: Dict[str, Any]


class IncidentGenerator:
    """
    Evaluates traffic states and emits structured event notifications.
    """

    def __init__(self, incident_cooldown_seconds: float = 10.0):
        self.cooldown = incident_cooldown_seconds
        self.last_event_times: Dict[str, float] = {}

    def evaluate_and_generate_events(
        self,
        analysis: TrafficAnalysisResult,
        latitude: float = 17.7215,
        longitude: float = 83.3055,
    ) -> List[BharatOSEvent]:
        """
        Check triggers and return list of actionable BharatOS events.
        """
        events: List[BharatOSEvent] = []
        now = time.time()

        # 1. Emergency Vehicle Event (Triggers BharatOS Green Corridor recommendation)
        if len(analysis.emergency_vehicles_detected) > 0:
            key = f"EMERGENCY_{analysis.camera_id}"
            if now - self.last_event_times.get(key, 0.0) >= self.cooldown:
                emerg = analysis.emergency_vehicles_detected[0]
                events.append(
                    BharatOSEvent(
                        event_type="EMERGENCY_VEHICLE_DETECTED",
                        payload={
                            "vehicle_id": f"AMB-{emerg.get('track_id', 101)}",
                            "vehicle_type": emerg.get("type", "AMBULANCE"),
                            "priority": "HIGH",
                            "camera_id": analysis.camera_id,
                            "junction_id": analysis.junction_id,
                            "latitude": latitude,
                            "longitude": longitude,
                            "speed_kmh": emerg.get("speed_kmh", 28.0),
                            "action_required": "ACTIVATE_GREEN_CORRIDOR",
                            "requires_hitl": True,
                            "notes": f"AI YOLO camera detected {emerg.get('type')} approaching junction with siren indicators.",
                        }
                    )
                )
                self.last_event_times[key] = now

        # 2. Severe Congestion Event (Triggers BharatOS Traffic Alert)
        if analysis.congestion_level in ["CONGESTED", "SEVERE"]:
            key = f"CONGESTION_{analysis.camera_id}"
            if now - self.last_event_times.get(key, 0.0) >= (self.cooldown * 2):
                events.append(
                    BharatOSEvent(
                        event_type="CONGESTION_ALERT",
                        payload={
                            "severity": "CRITICAL" if analysis.congestion_level == "SEVERE" else "HIGH",
                            "camera_id": analysis.camera_id,
                            "junction_id": analysis.junction_id,
                            "latitude": latitude,
                            "longitude": longitude,
                            "total_pcu": analysis.total_pcu,
                            "queue_length_vehicles": analysis.queue_count,
                            "average_speed_kmh": analysis.average_speed_kmh,
                            "title": f"High Traffic Congestion at {analysis.junction_id}",
                            "description": f"Approach density reached {analysis.total_pcu} PCU with queue of {analysis.queue_count} vehicles.",
                        }
                    )
                )
                self.last_event_times[key] = now

        # 3. Stalled Vehicle / Breakdown Incident (Triggers Municipal Incident)
        if analysis.stalled_vehicle_count > 0:
            key = f"STALLED_{analysis.camera_id}"
            if now - self.last_event_times.get(key, 0.0) >= (self.cooldown * 3):
                events.append(
                    BharatOSEvent(
                        event_type="ROAD_HAZARD",
                        payload={
                            "incident_type": "VEHICLE_BREAKDOWN",
                            "severity": "MEDIUM",
                            "camera_id": analysis.camera_id,
                            "junction_id": analysis.junction_id,
                            "latitude": latitude,
                            "longitude": longitude,
                            "stalled_vehicles": analysis.stalled_vehicle_count,
                            "title": f"Stationary Vehicle Hazard at {analysis.junction_id}",
                            "description": "YOLO tracker detected stationary vehicle blocking active traffic lane.",
                        }
                    )
                )
                self.last_event_times[key] = now

        return events
