"""
YOLO Perception & Traffic Configuration
=======================================
Mappings, confidence thresholds, and Indian Mixed-Traffic PCU equivalencies.
"""

from typing import Dict

# COCO traffic relevant classes
COCO_TRAFFIC_CLASSES: Dict[int, str] = {
    0: "pedestrian",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}

# Detection thresholds
DEFAULT_CONFIDENCE_THRESHOLD = 0.25
DEFAULT_IOU_THRESHOLD = 0.45

# Multi-Object Tracker parameters
MAX_TRACK_DISAPPEARED_FRAMES = 15
PIXEL_TO_METER_DEFAULT_SCALE = 0.05  # 1 px ~= 5 cm on standard overhead camera

# Indian Road Congress (IRC) Passenger Car Unit (PCU) Equivalency Factors
PCU_FACTORS: Dict[str, float] = {
    "motorcycle": 0.5,
    "bicycle": 0.2,
    "car": 1.0,
    "bus": 3.0,
    "truck": 3.0,
    "pedestrian": 0.1,
    "ambulance": 1.2,
    "fire_truck": 3.0,
    "police": 1.0,
}
