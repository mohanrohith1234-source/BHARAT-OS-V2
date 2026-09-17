"""
Datasets module for synthetic data generation, historical event structures, and data augmentation.
"""
from .historical_events import FloodEventRecord, HISTORICAL_FLOOD_EVENTS
from .synthetic_generator import generate_synthetic_samples, compute_baseline_risk, TrainingSample
from .augmentation import events_to_training_samples, augment_event, build_training_dataset

__all__ = [
    "FloodEventRecord",
    "HISTORICAL_FLOOD_EVENTS",
    "generate_synthetic_samples",
    "compute_baseline_risk",
    "TrainingSample",
    "events_to_training_samples",
    "augment_event",
    "build_training_dataset"
]
