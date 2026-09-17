"""
Unit & Integration Tests for BharatOS Traffic Simulation Subsystem
===================================================================
Tests:
1. Traffic Event Adapter (Emergency Dispatch & Traffic Analysis)
2. API Endpoint POST /api/v1/traffic/events/emergency-dispatch
3. API Endpoint POST /api/v1/traffic/sync/incident
4. Verification of AI green corridor response plan and incident generation
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.events import EmergencyCategory
from app.integrations.traffic.adapter import TrafficEventAdapter

client = TestClient(app)


def test_traffic_adapter_emergency_dispatch():
    std_evt = TrafficEventAdapter.adapt_emergency_dispatch(
        vehicle_type="AMBULANCE",
        resource_id="RES-AMB-99",
        simulation_id="AMB-099",
        route=["Siripuram Circle", "KGH Emergency Gate"],
        origin={"latitude": 17.7215, "longitude": 83.3055, "label": "Siripuram Junction"},
        destination={"latitude": 17.7120, "longitude": 83.3180, "label": "KGH Hospital"}
    )
    assert std_evt.severity == "critical"
    assert std_evt.category == EmergencyCategory.TRAFFIC_DISRUPTION
    assert "AMBULANCE" in std_evt.title
    assert std_evt.latitude == 17.7215


def test_traffic_adapter_traffic_analysis():
    std_evt = TrafficEventAdapter.adapt_traffic_analysis(
        camera_id="CAM-VIZAG-01",
        junction_id="SIRIPURAM-JCT-01",
        total_pcu=18.5,
        congestion_level="HEAVY",
        emergency_detected=False
    )
    assert std_evt.severity == "high"
    assert std_evt.sensor_id == "CAM-VIZAG-01"
    assert std_evt.metric_type == "traffic_congestion_pct"


def test_traffic_api_emergency_dispatch():
    payload = {
        "event_id": "DISPATCH-TEST-001",
        "event_type": "EMERGENCY_DISPATCHED",
        "source": "BHARATOS_YOLO_SIMULATOR",
        "resource_id": "RES-AMB-01",
        "external_simulation_id": "AMB-021",
        "vehicle_type": "AMBULANCE",
        "priority": "CRITICAL",
        "origin": {"latitude": 17.7215, "longitude": 83.3055, "label": "Siripuram Circle"},
        "destination": {"latitude": 17.7120, "longitude": 83.3180, "label": "King George Hospital"},
        "route": ["Siripuram Circle", "Asilmetta Flyover", "KGH Emergency Gate"]
    }
    response = client.post("/api/v1/traffic/events/emergency-dispatch", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["severity"] == "CRITICAL"
    assert data["requires_human_approval"] is True
    assert len(data["dispatched_departments"]) > 0


def test_traffic_api_sync_incident_congestion():
    payload = {
        "event_id": "INC-TEST-002",
        "category": "severe_congestion",
        "title": "Gridlock at Siripuram Junction",
        "description": "High PCU vehicle density detected by YOLO vision camera.",
        "latitude": 17.7215,
        "longitude": 83.3055,
        "address": "Siripuram Circle, Visakhapatnam",
        "severity": "high",
        "status": "active"
    }
    response = client.post("/api/v1/traffic/sync/incident", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["category"] == "Traffic Disruption"
    assert data["severity"] == "HIGH"
    assert data["incident_id"] is not None
