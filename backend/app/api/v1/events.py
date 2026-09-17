import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.events import (
    StandardizedBharatOSEvent,
    EventIngestResponse,
    IoTSimulationRequest,
    EventSourceType,
    EmergencyCategory,
)
from app.services.event_pipeline_service import EventPipelineService

router = APIRouter(prefix="/events", tags=["events"])

# Sensor simulation presets
IOT_PRESETS = [
    {
        "id": "BEACH_ROAD_FLOOD",
        "name": "Beach Road Storm Drain Sump #4",
        "category": EmergencyCategory.FLOOD,
        "metric_type": "water_level",
        "metric_unit": "m",
        "normal_value": 1.8,
        "warning_threshold": 4.0,
        "critical_threshold": 4.5,
        "default_sim_value": 4.8,
        "latitude": 17.7126,
        "longitude": 83.3242,
        "address": "Beach Road Sector 4 / MVP Sump Outfall, Visakhapatnam",
        "description": "Submersible ultrasonic water level sensor measuring drainage culvert inundation."
    },
    {
        "id": "DABA_GARDENS_FIRE",
        "name": "Daba Gardens Commercial Complex Smoke & Thermal Node",
        "category": EmergencyCategory.FIRE,
        "metric_type": "smoke_density",
        "metric_unit": "%",
        "normal_value": 5.0,
        "warning_threshold": 35.0,
        "critical_threshold": 60.0,
        "default_sim_value": 78.0,
        "latitude": 17.7180,
        "longitude": 83.3015,
        "address": "Daba Gardens 3rd Lane Commercial Center, Visakhapatnam",
        "description": "Optical photoelectric ionization smoke gauge detecting structural fire outbreak."
    },
    {
        "id": "GAJUWAKA_GAS_LEAK",
        "name": "Gajuwaka Industrial Corridors Gas Analyzer",
        "category": EmergencyCategory.HAZMAT_GAS,
        "metric_type": "co_gas_ppm",
        "metric_unit": "ppm",
        "normal_value": 12.0,
        "warning_threshold": 50.0,
        "critical_threshold": 150.0,
        "default_sim_value": 185.0,
        "latitude": 17.6888,
        "longitude": 83.2185,
        "address": "Gajuwaka Chemical Storage Cluster Phase II, Visakhapatnam",
        "description": "Electrochemical multi-gas sensor detecting hazardous chemical release."
    },
    {
        "id": "SIRIPURAM_EARTHQUAKE",
        "name": "Siripuram Junction Structural Accelerometer",
        "category": EmergencyCategory.EARTHQUAKE,
        "metric_type": "seismic_acceleration",
        "metric_unit": "g",
        "normal_value": 0.02,
        "warning_threshold": 0.15,
        "critical_threshold": 0.35,
        "default_sim_value": 0.42,
        "latitude": 17.7230,
        "longitude": 83.3160,
        "address": "Siripuram Junction Elevated Flyover Pier 7, Visakhapatnam",
        "description": "Tri-axial MEMS seismic accelerometer measuring structural tremor acceleration."
    },
    {
        "id": "NH16_TRAFFIC_CONGESTION",
        "name": "NH16 & Maddilapalem Smart CCTV Flow Monitor",
        "category": EmergencyCategory.TRAFFIC_DISRUPTION,
        "metric_type": "traffic_congestion_pct",
        "metric_unit": "%",
        "normal_value": 30.0,
        "warning_threshold": 70.0,
        "critical_threshold": 85.0,
        "default_sim_value": 92.0,
        "latitude": 17.7345,
        "longitude": 83.3180,
        "address": "NH16 Bypass & Maddilapalem Flyover Ramp, Visakhapatnam",
        "description": "Vision edge node calculating vehicular density and traffic blockage."
    }
]

@router.get("/presets")
def get_sensor_presets():
    """Returns curated realistic sensor presets for the IoT Simulation Console."""
    return {
        "status": "success",
        "presets": IOT_PRESETS,
        "total": len(IOT_PRESETS),
        "provenance": "PROTOTYPE_SIMULATION"
    }

