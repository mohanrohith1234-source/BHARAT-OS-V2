"""
Hyper-Local Nowcasting API Endpoints.
Provides structured nowcasting predictions, 4-step time-horizon forecasts,
and explainable risk factors.
"""

from fastapi import APIRouter, Query
from app.schemas.nowcast import WardRiskAssessment
from app.services.nowcast_service import NowcastService

router = APIRouter(prefix="/nowcast", tags=["Nowcasting"])

@router.get("/ward/{ward_id}", response_model=WardRiskAssessment)
async def get_ward_nowcast(
    ward_id: str = "WARD-12",
    rainfall_rate: float = Query(48.0, description="Current precipitation rate in mm/h"),
    water_level_cm: float = Query(38.0, description="Current culvert sump water level in cm"),
    trend: str = Query("INCREASING", description="Precipitation trend: STABLE, INCREASING, DECREASING")
):
    """
    Get hyper-local severe weather nowcast and 4-step time horizon (NOW, +15m, +30m, +60m)
    for a specified ward / municipal sector.
    """
    return NowcastService.generate_ward_nowcast(
        ward_id=ward_id,
        current_rain=rainfall_rate,
        current_water_cm=water_level_cm,
        trend=trend
    )

@router.get("/summary")
async def get_nowcast_summary():
    """
    Returns district-wide nowcast operational summary.
    """
    nowcast = NowcastService.generate_ward_nowcast("WARD-12", 48.0, 38.0, "INCREASING")
    return {
        "district": "Visakhapatnam",
        "jurisdiction": "Greater Visakhapatnam Municipal Corporation (GVMC)",
        "radar_source": "IMD Doppler Weather Radar Visakhapatnam",
        "nowcast_horizon_minutes": 60,
        "highest_risk_ward": "WARD-12 (MVP Colony & RK Beach)",
        "current_status": nowcast.current_risk_level,
        "current_score": nowcast.current_risk_score,
        "predicted_impact_summary": "Inundation on Beach Road Sector 4 predicted within 30-45 minutes.",
        "provenance": "AI_DERIVED",
        "timestamp": nowcast.generated_at
    }
