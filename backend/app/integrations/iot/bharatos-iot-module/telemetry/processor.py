from typing import Tuple, List, Dict
from config.settings import settings
from .schemas import TelemetryData, SensorCondition

class TelemetryProcessor:
    """
    Validates telemetry packets, evaluates safety thresholds, and detects sensor anomalies.
    """
    
    @staticmethod
    def evaluate_condition(data: TelemetryData) -> Tuple[SensorCondition, List[str]]:
        reasons: List[str] = []
        condition: SensorCondition = "NORMAL"

        if not data.online:
            return "FAULT", ["Device is offline / uncommunicative"]

        # Water level checks
        if data.water_level_cm >= settings.WATER_LEVEL_CRITICAL_CM:
            condition = "CRITICAL"
            reasons.append(f"Water level critical: {data.water_level_cm:.1f} cm (threshold: {settings.WATER_LEVEL_CRITICAL_CM} cm)")
        elif data.water_level_cm >= settings.WATER_LEVEL_HIGH_CM:
            if condition != "CRITICAL":
                condition = "WARNING"
            reasons.append(f"Water level elevated: {data.water_level_cm:.1f} cm")

        # Heavy rainfall check
        if data.rainfall_mm_hr >= settings.RAINFALL_HEAVY_MM_HR:
            if condition not in ("CRITICAL", "WARNING"):
                condition = "WARNING"
            reasons.append(f"Extreme cloudburst/rainfall: {data.rainfall_mm_hr:.1f} mm/hr")

        # Cyclonic barometric pressure drop check
        if data.pressure_hpa <= settings.PRESSURE_STORM_HPA:
            if condition not in ("CRITICAL", "WARNING"):
                condition = "WARNING"
            reasons.append(f"Low pressure storm signal: {data.pressure_hpa:.1f} hPa")

        # Gas / Smoke leak check
        if data.smoke_gas_ppm and data.smoke_gas_ppm > 150.0:
            condition = "CRITICAL"
            reasons.append(f"Gas/smoke concentration dangerous: {data.smoke_gas_ppm:.1f} ppm")

        # Structural vibration anomaly check
        if data.vibration_g and data.vibration_g > 2.5:
            if condition != "CRITICAL":
                condition = "ABNORMAL"
            reasons.append(f"High structural vibration: {data.vibration_g:.2f} g")

        return condition, reasons

    @classmethod
    def process(cls, data: TelemetryData) -> Dict:
        condition, reasons = cls.evaluate_condition(data)
        data.condition = condition
        return {
            "processed": True,
            "telemetry": data.model_dump(mode="json"),
            "condition": condition,
            "reasons": reasons,
            "requires_event": condition in ("WARNING", "CRITICAL", "ABNORMAL", "FAULT")
        }
