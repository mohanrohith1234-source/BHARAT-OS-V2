"""
Traffic Perception & Emergency Dispatch API Router.
Handles endpoints called by the YOLO Traffic Simulation engine:
- POST /api/v1/traffic/events/emergency-dispatch
- POST /api/v1/traffic/sync/incident
"""

import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.events import (
    StandardizedBharatOSEvent,
    EventIngestResponse,
    EventSourceType,
    EmergencyCategory,
)
from app.services.event_pipeline_service import EventPipelineService

router = APIRouter(prefix="/traffic", tags=["traffic"])


class EmergencyDispatchSchema(BaseModel):
    event_id: Optional[str] = None
    event_type: str = "EMERGENCY_DISPATCHED"
    timestamp: Optional[str] = None
    source: str = "BHARATOS_YOLO_SIMULATOR"
    resource_id: str = "RES-AMB-01"
    external_simulation_id: str = "AMB-021"
    vehicle_type: str = "AMBULANCE"
    origin: Optional[Dict[str, Any]] = None
    destination: Optional[Dict[str, Any]] = None
    priority: str = "CRITICAL"
    route: List[str] = []


class TrafficIncidentSyncSchema(BaseModel):
    event_id: Optional[str] = None
    category: str = "severe_congestion"
    title: str
    description: str
    latitude: float = 17.7215
    longitude: float = 83.3055
    address: Optional[str] = "Siripuram - Beach Road Corridor, Visakhapatnam"
    severity: str = "medium"
    status: str = "active"
    scenario_id: Optional[str] = "YOLO_VISION_PERCEPTION"
    extra_data: Optional[Dict[str, Any]] = None


@router.post("/events/emergency-dispatch", response_model=EventIngestResponse, status_code=status.HTTP_201_CREATED)
def handle_emergency_dispatch(
    req: EmergencyDispatchSchema,
    db: Session = Depends(get_db),
):
    """
    Ingests an emergency vehicle dispatch (e.g. Ambulance/Fire) detected by the YOLO perception system.
    Maps to StandardizedBharatOSEvent and triggers green corridor AI response workflow.
    """
    origin_lat = req.origin.get("latitude", 17.7215) if req.origin else 17.7215
    origin_lon = req.origin.get("longitude", 83.3055) if req.origin else 83.3055
    origin_label = req.origin.get("label", "Siripuram Junction") if req.origin else "Siripuram Junction"
    dest_label = req.destination.get("label", "King George Hospital") if req.destination else "King George Hospital"

    route_str = " -> ".join(req.route) if req.route else "Siripuram Circle -> Asilmetta Flyover -> KGH Emergency Gate"

    event = StandardizedBharatOSEvent(
        event_id=req.event_id or f"DISPATCH-{uuid.uuid4().hex[:8].upper()}",
        source_type=EventSourceType.CCTV_YOLO,
        category=EmergencyCategory.TRAFFIC_DISRUPTION,
        severity="critical" if req.priority.upper() == "CRITICAL" else "high",
        title=f"🚨 EMERGENCY GREEN CORRIDOR: {req.vehicle_type} ({req.resource_id})",
        description=(
            f"Active emergency transit detected by YOLO vision perception. "
            f"Vehicle: {req.vehicle_type} ({req.external_simulation_id}). "
            f"Origin: {origin_label} to {dest_label}. "
            f"Planned Emergency Route: {route_str}."
        ),
        latitude=origin_lat,
        longitude=origin_lon,
        address=origin_label,
        evidence={
            "resource_id": req.resource_id,
            "vehicle_type": req.vehicle_type,
            "external_simulation_id": req.external_simulation_id,
            "priority": req.priority,
            "route": req.route,
            "origin": req.origin,
            "destination": req.destination,
            "signal_override": "GREEN_WAVE_REQUESTED"
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
            detail=f"Emergency dispatch pipeline error: {str(e)}"
        )


@router.post("/sync/incident", response_model=EventIngestResponse, status_code=status.HTTP_201_CREATED)
def handle_traffic_incident_sync(
    req: TrafficIncidentSyncSchema,
    db: Session = Depends(get_db),
):
    """
    Ingests traffic anomalies (e.g. severe congestion, stalled vehicle, accident) from the YOLO simulation engine.
    """
    # Map traffic category string to EmergencyCategory
    cat_lower = req.category.lower()
    if "accident" in cat_lower or "collision" in cat_lower:
        category = EmergencyCategory.ACCIDENT
    elif "congestion" in cat_lower or "queue" in cat_lower or "block" in cat_lower:
        category = EmergencyCategory.TRAFFIC_DISRUPTION
    else:
        category = EmergencyCategory.TRAFFIC_DISRUPTION

    event = StandardizedBharatOSEvent(
        event_id=req.event_id or f"INC-{uuid.uuid4().hex[:8].upper()}",
        source_type=EventSourceType.CCTV_YOLO,
        category=category,
        severity=req.severity.lower() if req.severity else "medium",
        title=req.title,
        description=req.description,
        latitude=req.latitude,
        longitude=req.longitude,
        address=req.address or "Siripuram - Beach Road Corridor, Visakhapatnam",
        evidence=req.extra_data or {"scenario_id": req.scenario_id},
        timestamp=datetime.now(timezone.utc),
        provenance="PROTOTYPE_SIMULATION"
    )

    try:
        response = EventPipelineService.process_event(db=db, event=event)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Traffic incident sync failed: {str(e)}"
        )
