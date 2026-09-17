from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

SensorCondition = Literal["NORMAL", "ABNORMAL", "WARNING", "CRITICAL", "FAULT"]

class TelemetryData(BaseModel):
    device_id: str = Field(..., description="Unique hardware or simulated device identifier")
    zone_id: str = Field(..., description="Geographic zone identifier (e.g., poorna-market, gajuwaka)")
    timestamp: datetime = Field(default_factory=datetime.now)
    online: bool = True
    
    # Environmental / Hydrological Metrics
    water_level_cm: float = Field(..., ge=0, description="Water level / inundation depth in cm")
    rainfall_mm_hr: float = Field(..., ge=0, description="Rainfall intensity in mm/hr")
    soil_moisture: float = Field(..., ge=0.0, le=1.0, description="Soil saturation ratio (0.0 to 1.0)")
    temperature_c: float = Field(..., description="Ambient temperature in °C")
    humidity_pct: float = Field(..., ge=0.0, le=100.0, description="Relative humidity percentage")
    pressure_hpa: float = Field(..., ge=900.0, le=1100.0, description="Atmospheric pressure in hPa")
    
    # Safety & Structural Metrics
    smoke_gas_ppm: Optional[float] = Field(default=0.0, ge=0.0, description="Gas / smoke concentration in ppm")
    vibration_g: Optional[float] = Field(default=0.0, ge=0.0, description="Vibration acceleration level in g")
    
    # Sensor State
    condition: SensorCondition = "NORMAL"
    battery_pct: Optional[float] = Field(default=98.0, ge=0.0, le=100.0)
    rssi_dbm: Optional[int] = Field(default=-62, description="Signal strength RSSI in dBm")
