"""
Pydantic Schemas for Hyper-Local Nowcasting, Risk Assessment, and Early Warning.
Supports SIH 2026 Problem Statement: AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting.
"""

from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

ProvenanceType = Literal[
    'LIVE', 
    'REAL_IOT', 
    'VERIFIED', 
    'HISTORICAL', 
    'SIMULATION', 
    'AI_DERIVED', 
    'CACHED'
]

RiskLevel = Literal['SAFE', 'CAUTION', 'HIGH', 'VERY HIGH', 'CRITICAL']

class WeatherObservation(BaseModel):
    station_id: str = "IMD-VIZAG-RADAR"
    rainfall_mm_hr: float = 0.0
    rainfall_trend: Literal['STABLE', 'INCREASING', 'RAPIDLY_INCREASING', 'DECREASING'] = 'STABLE'
    temperature_c: float = 28.5
    humidity_pct: float = 85.0
    wind_speed_kmh: float = 24.0
    radar_dbz: float = 35.0
    provenance: ProvenanceType = 'VERIFIED'
    observed_at: datetime = Field(default_factory=datetime.utcnow)

class SensorObservation(BaseModel):
    sensor_id: str
    name: str
    location: str
    water_level_cm: float
    threshold_cm: float
    drain_level_pct: float
    flow_rate_lps: float
    sensor_health: Literal['OPTIMAL', 'DEGRADED', 'WARNING', 'CRITICAL'] = 'OPTIMAL'
    battery_pct: float = 95.0
    provenance: ProvenanceType = 'REAL_IOT'
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TimeHorizonStep(BaseModel):
    time_offset: Literal['NOW', '+15 MIN', '+30 MIN', '+60 MIN']
    minutes_ahead: int
    rainfall_rate_mm_hr: float
    water_level_cm: float
    risk_level: RiskLevel
    risk_score: float = Field(ge=0.0, le=100.0)
    drainage_capacity_pct: float
    predicted_impact: str
    recommended_action: str
    model_score: float = 88.5
    provenance: ProvenanceType = 'AI_DERIVED'

class WardRiskAssessment(BaseModel):
    ward_id: str = "WARD-12"
    ward_name: str = "Ward 12 (MVP Colony & RK Beach Outfall)"
    district: str = "Visakhapatnam"
    state_name: str = "Andhra Pradesh"
    current_risk_level: RiskLevel
    current_risk_score: float
    horizon_steps: List[TimeHorizonStep]
    risk_factors: List[str]
    why_risk_increasing: List[str]
    predicted_impacts: Dict[str, Any]
    provenance: ProvenanceType = 'AI_DERIVED'
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class EarlyWarning(BaseModel):
    id: str
    title: str
    ward_id: str
    ward_name: str
    severity: RiskLevel
    time_horizon: str
    expected_impact: str
    target_audiences: List[str]
    recommended_preparedness: List[str]
    requires_human_approval: bool = True
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    provenance: ProvenanceType = 'AI_DERIVED'
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PreparednessAction(BaseModel):
    id: str
    action_type: Literal['PREPOSITION_PUMP', 'TRAFFIC_DIVERSION', 'AMBULANCE_CORRIDOR', 'CITIZEN_ALERT', 'SHELTER_STANDBY']
    title: str
    description: str
    resource_id: Optional[str] = None
    target_zone: str
    status: Literal['RECOMMENDED', 'APPROVED', 'EXECUTED', 'CANCELLED'] = 'RECOMMENDED'
    human_signed_by: Optional[str] = None
    signed_at: Optional[datetime] = None
    provenance: ProvenanceType = 'AI_DERIVED'

class HumanApprovalRequest(BaseModel):
    action_id: str
    officer_name: str
    officer_badge: str
    decision: Literal['AUTHORIZE', 'REJECT', 'MODIFY']
    notes: Optional[str] = None
