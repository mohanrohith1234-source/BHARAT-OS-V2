import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from telemetry.schemas import TelemetryData
from vizag_context.zones import get_zone_by_id

class EventSource(BaseModel):
    type: str = "iot"
    device_id: str

class EventLocation(BaseModel):
    lat: float
    lon: float

class BharatOSEvent(BaseModel):
    event_id: str
    source: EventSource
    event_type: str
    location: EventLocation
    measurements: Dict[str, Any]
    severity: str
    timestamp: str

class EventGenerator:
    """
    Translates raw telemetry or anomaly triggers into clean, standardized BharatOS events.
    """
    
    _counter: int = 1

    @classmethod
    def generate_event_id(cls) -> str:
        eid = f"EVT-{cls._counter:03d}"
        cls._counter += 1
        return eid

    @classmethod
    def from_telemetry(
        cls,
        telemetry: TelemetryData,
        event_type: Optional[str] = None,
        override_severity: Optional[str] = None
    ) -> BharatOSEvent:
        # Determine event type if not provided
        if not event_type:
            if telemetry.water_level_cm >= 90.0:
                event_type = "WATER_LEVEL_ANOMALY"
            elif telemetry.rainfall_mm_hr >= 50.0:
                event_type = "CLOUDBURST_ALERT"
            elif telemetry.smoke_gas_ppm and telemetry.smoke_gas_ppm > 150.0:
                event_type = "GAS_LEAK_ALERT"
            elif telemetry.vibration_g and telemetry.vibration_g > 2.5:
                event_type = "SEISMIC_VIBRATION_ANOMALY"
            elif not telemetry.online:
                event_type = "DEVICE_OFFLINE_FAULT"
            else:
                event_type = "ENVIRONMENTAL_TELEMETRY"

        # Lookup lat/lon from Vizag context
        zone_info = get_zone_by_id(telemetry.zone_id)
        if zone_info:
            center = zone_info.get("center", [17.72, 83.31])
            lat, lon = center[0], center[1]
        else:
            lat, lon = 17.72, 83.31

        # Determine severity
        if override_severity:
            severity = override_severity
        else:
            if telemetry.condition == "CRITICAL" or telemetry.water_level_cm >= 100.0:
                severity = "HIGH"
            elif telemetry.condition in ("WARNING", "ABNORMAL") or telemetry.water_level_cm >= 50.0:
                severity = "MEDIUM"
            elif telemetry.condition == "FAULT":
                severity = "MEDIUM"
            else:
                severity = "LOW"

        measurements = {
            "water_level_cm": telemetry.water_level_cm,
            "rainfall_mm": telemetry.rainfall_mm_hr,
            "soil_moisture": telemetry.soil_moisture,
            "temperature_c": telemetry.temperature_c,
            "humidity_pct": telemetry.humidity_pct,
            "pressure_hpa": telemetry.pressure_hpa,
        }
        if telemetry.smoke_gas_ppm:
            measurements["smoke_gas_ppm"] = telemetry.smoke_gas_ppm
        if telemetry.vibration_g:
            measurements["vibration_g"] = telemetry.vibration_g

        return BharatOSEvent(
            event_id=cls.generate_event_id(),
            source=EventSource(type="iot", device_id=telemetry.device_id),
            event_type=event_type,
            location=EventLocation(lat=lat, lon=lon),
            measurements=measurements,
            severity=severity,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
