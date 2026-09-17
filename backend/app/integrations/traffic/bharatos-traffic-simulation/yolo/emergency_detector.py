"""
Emergency Vehicle Detector & Classifier
========================================
Inspects detected vehicle bounding boxes and image crops for emergency vehicle
cues (color distribution, red/blue beacons, markings) with transparent confidence.
"""

from typing import Dict, Any, Optional
import numpy as np


class EmergencyVehicleDetector:
    """
    Classifies whether a detected vehicle represents an emergency vehicle
    (Ambulance, Fire Tender, Police) through secondary visual inspection.
    """

    def __init__(self, confidence_threshold: float = 0.50):
        self.confidence_threshold = confidence_threshold

    def evaluate_candidate(
        self,
        class_name: str,
        confidence: float,
        cropped_patch: Optional[np.ndarray] = None,
        box_aspect_ratio: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Evaluate a detection for emergency vehicle characteristics.
        """
        if class_name not in ["car", "bus", "truck", "van"]:
            return {
                "is_emergency": False,
                "emergency_type": "NONE",
                "confidence": 0.0,
                "status": "STANDARD_VEHICLE",
                "rationale": f"Class '{class_name}' is not an emergency vehicle candidate.",
            }

        if cropped_patch is not None and cropped_patch.size > 0:
            return self._analyze_visual_profile(class_name, confidence, cropped_patch)

        return {
            "is_emergency": False,
            "emergency_type": "NONE",
            "confidence": 0.0,
            "status": "STANDARD_VEHICLE",
            "rationale": "No visual patch provided for emergency verification.",
        }

    def _analyze_visual_profile(
        self,
        class_name: str,
        primary_conf: float,
        patch: np.ndarray,
    ) -> Dict[str, Any]:
        """
        Analyzes color composition in BGR patch to detect emergency vehicle signatures.
        """
        try:
            b, g, r = patch[:, :, 0], patch[:, :, 1], patch[:, :, 2]
            total_pixels = float(patch.shape[0] * patch.shape[1])
            if total_pixels <= 0:
                return {"is_emergency": False, "emergency_type": "NONE", "confidence": 0.0, "status": "STANDARD_VEHICLE"}

            # Red dominance mask (Fire Brigade / Red cross on ambulance)
            red_mask = (r > 150) & (r > g * 1.3) & (r > b * 1.3)
            red_ratio = np.count_nonzero(red_mask) / total_pixels

            # White / High-luminance mask (Standard Indian ambulances)
            white_mask = (r > 180) & (g > 180) & (b > 180)
            white_ratio = np.count_nonzero(white_mask) / total_pixels

            # Blue dominance mask (Police cruisers)
            blue_mask = (b > 150) & (b > r * 1.3) & (b > g * 1.3)
            blue_ratio = np.count_nonzero(blue_mask) / total_pixels

            # Classification logic
            if white_ratio > 0.30 and red_ratio > 0.04:
                return {
                    "is_emergency": True,
                    "emergency_type": "AMBULANCE",
                    "confidence": round(min(0.92, 0.65 + red_ratio * 2.0), 2),
                    "status": "EMERGENCY_CANDIDATE_CONFIRMED",
                    "rationale": f"White body ({white_ratio:.1%}) with red markings ({red_ratio:.1%}) matches emergency ambulance profile.",
                }
            elif red_ratio > 0.25:
                return {
                    "is_emergency": True,
                    "emergency_type": "FIRE_TRUCK",
                    "confidence": round(min(0.95, 0.70 + red_ratio * 1.5), 2),
                    "status": "EMERGENCY_CANDIDATE_CONFIRMED",
                    "rationale": f"High red chromatic ratio ({red_ratio:.1%}) matches fire tender livery.",
                }
            elif blue_ratio > 0.12 and white_ratio > 0.20:
                return {
                    "is_emergency": True,
                    "emergency_type": "POLICE",
                    "confidence": round(min(0.88, 0.60 + blue_ratio * 2.0), 2),
                    "status": "EMERGENCY_CANDIDATE_CONFIRMED",
                    "rationale": f"Blue/White pattern ({blue_ratio:.1%} blue) indicates police patrol unit.",
                }
        except Exception:
            pass

        return {
            "is_emergency": False,
            "emergency_type": "NONE",
            "confidence": 0.0,
            "status": "STANDARD_VEHICLE",
            "rationale": "Visual inspection shows standard civilian vehicle livery.",
        }
