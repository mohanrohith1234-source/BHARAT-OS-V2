"""
Traffic Telemetry & Flow Analyzer
=================================
Aggregates microscopic YOLO detections into macroscopic road traffic telemetry:
- Vehicle counts by class
- Passenger Car Unit (PCU) equivalence
- Average flow velocity
- Queue estimation (< 5 km/h)
- Congestion classification (FREE_FLOW, MODERATE, CONGESTED, SEVERE)
- Stalled vehicle / hazard detection
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from yolo.tracker import ObjectDetection, TrackedObject
from yolo.config import PCU_FACTORS


class TrafficAnalysisResult(BaseModel):
    timestamp: float
    camera_id: str
    junction_id: str = "JUNCTION-01"
    total_vehicles: int
    vehicle_counts: Dict[str, int]
    total_pcu: float
    average_speed_kmh: float
    queue_count: int
    congestion_level: str  # FREE_FLOW, MODERATE, CONGESTED, SEVERE
    stalled_vehicle_count: int
    emergency_vehicles_detected: List[Dict[str, Any]] = Field(default_factory=list)
    active_tracks_count: int
    provenance: str = "SIMULATED"


class TrafficAnalyzer:
    """
    Analyzes frame-level tracking data to produce macroscopic traffic intelligence.
    """

    def __init__(
        self,
        queue_speed_cutoff_kmh: float = 5.0,
        stalled_dwell_cutoff_s: float = 12.0,
    ):
        self.queue_speed_cutoff_kmh = queue_speed_cutoff_kmh
        self.stalled_dwell_cutoff_s = stalled_dwell_cutoff_s

    def analyze(
        self,
        camera_id: str,
        junction_id: str,
        detections: List[ObjectDetection],
        tracked_objects: List[TrackedObject],
        timestamp: float,
    ) -> TrafficAnalysisResult:
        """
        Process current frame detections and tracks to produce traffic metrics.
        """
        # Count vehicle categories
        counts: Dict[str, int] = {
            "car": 0,
            "motorcycle": 0,
            "bus": 0,
            "truck": 0,
            "bicycle": 0,
            "pedestrian": 0,
        }

        for d in detections:
            c = d.class_name.lower()
            if c in counts:
                counts[c] += 1
            else:
                counts["car"] += 1

        # Calculate Total PCU
        total_pcu = sum(counts[k] * PCU_FACTORS.get(k, 1.0) for k in counts)

        # Average speed and queue analysis from active tracks
        speeds = [t.speed_kmh for t in tracked_objects if t.speed_kmh > 0]
        avg_speed = float(sum(speeds) / len(speeds)) if len(speeds) > 0 else 32.0

        # Queuing vehicles (speed < 5 km/h)
        queue_count = sum(1 for t in tracked_objects if t.speed_kmh < self.queue_speed_cutoff_kmh)

        # Stalled vehicles (stopped in lane for extended dwell duration)
        stalled_count = sum(
            1 for t in tracked_objects
            if t.speed_kmh < 2.0 and t.dwell_time_s >= self.stalled_dwell_cutoff_s
        )

        # Emergency vehicles
        emergencies = []
        for t in tracked_objects:
            if t.is_emergency or t.emergency_type != "NONE":
                emergencies.append({
                    "track_id": t.track_id,
                    "type": t.emergency_type if t.emergency_type != "NONE" else "AMBULANCE",
                    "speed_kmh": t.speed_kmh,
                    "position": t.anchor_point,
                })

        # Congestion classification based on PCU density and velocity
        if total_pcu > 25.0 or avg_speed < 8.0:
            congestion_level = "SEVERE"
        elif total_pcu > 15.0 or avg_speed < 16.0:
            congestion_level = "CONGESTED"
        elif total_pcu > 8.0 or avg_speed < 25.0:
            congestion_level = "MODERATE"
        else:
            congestion_level = "FREE_FLOW"

        return TrafficAnalysisResult(
            timestamp=timestamp,
            camera_id=camera_id,
            junction_id=junction_id,
            total_vehicles=len(detections),
            vehicle_counts=counts,
            total_pcu=round(total_pcu, 1),
            average_speed_kmh=round(avg_speed, 1),
            queue_count=queue_count,
            congestion_level=congestion_level,
            stalled_vehicle_count=stalled_count,
            emergency_vehicles_detected=emergencies,
            active_tracks_count=len(tracked_objects),
            provenance="SIMULATED",
        )
