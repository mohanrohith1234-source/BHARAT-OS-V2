"""
Severe Weather Early Warning & Preparedness Dispatch Service.
Supports targeted multi-agency early warnings and human-in-the-loop sign-off.
"""

from typing import List, Optional
from datetime import datetime
from app.schemas.nowcast import EarlyWarning, PreparednessAction, HumanApprovalRequest, RiskLevel

class WarningService:
    """
    Manages active early warnings, multi-agency audience routing,
    and preparedness actions requiring Officer Human Sign-Off.
    """

    _warnings: List[EarlyWarning] = []
    _actions: List[PreparednessAction] = []

    @classmethod
    def get_active_warnings(cls, severity: Optional[str] = None) -> List[EarlyWarning]:
        """
        Returns active early warnings, optionally filtered by severity.
        """
        if not cls._warnings:
            # Seed with official SIH scenario warning
            cls._seed_default_warnings()
        
        if severity:
            return [w for w in cls._warnings if w.severity.lower() == severity.lower()]
        return cls._warnings

    @classmethod
    def get_preparedness_actions(cls) -> List[PreparednessAction]:
        """
        Returns proactive preparedness recommendations requiring human approval.
        """
        if not cls._actions:
            cls._seed_default_actions()
        return cls._actions

    @classmethod
    def process_human_approval(cls, approval: HumanApprovalRequest) -> Optional[PreparednessAction]:
        """
        Records officer human approval for a high-impact preparedness or dispatch action.
        """
        for act in cls._actions:
            if act.id == approval.action_id:
                if approval.decision == 'AUTHORIZE':
                    act.status = 'APPROVED'
                elif approval.decision == 'REJECT':
                    act.status = 'CANCELLED'
                act.human_signed_by = f"{approval.officer_name} ({approval.officer_badge})"
                act.signed_at = datetime.utcnow()
                return act
        return None

    @classmethod
    def _seed_default_warnings(cls):
        cls._warnings = [
            EarlyWarning(
                id="WARN-VIZAG-101",
                title="Severe Inundation Nowcast — Beach Road Corridor",
                ward_id="WARD-12",
                ward_name="Ward 12 (MVP Colony / RK Beach)",
                severity="HIGH",
                time_horizon="Within 30–60 minutes",
                expected_impact="Culvert outfall overtopping; waterlogging depth > 45 cm along Beach Road Sector 4; arterial traffic disruption.",
                target_audiences=[
                    "Citizens (Ward 12)",
                    "Ward Officer (MVP Colony)",
                    "District Disaster Management Authority (DDMA)",
                    "Traffic Police (Suryabagh Precinct)",
                    "GVMC Dewatering Unit",
                    "Emergency Medical Services (108 Dispatch)"
                ],
                recommended_preparedness=[
                    "Pre-position High-Volume Dewatering Pump DP-04 at Beach Road Culvert",
                    "Activate traffic detour signage towards NH16 bypass",
                    "Keep emergency corridor Ram Nagar -> King George Hospital clear",
                    "Issue BharatOS citizen safety notifications for low-lying residents"
                ],
                requires_human_approval=True,
                provenance="AI_DERIVED"
            ),
            EarlyWarning(
                id="WARN-VIZAG-102",
                title="Drainage Sump Surging — MVP Double Road",
                ward_id="WARD-12",
                ward_name="Ward 12 (MVP Colony Sector 2)",
                severity="CAUTION",
                time_horizon="Within 15–30 minutes",
                expected_impact="Canal capacity at 82%; localized backflow hazard near basement ramps.",
                target_audiences=[
                    "Ward 12 Sanitary Inspector",
                    "Residents Welfare Association",
                    "GVMC Engineering Division"
                ],
                recommended_preparedness=[
                    "Inspect outfall sluice gates for debris choking",
                    "Advise residents to move parked vehicles to elevated ground"
                ],
                requires_human_approval=False,
                provenance="REAL_IOT"
            )
        ]

    @classmethod
    def _seed_default_actions(cls):
        cls._actions = [
            PreparednessAction(
                id="ACT-PUMP-04",
                action_type="PREPOSITION_PUMP",
                title="Pre-position Dewatering Pump DP-04",
                description="Move high-volume trailer pump DP-04 to Beach Road Sector 4 outfall prior to culvert water exceeding 45cm.",
                resource_id="DP-04",
                target_zone="RK Beach Outfall Sump",
                status="RECOMMENDED",
                provenance="AI_DERIVED"
            ),
            PreparednessAction(
                id="ACT-TRAFFIC-NH16",
                action_type="TRAFFIC_DIVERSION",
                title="Deploy Traffic Detour via NH16",
                description="Police Unit P-305 to activate electronic signage and divert westbound passenger vehicles away from Beach Road.",
                resource_id="P-305",
                target_zone="Siripuram Junction to NH16",
                status="RECOMMENDED",
                provenance="AI_DERIVED"
            ),
            PreparednessAction(
                id="ACT-AMB-A21",
                action_type="AMBULANCE_CORRIDOR",
                title="Prepare Emergency Medical Corridor",
                description="Coordinate Smart Green Wave along Ram Nagar arterial route for Ambulance A-21 transit to King George Hospital.",
                resource_id="A-21",
                target_zone="Ram Nagar Medical Corridor",
                status="RECOMMENDED",
                provenance="AI_DERIVED"
            )
        ]
