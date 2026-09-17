import random
from typing import List
from vizag_context.zones import ZONE_PROPERTIES
from vizag_context.spatial_graph import ZONE_ADJACENCY
from .historical_events import FloodEventRecord
from .synthetic_generator import TrainingSample, generate_synthetic_samples, compute_baseline_risk

def events_to_training_samples(events: List[FloodEventRecord]) -> List[TrainingSample]:
    """
    Converts historical flood event records into training samples.
    """
    samples: List[TrainingSample] = []
    for event in events:
        props = ZONE_PROPERTIES.get(event.zone_id, {"elevation": 1.0, "drainage": 12.0})
        risk_score = event.predicted_risk / 100.0

        # Primary sample
        samples.append(TrainingSample(
            input_features=[
                event.weather_rainfall,
                event.weather_soil_moisture,
                props["elevation"],
                props["drainage"],
                event.weather_pressure,
                event.weather_humidity,
            ],
            target_risk=[round(risk_score, 4)]
        ))

        # Spatial cascade samples for neighbor zones
        neighbors = ZONE_ADJACENCY.get(event.zone_id, [])
        for n_id in neighbors:
            n_props = ZONE_PROPERTIES.get(n_id, {"elevation": 1.0, "drainage": 12.0})
            n_risk = min(0.95, risk_score * 0.7 + random.uniform(0.0, 0.1))
            samples.append(TrainingSample(
                input_features=[
                    event.weather_rainfall * 0.85,
                    event.weather_soil_moisture * 0.9,
                    n_props["elevation"],
                    n_props["drainage"],
                    event.weather_pressure,
                    event.weather_humidity,
                ],
                target_risk=[round(n_risk, 4)]
            ))
    return samples

def augment_event(event: FloodEventRecord, count: int = 5) -> List[TrainingSample]:
    """
    Creates noise-augmented samples around a specific flood event.
    """
    samples: List[TrainingSample] = []
    props = ZONE_PROPERTIES.get(event.zone_id, {"elevation": 1.0, "drainage": 12.0})

    for _ in range(count):
        rain = max(0.0, event.weather_rainfall + random.uniform(-5.0, 5.0))
        soil = min(1.0, max(0.1, event.weather_soil_moisture + random.uniform(-0.05, 0.05)))
        pressure = event.weather_pressure + random.uniform(-3.0, 3.0)
        humidity = min(100.0, max(40.0, event.weather_humidity + random.uniform(-5.0, 5.0)))

        risk = compute_baseline_risk(rain, soil, props["elevation"], props["drainage"], pressure, humidity)
        samples.append(TrainingSample(
            input_features=[rain, soil, props["elevation"], props["drainage"], pressure, humidity],
            target_risk=[round(min(0.99, max(0.01, risk + random.uniform(-0.02, 0.02))), 4)]
        ))

    return samples

def build_training_dataset(real_events: List[FloodEventRecord], synthetic_count: int = 1000) -> List[TrainingSample]:
    """
    Combines synthetic samples + historical event samples + augmented samples.
    """
    synthetic = generate_synthetic_samples(synthetic_count)
    real_samples: List[TrainingSample] = []
    for event in real_events:
        real_samples.extend(events_to_training_samples([event]))
        real_samples.extend(augment_event(event, 5))

    return synthetic + real_samples
