"""
Hyper-Local Nowcasting & Severe Weather Risk Engine.
Implements the core analytical loop:
OBSERVE -> NOWCAST -> HYPER-LOCAL RISK -> IMPACT PREDICTION -> EXPLAINABLE REASONING.
Deterministic, physics-informed, and transparent (no blind LLM numerical guessing).
"""

from typing import List, Dict, Any, Tuple
from datetime import datetime
from app.schemas.nowcast import (
    WeatherObservation,
    SensorObservation,
    TimeHorizonStep,
    WardRiskAssessment,
    RiskLevel
)

class NowcastService:
    """
    Hyper-local nowcast calculation engine combining:
    - Radar / weather precipitation rates & trends
    - Sump / culvert level sensors (e.g. Beach Road Sump 42cm)
    - Drainage discharge thresholds (e.g. 35cm overflow threshold)
    - Low-lying spatial topography
    """

    @staticmethod
    def calculate_risk_score(
        rainfall_mm_hr: float,
        water_level_cm: float,
        threshold_cm: float = 35.0,
        drainage_pct: float = 85.0,
        historical_exceedance: bool = False
    ) -> Tuple[float, RiskLevel, List[str], List[str]]:
        """
        Transparent, explainable risk score calculation (0 to 100).
        """
        score = 0.0
        factors = []
        why_increasing = []

        # 1. Rainfall factor (up to 35 points)
        if rainfall_mm_hr > 60:
            score += 35
            factors.append(f"Severe precipitation rate ({rainfall_mm_hr:.1f} mm/h > 60 mm/h)")
            why_increasing.append(f"Rainfall intensity spiked to {rainfall_mm_hr:.1f} mm/hr")
        elif rainfall_mm_hr > 40:
            score += 25
            factors.append(f"Heavy rainfall ({rainfall_mm_hr:.1f} mm/h)")
            why_increasing.append(f"Precipitation inflow increased to {rainfall_mm_hr:.1f} mm/hr")
        elif rainfall_mm_hr > 20:
            score += 15
            factors.append(f"Moderate rainfall ({rainfall_mm_hr:.1f} mm/h)")
        else:
            score += 5

        # 2. Sump Water Level vs Threshold (up to 35 points)
        ratio = water_level_cm / max(threshold_cm, 1.0)
        if ratio >= 1.2:
            score += 35
            factors.append(f"Critical culvert inundation ({water_level_cm:.1f} cm exceeding {threshold_cm:.1f} cm threshold)")
            why_increasing.append(f"Sensor water level reached {water_level_cm:.1f} cm (overflow threshold {threshold_cm:.1f} cm)")
        elif ratio >= 1.0:
            score += 28
            factors.append(f"Culvert sump threshold breached ({water_level_cm:.1f} cm / {threshold_cm:.1f} cm)")
            why_increasing.append(f"Drainage sump capacity exceeded by {water_level_cm - threshold_cm:.1f} cm")
        elif ratio >= 0.75:
            score += 18
            factors.append(f"Water level nearing capacity threshold ({water_level_cm:.1f} cm)")
        else:
            score += 5

        # 3. Drainage Stress & Backflow (up to 15 points)
        if drainage_pct >= 90:
            score += 15
            factors.append(f"Stormwater drainage near 100% capacity ({drainage_pct:.0f}%)")
            why_increasing.append(f"Drainage network at {drainage_pct:.0f}% capacity, slowing gravity outfall discharge")
        elif drainage_pct >= 75:
            score += 10
            factors.append(f"Stormwater canal load elevated ({drainage_pct:.0f}%)")
        else:
            score += 3

        # 4. Historical & Topographical Factors (up to 15 points)
        if historical_exceedance:
            score += 15
            factors.append("Historical monsoon 95th percentile baseline exceeded")
            why_increasing.append("Historical 10-year runoff baseline surpassed for coastal sector")
        else:
            score += 5

        # Clamp score
        score = min(100.0, max(0.0, score))

        # Classify Risk Level
        if score >= 80:
            level: RiskLevel = 'CRITICAL'
        elif score >= 65:
            level = 'VERY HIGH'
        elif score >= 45:
            level = 'HIGH'
        elif score >= 25:
            level = 'CAUTION'
        else:
            level = 'SAFE'

        if not why_increasing:
            why_increasing.append("Hydrological parameters within normal operating baseline.")

        return score, level, factors, why_increasing

    @classmethod
    def generate_ward_nowcast(
        cls,
        ward_id: str = "WARD-12",
        current_rain: float = 48.0,
        current_water_cm: float = 38.0,
        trend: str = "INCREASING"
    ) -> WardRiskAssessment:
        """
        Generates 4-step nowcast horizon (NOW, +15 MIN, +30 MIN, +60 MIN)
        for Ward 12 (MVP Colony & RK Beach Outfall).
        """
        # Timeline progression simulation based on rainfall trend
        multipliers = {
            'NOW': (1.0, 1.0),
            '+15 MIN': (1.15, 1.12),
            '+30 MIN': (1.30, 1.25),
            '+60 MIN': (1.45, 1.38) if trend != 'DECREASING' else (0.8, 0.7)
        }

        horizon_steps: List[TimeHorizonStep] = []
        minutes_map = {'NOW': 0, '+15 MIN': 15, '+30 MIN': 30, '+60 MIN': 60}

        for offset, (rain_mult, water_mult) in multipliers.items():
            rain_val = current_rain * rain_mult
            water_val = current_water_cm * water_mult
            drainage_pct = min(98.0, 65.0 + (water_val / 50.0) * 30.0)

            step_score, step_level, _, _ = cls.calculate_risk_score(
                rainfall_mm_hr=rain_val,
                water_level_cm=water_val,
                threshold_cm=35.0,
                drainage_pct=drainage_pct,
                historical_exceedance=(offset in ['+30 MIN', '+60 MIN'])
            )

            # Impact description
            if step_level in ['CRITICAL', 'VERY HIGH']:
                impact = "Beach Road Sector 4 impassable. Inundation depth ~45-55cm. Traffic diverted to NH16."
                action = "Deploy High-Volume Dewatering Pump DP-04, enforce corridor closure, issue shelter advisory."
            elif step_level == 'HIGH':
                impact = "Localized water stagnation on Beach Road low-lying segments. Sump threshold breached."
                action = "Pre-position dewatering equipment, alert traffic precinct, stage ambulance A-21."
            elif step_level == 'CAUTION':
                impact = "Catchment runoff accelerating. Low-lying basements vulnerable."
                action = "Clear stormwater outfall grates, monitor ultrasonic sump sensors."
            else:
                impact = "Normal drainage flow across all urban sectors."
                action = "Routine hydrological monitoring active."

            horizon_steps.append(
                TimeHorizonStep(
                    time_offset=offset,  # type: ignore
                    minutes_ahead=minutes_map[offset],
                    rainfall_rate_mm_hr=round(rain_val, 1),
                    water_level_cm=round(water_val, 1),
                    risk_level=step_level,
                    risk_score=round(step_score, 1),
                    drainage_capacity_pct=round(drainage_pct, 1),
                    predicted_impact=impact,
                    recommended_action=action,
                    model_score=round(85.0 + (step_score * 0.1), 1),
                    provenance='AI_DERIVED'
                )
            )

        now_step = horizon_steps[0]
        cur_score, cur_level, factors, why_increasing = cls.calculate_risk_score(
            rainfall_mm_hr=current_rain,
            water_level_cm=current_water_cm,
            threshold_cm=35.0,
            drainage_pct=78.0,
            historical_exceedance=False
        )

        return WardRiskAssessment(
            ward_id=ward_id,
            ward_name="Ward 12 (MVP Colony & RK Beach Outfall)",
            district="Visakhapatnam",
            state_name="Andhra Pradesh",
            current_risk_level=cur_level,
            current_risk_score=round(cur_score, 1),
            horizon_steps=horizon_steps,
            risk_factors=factors,
            why_risk_increasing=why_increasing,
            predicted_impacts={
                "inundation_probability": "HIGH" if cur_score > 50 else "MODERATE",
                "affected_roads": ["Beach Road Sector 4", "MVP Double Road Underpass"],
                "traffic_congestion_index": "SEVERE" if cur_score > 60 else "MODERATE",
                "critical_infrastructure_threat": "RK Beach Culvert Sump Outfall #1",
                "estimated_citizens_in_zone": 2400
            },
            provenance='AI_DERIVED'
        )
