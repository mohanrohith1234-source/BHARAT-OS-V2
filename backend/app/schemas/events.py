import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict

class EventSourceType(str, Enum):
    IOT_SENSOR = "IOT_SENSOR"
    IOT_SIMULATOR = "IOT_SIMULATOR"
    CCTV_YOLO = "CCTV_YOLO"
    CITIZEN_SOS = "CITIZEN_SOS"
    CITIZEN_REPORT = "CITIZEN_REPORT"
    EXTERNAL_API = "EXTERNAL_API"
    OFFICER_INPUT = "OFFICER_INPUT"

class EmergencyCategory(str, Enum):
    FLOOD = "Flood"
    FIRE = "Fire"
    EARTHQUAKE = "Earthquake"
    ACCIDENT = "Accident"
    TRAFFIC_DISRUPTION = "Traffic Disruption"
    HAZMAT_GAS = "Hazardous Material"
    CYCLONE = "Cyclone"
    INFRASTRUCTURE = "Infrastructure Damage"
    GENERAL = "General Emergency"

class YoloDetection(BaseModel):
    class_name: str = Field(..., description="e.g. waterlogged_vehicle, accident_collision, congestion_queue, fire_smoke")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0.0 - 1.0")
    bbox: Optional[List[float]] = Field(None, description="Bounding box [x1, y1, x2, y2]")

class CCTVYoloEvidence(BaseModel):
    camera_id: str
    camera_location_name: Optional[str] = None
    frame_timestamp: Optional[datetime] = None
    image_url: Optional[str] = None
    detections: List[YoloDetection] = []
    congestion_index: Optional[float] = None
    vehicle_count: Optional[int] = None
    speed_estimate_kmh: Optional[float] = None

class StandardizedBharatOSEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_type: EventSourceType = Field(..., description="Origin source of event")
    category: EmergencyCategory = Field(default=EmergencyCategory.GENERAL)
    sensor_id: Optional[str] = None
    sensor_name: Optional[str] = None
    metric_type: Optional[str] = Field(None, description="e.g. water_level, smoke_density, co_gas_ppm, seismic_acceleration, traffic_congestion_pct, temperature")
    metric_value: Optional[float] = None
    metric_unit: Optional[str] = None
    severity: str = Field(default="medium", description="critical, high, medium, low")
    title: Optional[str] = None
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    address: Optional[str] = None
    evidence: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Vision bounding boxes, CCTV metadata, or raw sensor payload")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    provenance: str = Field(default="PROTOTYPE_SIMULATION", description="PROTOTYPE_SIMULATION or REAL_INGESTION")

    model_config = ConfigDict(from_attributes=True)

class EventIngestResponse(BaseModel):
    status: str
    event_id: str
    alert_id: Optional[str] = None
    incident_id: Optional[str] = None
    ticket_number: Optional[str] = None
    correlated: bool = False
    pipeline_stage: str
    severity: str
    category: str
    title: str
    description: str
    ai_risk_score: Optional[float] = None
    ai_confidence: Optional[float] = None
    dispatched_departments: List[str] = []
    recommended_resources: List[Dict[str, Any]] = []
    ai_response_plan: List[str] = []
    requires_human_approval: bool = True
    provenance: str = "PROTOTYPE_SIMULATION"

class IoTSimulationRequest(BaseModel):
    preset: Optional[str] = Field(None, description="Preset identifier e.g. BEACH_ROAD_FLOOD, DABA_GARDENS_FIRE, GAJUWAKA_GAS_LEAK, SIRIPURAM_EARTHQUAKE, NH16_TRAFFIC_CONGESTION")
    sensor_id: Optional[str] = None
    sensor_name: Optional[str] = None
    source_type: EventSourceType = Field(default=EventSourceType.IOT_SIMULATOR)
    category: Optional[EmergencyCategory] = None
    metric_type: str = Field(..., description="water_level, smoke_density, co_gas_ppm, seismic_acceleration, traffic_congestion_pct, temperature")
    metric_value: float = Field(..., description="Telemetry reading value")
    metric_unit: Optional[str] = None
    latitude: Optional[float] = 17.7126
    longitude: Optional[float] = 83.3242
    address: Optional[str] = "Visakhapatnam Operations Zone"
    evidence: Optional[Dict[str, Any]] = None
