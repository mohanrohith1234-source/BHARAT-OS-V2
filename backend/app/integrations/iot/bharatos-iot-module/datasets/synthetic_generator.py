import math
import random
from typing import List
from pydantic import BaseModel

class TrainingSample(BaseModel):
    input_features: List[float]  # [rain, soil, elevation, drainage, pressure, humidity]
    target_risk: List[float]    # [risk_score_0_to_1]

def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))

def compute_baseline_risk(
    rain: float, soil: float, elevation: float,
    drainage: float, pressure: float, humidity: float
) -> float:
    """
    Hydrological baseline formula used for synthetic target calculation.
    """
    net_infiltration_deficit = max(0.0, rain - drainage * (1.0 - soil * 0.75))
    saturation_factor = math.pow(soil, 2.2) * 2.8
    accumulation_load = (rain * 2.8 / 45.0) * 1.5
    pressure_anomaly = max(0.0, (1013.0 - pressure) * 0.12)
    humidity_factor = (humidity / 100.0) * 0.4

    logit = -3.4
    logit += net_infiltration_deficit * 0.14 * elevation
    logit += saturation_factor * 1.8
    logit += accumulation_load * 0.95 * elevation
    logit += pressure_anomaly
    logit += humidity_factor

    if rain >= 50.0:
        logit += 2.5 + (rain - 50.0) * 0.05

    return min(0.99, max(0.01, sigmoid(logit)))

def generate_synthetic_samples(count: int = 1000) -> List[TrainingSample]:
    """
    Generates synthetic training samples covering diverse rainfall and soil saturation scenarios.
    """
    samples: List[TrainingSample] = []
    for _ in range(count):
        rain = random.uniform(0.0, 90.0)
        soil = random.uniform(0.1, 1.0)
        elevation = random.uniform(0.3, 2.5)
        drainage = random.uniform(5.0, 25.0)
        pressure = random.uniform(980.0, 1020.0)
        humidity = random.uniform(40.0, 100.0)

        risk = compute_baseline_risk(rain, soil, elevation, drainage, pressure, humidity)
        noisy_risk = min(0.99, max(0.01, risk + random.uniform(-0.03, 0.03)))

        samples.append(TrainingSample(
            input_features=[rain, soil, elevation, drainage, pressure, humidity],
            target_risk=[round(noisy_risk, 4)]
        ))
    return samples
