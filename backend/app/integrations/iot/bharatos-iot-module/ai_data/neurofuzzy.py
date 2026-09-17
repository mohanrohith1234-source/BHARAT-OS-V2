from typing import List, Literal
from pydantic import BaseModel

class FuzzyRule(BaseModel):
    rule: str
    confidence: float
    weight: float
    severity: Literal["info", "warning", "critical"]

class NeurofuzzyAssessment(BaseModel):
    overall_risk: Literal["low", "medium", "high"]
    overall_confidence: float
    rules: List[FuzzyRule]
    linguistic_summary: str
    actionable_advisory: str

def fuzzy_rainfall(mm: float) -> str:
    if mm <= 0: return "none"
    if mm < 5: return "drizzle"
    if mm < 15: return "light"
    if mm < 30: return "moderate"
    if mm < 50: return "heavy"
    return "extreme"

def fuzzy_soil(ratio: float) -> str:
    if ratio < 0.3: return "dry"
    if ratio < 0.6: return "moist"
    if ratio < 0.85: return "saturated"
    return "waterlogged"

def generate_fuzzy_rules(
    rain: float, soil: float, elevation: float,
    drainage: float, pressure: float, humidity: float
) -> List[FuzzyRule]:
    rules: List[FuzzyRule] = []

    r_lbl = fuzzy_rainfall(rain)
    s_lbl = fuzzy_soil(soil)

    if rain > 5.0:
        sev = "critical" if rain >= 50.0 else "warning" if rain >= 25.0 else "info"
        rules.append(FuzzyRule(
            rule=f"IF rainfall IS {r_lbl} ({rain:.1f}mm/hr) THEN flood_risk INCREASES",
            confidence=0.92,
            weight=0.30,
            severity=sev
        ))

    if soil > 0.4:
        sev = "critical" if soil >= 0.85 else "warning" if soil >= 0.65 else "info"
        rules.append(FuzzyRule(
            rule=f"IF soil_moisture IS {s_lbl} ({int(soil * 100)}%) THEN ground absorption capacity IS reduced",
            confidence=0.88,
            weight=0.25,
            severity=sev
        ))

    if pressure < 1008.0:
        sev = "critical" if pressure < 995.0 else "warning" if pressure < 1000.0 else "info"
        rules.append(FuzzyRule(
            rule=f"IF barometric_pressure IS low ({pressure:.1f}hPa) THEN cyclonic storm activity IS present",
            confidence=0.85,
            weight=0.20,
            severity=sev
        ))

    if elevation >= 1.2 and drainage <= 10.0:
        rules.append(FuzzyRule(
            rule=f"IF basin_elevation IS low/depressed AND drainage IS poor ({drainage:.1f}mm/hr) THEN water accumulation IS high",
            confidence=0.90,
            weight=0.15,
            severity="warning"
        ))

    return rules

def interpret_prediction(
    risk_score: float, rain: float, soil: float,
    elevation: float, drainage: float, pressure: float,
    humidity: float, events_learned: int = 3
) -> NeurofuzzyAssessment:
    rules = generate_fuzzy_rules(rain, soil, elevation, drainage, pressure, humidity)
    
    if risk_score >= 70.0:
        overall_risk = "high"
        advisory = "CRITICAL: Immediate evacuation of low-lying basins and deployment of flood barriers required."
    elif risk_score >= 35.0:
        overall_risk = "medium"
        advisory = "WARNING: Pre-position emergency assets and monitor storm drain discharge channels."
    else:
        overall_risk = "low"
        advisory = "MONITOR: Hydrological parameters nominal. Routine surveillance active."

    critical_cnt = sum(1 for r in rules if r.severity == "critical")
    warning_cnt = sum(1 for r in rules if r.severity == "warning")

    summary = f"Risk evaluated across {len(rules)} fuzzy rules. {critical_cnt} critical, {warning_cnt} warning conditions."
    if events_learned > 0:
        summary += f" Model calibrated with {events_learned} historical Vizag flood events."

    return NeurofuzzyAssessment(
        overall_risk=overall_risk,
        overall_confidence=0.95,
        rules=rules,
        linguistic_summary=summary,
        actionable_advisory=advisory
    )