@router.post("/ingest", response_model=EventIngestResponse, status_code=status.HTTP_201_CREATED)
def ingest_standard_event(
    event: StandardizedBharatOSEvent,
    db: Session = Depends(get_db),
):
    """
    Standardized BharatOS Event Ingestion Gateway.
    Device-agnostic ingestion endpoint for IoT sensors, CCTV/YOLO systems, Citizen SOS, and APIs.
    """
    try:
        response = EventPipelineService.process_event(db=db, event=event)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Event ingestion pipeline failed: {str(e)}"
        )

@router.post("/simulate-iot", response_model=EventIngestResponse, status_code=status.HTTP_201_CREATED)
def simulate_iot_event(
    req: IoTSimulationRequest,
    db: Session = Depends(get_db),
):
    """
    IoT Simulation Console Gateway.
    Fires realistic multi-sensor telemetry directly through the full BharatOS backend pipeline.
    """
    # Resolve preset defaults if specified
    matched_preset = None
    if req.preset:
        matched_preset = next((p for p in IOT_PRESETS if p["id"] == req.preset), None)

    category = req.category or (matched_preset["category"] if matched_preset else EmergencyCategory.GENERAL)
    sensor_name = req.sensor_name or (matched_preset["name"] if matched_preset else "Simulated Edge Node")
    sensor_id = req.sensor_id or (matched_preset["id"] if matched_preset else f"NODE-SIM-{uuid.uuid4().hex[:6].upper()}")
    latitude = req.latitude or (matched_preset["latitude"] if matched_preset else 17.7126)
    longitude = req.longitude or (matched_preset["longitude"] if matched_preset else 83.3242)
    address = req.address or (matched_preset["address"] if matched_preset else "Visakhapatnam Operations Zone")
    unit = req.metric_unit or (matched_preset["metric_unit"] if matched_preset else "")

    # Construct StandardizedBharatOSEvent
    event = StandardizedBharatOSEvent(
        event_id=str(uuid.uuid4()),
        source_type=req.source_type,
        category=category,
        sensor_id=sensor_id,
        sensor_name=sensor_name,
        metric_type=req.metric_type,
        metric_value=req.metric_value,
        metric_unit=unit,
        latitude=latitude,
        longitude=longitude,
        address=address,
        evidence=req.evidence or {
            "simulation_origin": "IoT Simulation Console",
            "telemetry_source": "Simulated Hardware Transceiver",
            "reading": f"{req.metric_value} {unit}"
        },
        timestamp=datetime.now(timezone.utc),
        provenance="PROTOTYPE_SIMULATION"
    )

    try:
        response = EventPipelineService.process_event(db=db, event=event)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation ingestion failed: {str(e)}"
        )


@router.post("/iot", response_model=EventIngestResponse, status_code=status.HTTP_201_CREATED)
def ingest_iot_module_event(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
):
    """
    Ingests events/telemetry from bharatos-iot-module via IoTEventAdapter.
    """
    from app.integrations.iot.adapter import IoTEventAdapter
    from types import SimpleNamespace

    # Convert dictionary into a dynamic object for the adapter
    def dict_to_sns(d):
        if isinstance(d, dict):
            return SimpleNamespace(**{k: dict_to_sns(v) for k, v in d.items()})
        elif isinstance(d, list):
            return [dict_to_sns(v) for v in d]
        return d

    sns_payload = dict_to_sns(payload)

    if hasattr(sns_payload, "water_level_cm") or hasattr(sns_payload, "device_id"):
        std_event = IoTEventAdapter.adapt_telemetry(sns_payload)
    else:
        std_event = IoTEventAdapter.adapt_bharatos_event(sns_payload)

    try:
        response = EventPipelineService.process_event(db=db, event=std_event)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"IoT adapter ingestion failed: {str(e)}"
        )

