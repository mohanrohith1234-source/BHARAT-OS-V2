"""
BharatOS IoT Event Adapter
==========================
Translates native IoT TelemetryData and BharatOSEvent instances from
bharatos-iot-module into StandardizedBharatOSEvent format consumed by BharatOS.
"""

import sys
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Union, Optional

# Add bharatos-iot-module to sys.path if not already present for modular importing
module_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "bharatos-iot-module"))
if module_dir not in sys.path:
    sys.path.insert(0, module_dir)

from app.schemas.events import (
    StandardizedBharatOSEvent,
    EventSourceType,
    EmergencyCategory,
)

# Mapping native IoT event types to BharatOS EmergencyCategory
EVENT_TYPE_TO_CATEGORY = {
    "WATER_LEVEL_ANOMALY": EmergencyCategory.FLOOD,
    "CLOUDBURST_ALERT": EmergencyCategory.FLOOD,
    "GAS_LEAK_ALERT": EmergencyCategory.HAZMAT_GAS,
    "SEISMIC_VIBRATION_ANOMALY": EmergencyCategory.EARTHQUAKE,
    "FIRE_SMOKE_ALERT": EmergencyCategory.FIRE,
    "TRAFFIC_CONGESTION": EmergencyCategory.TRAFFIC_DISRUPTION,
    "DEVICE_OFFLINE_FAULT": EmergencyCategory.INFRASTRUCTURE,
    "ENVIRONMENTAL_TELEMETRY": EmergencyCategory.GENERAL,
}


class IoTEventAdapter:
    """
    Adapter converting bharatos-iot-module payloads into StandardizedBharatOSEvent instances.
    """

    @staticmethod
    def adapt_bharatos_event(iot_evt: Any) -> StandardizedBharatOSEvent:
        """
        Converts a BharatOSEvent object from bharatos-iot-module into a StandardizedBharatOSEvent.
        """
        event_type = getattr(iot_evt, "event_type", "ENVIRONMENTAL_TELEMETRY")
        category = EVENT_TYPE_TO_CATEGORY.get(event_type, EmergencyCategory.GENERAL)

        source_device = "IOT-UNKNOWN"
        if hasattr(iot_evt, "source"):
            source_device = getattr(iot_evt.source, "device_id", "IOT-NODE-01")

        measurements = getattr(iot_evt, "measurements", {}) or {}

        # Determine primary metric type and value
        metric_type = None
        metric_value = None
        metric_unit = None

        if "water_level_cm" in measurements:
            metric_type = "water_level"
            metric_value = float(measurements["water_level_cm"])
            metric_unit = "cm"
        elif "smoke_gas_ppm" in measurements:
            metric_type = "co_gas_ppm"
            metric_value = float(measurements["smoke_gas_ppm"])
            metric_unit = "ppm"
        elif "vibration_g" in measurements:
            metric_type = "seismic_acceleration"
            metric_value = float(measurements["vibration_g"])
            metric_unit = "g"
        elif "rainfall_mm" in measurements:
            metric_type = "rainfall"
            metric_value = float(measurements["rainfall_mm"])
            metric_unit = "mm/hr"

        severity = getattr(iot_evt, "severity", "MEDIUM").lower()
        if severity not in ["low", "medium", "high", "critical"]:
            severity = "medium"

        lat = 17.72
        lon = 83.31
        if hasattr(iot_evt, "location"):
            lat = getattr(iot_evt.location, "lat", 17.72)
            lon = getattr(iot_evt.location, "lon", 83.31)

        return StandardizedBharatOSEvent(
            event_id=getattr(iot_evt, "event_id", f"EVT-{uuid.uuid4().hex[:6].upper()}"),
            source_type=EventSourceType.IOT_SIMULATOR,
            category=category,
            sensor_id=source_device,
            sensor_name=f"IoT Node ({source_device})",
            metric_type=metric_type,
            metric_value=metric_value,
            metric_unit=metric_unit,
            severity=severity,
            title=f"[{category.value.upper()}] IoT Alert from {source_device}",
            description=f"IoT Telemetry Anomaly ({event_type}): {metric_type}={metric_value} {metric_unit or ''}",
            latitude=lat,
            longitude=lon,
            address=f"Visakhapatnam Sector ({source_device})",
            evidence={
                "iot_event_type": event_type,
                "raw_measurements": measurements,
                "sensor_source": source_device,
            },
            timestamp=datetime.now(timezone.utc),
            provenance="PROTOTYPE_SIMULATION"
        )

    @staticmethod
    def adapt_telemetry(telemetry: Any) -> StandardizedBharatOSEvent:
        """
        Converts raw TelemetryData from bharatos-iot-module into a StandardizedBharatOSEvent.
        """
        device_id = getattr(telemetry, "device_id", "WL-NODE-01")
        zone_id = getattr(telemetry, "zone_id", "mvp-colony")
        water_level = getattr(telemetry, "water_level_cm", 0.0)
        condition = getattr(telemetry, "condition", "NORMAL")

        if condition == "CRITICAL" or water_level >= 100.0:
            severity = "critical"
            category = EmergencyCategory.FLOOD
        elif condition == "WARNING" or water_level >= 50.0:
            severity = "high"
            category = EmergencyCategory.FLOOD
        else:
            severity = "low"
            category = EmergencyCategory.GENERAL

        # Convert water level from cm to meters if needed for metric comparison
        water_level_m = round(water_level / 100.0, 2) if water_level > 10.0 else water_level

        return StandardizedBharatOSEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:6].upper()}",
            source_type=EventSourceType.IOT_SENSOR,
            category=category,
            sensor_id=device_id,
            sensor_name=f"Sensor Node {device_id} ({zone_id})",
            metric_type="water_level",
            metric_value=water_level_m,
            metric_unit="m",
            severity=severity,
            title=f"IoT Water Level Telemetry - {zone_id.upper()}",
            description=f"Water level reading: {water_level_m} m ({water_level} cm). Status: {condition}.",
            latitude=17.7210,
            longitude=83.3180,
            address=f"{zone_id.title()} Sector, Visakhapatnam",
            evidence={
                "device_id": device_id,
                "zone_id": zone_id,
                "water_level_cm": water_level,
                "rainfall_mm_hr": getattr(telemetry, "rainfall_mm_hr", 0.0),
                "condition": condition
            },
            timestamp=datetime.now(timezone.utc),
            provenance="PROTOTYPE_SIMULATION"
        )
