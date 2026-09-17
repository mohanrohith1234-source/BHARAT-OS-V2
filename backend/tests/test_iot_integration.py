"""
Unit & Integration Tests for BharatOS IoT Subsystem Integration
================================================================
Tests:
1. IoT Event Adapter conversion (TelemetryData and BharatOSEvent -> StandardizedBharatOSEvent)
2. Normal IoT telemetry processing through API Gateway
3. Emergency IoT telemetry processing through EventPipelineService
"""

import pytest
from types import SimpleNamespace
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.schemas.events import EmergencyCategory
from app.integrations.iot.adapter import IoTEventAdapter
from app.services.event_pipeline_service import EventPipelineService

client = TestClient(app)


def test_iot_adapter_normal_telemetry():
    telemetry = SimpleNamespace(
        device_id="WL-TEST-01",
        zone_id="mvp-colony",
        water_level_cm=18.5,
        rainfall_mm_hr=5.0,
        condition="NORMAL"
    )
    std_event = IoTEventAdapter.adapt_telemetry(telemetry)
    assert std_event.sensor_id == "WL-TEST-01"
    assert std_event.metric_value == 0.18
    assert std_event.severity == "low"
    assert std_event.category == EmergencyCategory.GENERAL


def test_iot_adapter_emergency_telemetry():
    telemetry = SimpleNamespace(
        device_id="WL-TEST-02",
        zone_id="poorna-market",
        water_level_cm=145.0,
        rainfall_mm_hr=95.0,
        condition="CRITICAL"
    )
    std_event = IoTEventAdapter.adapt_telemetry(telemetry)
    assert std_event.sensor_id == "WL-TEST-02"
    assert std_event.metric_value == 1.45
    assert std_event.severity == "critical"
    assert std_event.category == EmergencyCategory.FLOOD


def test_iot_adapter_bharatos_event():
    iot_event = SimpleNamespace(
        event_id="EVT-999",
        source=SimpleNamespace(device_id="GAS-NODE-07"),
        event_type="GAS_LEAK_ALERT",
        location=SimpleNamespace(lat=17.6888, lon=83.2185),
        measurements={"smoke_gas_ppm": 185.0},
        severity="HIGH"
    )
    std_event = IoTEventAdapter.adapt_bharatos_event(iot_event)
    assert std_event.event_id == "EVT-999"
    assert std_event.sensor_id == "GAS-NODE-07"
    assert std_event.category == EmergencyCategory.HAZMAT_GAS
    assert std_event.metric_type == "co_gas_ppm"
    assert std_event.metric_value == 185.0


def test_iot_api_endpoint_normal_event():
    payload = {
        "device_id": "WL-SIM-01",
        "zone_id": "beach-road",
        "water_level_cm": 25.0,
        "rainfall_mm_hr": 10.0,
        "condition": "NORMAL"
    }
    response = client.post("/api/v1/events/iot", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["severity"] == "LOW"


def test_iot_api_endpoint_critical_flood_event():
    payload = {
        "device_id": "WL-SIM-02",
        "zone_id": "poorna-market",
        "water_level_cm": 150.0,
        "rainfall_mm_hr": 120.0,
        "condition": "CRITICAL"
    }
    response = client.post("/api/v1/events/iot", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["severity"] == "CRITICAL"
    assert data["category"] == "Flood"
    assert data["requires_human_approval"] is True
    assert len(data["ai_response_plan"]) > 0
