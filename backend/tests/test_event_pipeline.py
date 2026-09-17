import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_events_presets():
    """Verify that IoT presets are returned properly."""
    response = client.get("/api/v1/events/presets")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["presets"]) >= 5
    assert any(p["id"] == "BEACH_ROAD_FLOOD" for p in data["presets"])
    assert any(p["id"] == "DABA_GARDENS_FIRE" for p in data["presets"])
    assert any(p["id"] == "GAJUWAKA_GAS_LEAK" for p in data["presets"])
    assert any(p["id"] == "SIRIPURAM_EARTHQUAKE" for p in data["presets"])
    assert any(p["id"] == "NH16_TRAFFIC_CONGESTION" for p in data["presets"])

def test_simulate_iot_event_flood():
    """Verify simulated flood event passes through pipeline and returns AI response plan."""
    payload = {
        "preset": "BEACH_ROAD_FLOOD",
        "metric_type": "water_level",
        "metric_value": 4.8,
        "metric_unit": "m",
        "source_type": "IOT_SIMULATOR"
    }
    response = client.post("/api/v1/events/simulate-iot", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["category"] == "Flood"
    assert data["severity"] == "CRITICAL"
    assert data["ai_risk_score"] > 80.0
    assert len(data["dispatched_departments"]) > 0
    assert len(data["recommended_resources"]) > 0
    assert len(data["ai_response_plan"]) > 0
    assert data["requires_human_approval"] is True

def test_simulate_iot_event_fire():
    """Verify simulated fire event triggers Fire & Rescue departments."""
    payload = {
        "preset": "DABA_GARDENS_FIRE",
        "metric_type": "smoke_density",
        "metric_value": 75.0,
        "metric_unit": "%",
        "source_type": "IOT_SIMULATOR"
    }
    response = client.post("/api/v1/events/simulate-iot", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["category"] == "Fire"
    assert data["severity"] == "CRITICAL"
    assert "Fire & Rescue Services" in data["dispatched_departments"]
    assert any("FT-12" in step or "water" in step.lower() or "fire" in step.lower() for step in data["ai_response_plan"])

def test_simulate_iot_event_gas_leak():
    """Verify simulated toxic gas event triggers Hazmat Squad."""
    payload = {
        "preset": "GAJUWAKA_GAS_LEAK",
        "metric_type": "co_gas_ppm",
        "metric_value": 180.0,
        "metric_unit": "ppm",
        "source_type": "IOT_SIMULATOR"
    }
    response = client.post("/api/v1/events/simulate-iot", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["category"] == "Hazardous Material"
    assert data["severity"] == "CRITICAL"
    assert any("Hazmat" in dept for dept in data["dispatched_departments"])

def test_ingest_cctv_yolo_traffic_event():
    """Verify CCTV YOLO event ingestion with vision bounding boxes and detections."""
    yolo_payload = {
        "source_type": "CCTV_YOLO",
        "category": "Traffic Disruption",
        "sensor_id": "CAM-VIZAG-MADDILAPALEM-01",
        "sensor_name": "Maddilapalem Intersection PTZ-4",
        "metric_type": "traffic_congestion_pct",
        "metric_value": 94.0,
        "metric_unit": "%",
        "severity": "critical",
        "title": "CCTV YOLO Alert: Critical Gridlock Detected at Maddilapalem",
        "description": "YOLOv8 detected 48 stationary vehicles and 2 stranded buses.",
        "latitude": 17.7345,
        "longitude": 83.3180,
        "address": "Maddilapalem Junction, Visakhapatnam",
        "evidence": {
            "camera_id": "CAM-VIZAG-MADDILAPALEM-01",
            "frame_timestamp": "2026-09-17T20:30:00Z",
            "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
            "detections": [
                {"class_name": "waterlogged_vehicle", "confidence": 0.94, "bbox": [120, 200, 380, 450]},
                {"class_name": "congestion_queue", "confidence": 0.91, "bbox": [50, 100, 600, 500]}
            ],
            "vehicle_count": 48
        },
        "provenance": "PROTOTYPE_SIMULATION"
    }
    response = client.post("/api/v1/events/ingest", json=yolo_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["category"] == "Traffic Disruption"
    assert data["severity"] == "CRITICAL"
    assert "Traffic Police" in data["dispatched_departments"]
    assert len(data["recommended_resources"]) > 0
