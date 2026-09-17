"""
BharatOS Integration Schemas
============================
Data transfer objects matching BharatOS API Gateway endpoints:
- POST /api/v1/traffic/events/emergency-dispatch
- POST /api/v1/traffic/sync/incident
"""

import datetime
import uuid
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class EmergencyDispatchPayload(BaseModel):
    """Payload to trigger green corridor recommendation on BharatOS."""
    event_id: str = Field(default_factory=lambda: f"DISPATCH-{uuid.uuid4().hex[:8].upper()}")
    event_type: str = "EMERGENCY_DISPATCHED"
    timestamp: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())
    source: str = "BHARATOS_YOLO_SIMULATOR"
    resource_id: str = Field(default="RES-AMB-01", description="Authoritative or candidate resource ID")
    external_simulation_id: str = Field(default="AMB-021", description="Simulation vehicle identifier")
    vehicle_type: str = "AMBULANCE"
    origin: Dict[str, Any] = Field(default_factory=lambda: {"latitude": 17.7215, "longitude": 83.3055, "label": "Siripuram Junction"})
    destination: Dict[str, Any] = Field(default_factory=lambda: {"latitude": 17.7120, "longitude": 83.3180, "label": "King George Hospital (KGH)"})
    priority: str = "CRITICAL"
    route: List[str] = Field(default_factory=lambda: ["Siripuram Circle", "Asilmetta Flyover", "Jagadamba Center", "KGH Emergency Gate"])


class TrafficIncidentSyncPayload(BaseModel):
    """Payload to create or update an Incident record in BharatOS."""
    event_id: str = Field(default_factory=lambda: f"INC-{uuid.uuid4().hex[:8].upper()}")
    category: str = Field("traffic_accident", description="Category: traffic_accident, severe_congestion, road_blockage, etc.")
    title: str = Field(..., description="Incident title")
    description: str = Field(..., description="Detailed description of detected incident")
    latitude: float = Field(default=17.7215, description="Latitude")
    longitude: float = Field(default=83.3055, description="Longitude")
    address: Optional[str] = "Siripuram - Beach Road Corridor, Visakhapatnam"
    severity: str = Field("medium", description="Severity: low, medium, high, critical")
    status: str = Field("active", description="Status: active, resolved, closed")
    scenario_id: Optional[str] = "YOLO_VISION_PERCEPTION"
    extra_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
