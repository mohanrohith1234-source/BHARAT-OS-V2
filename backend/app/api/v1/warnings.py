"""
Severe Weather Early Warnings & Preparedness API Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.nowcast import EarlyWarning, PreparednessAction, HumanApprovalRequest
from app.services.warning_service import WarningService

router = APIRouter(prefix="/warnings", tags=["Early Warnings"])

@router.get("", response_model=List[EarlyWarning])
async def list_early_warnings(severity: Optional[str] = Query(None, description="Filter by severity: SAFE, CAUTION, HIGH, CRITICAL")):
    """
    List active severe weather early warnings.
    """
    return WarningService.get_active_warnings(severity=severity)

@router.get("/actions", response_model=List[PreparednessAction])
async def list_preparedness_actions():
    """
    List proactive preparedness recommendations awaiting or approved by human commanders.
    """
    return WarningService.get_preparedness_actions()

@router.post("/approve", response_model=PreparednessAction)
async def approve_preparedness_action(approval: HumanApprovalRequest):
    """
    Record officer human sign-off for high-impact resource deployment.
    """
    action = WarningService.process_human_approval(approval)
    if not action:
        raise HTTPException(status_code=404, detail="Preparedness action ID not found.")
    return action
