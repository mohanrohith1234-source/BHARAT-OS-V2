"""
Multi-Object Tracker
====================
Associates detected vehicles across video frames using centroid proximity and IoU.
Calculates persistent track IDs, trajectory histories, speeds (km/h), and dwell times.
"""

from typing import Dict, List, Optional, Tuple, Any
import math
import numpy as np
from pydantic import BaseModel, Field

from yolo.config import MAX_TRACK_DISAPPEARED_FRAMES, PIXEL_TO_METER_DEFAULT_SCALE


class ObjectDetection(BaseModel):
    box: List[float] = Field(..., description="[x1, y1, x2, y2] in pixels")
    anchor_point: List[float] = Field(..., description="[x, y] bottom-center ground contact point")
    class_id: int
    class_name: str
    confidence: float
    area_px: float
    is_potential_emergency: bool = False
    emergency_confidence: float = 0.0
    emergency_type: str = "NONE"


class TrackedObject(BaseModel):
    track_id: int
    class_name: str
    box: List[float]
    anchor_point: List[float]
    speed_kmh: float = 0.0
    dwell_time_s: float = 0.0
    trajectory: List[List[float]] = Field(default_factory=list)
    is_emergency: bool = False
    emergency_type: str = "NONE"


class MultiObjectTracker:
    """
    Centroid and distance based multi-object tracker for vehicle tracking and speed estimation.
    """

    def __init__(
        self,
        max_disappeared: int = MAX_TRACK_DISAPPEARED_FRAMES,
        max_distance_px: float = 120.0,
        pixel_to_meter: float = PIXEL_TO_METER_DEFAULT_SCALE,
    ):
        self.max_disappeared = max_disappeared
        self.max_distance_px = max_distance_px
        self.pixel_to_meter = pixel_to_meter
        self.next_track_id: int = 1
        self.tracks: Dict[int, Dict[str, Any]] = {}
        self.disappeared: Dict[int, int] = {}

    def update(
        self,
        detections: List[ObjectDetection],
        timestamp: float,
        dt: float = 1.0 / 30.0,
    ) -> List[TrackedObject]:
        """
        Update tracker state with detections from the current frame.
        """
        if dt <= 0.0:
            dt = 1.0 / 30.0

        if len(detections) == 0:
            for track_id in list(self.disappeared.keys()):
                self.disappeared[track_id] += 1
                if self.disappeared[track_id] > self.max_disappeared:
                    self._deregister(track_id)
            return self._get_active_tracked_objects()

        if len(self.tracks) == 0:
            for det in detections:
                self._register(det, timestamp)
            return self._get_active_tracked_objects()

        # Match existing tracks with current detections by centroid distance
        track_ids = list(self.tracks.keys())
        track_centroids = [self.tracks[tid]["anchor_point"] for tid in track_ids]
        det_centroids = [d.anchor_point for d in detections]

        D = np.zeros((len(track_ids), len(detections)), dtype=np.float32)
        for i, tc in enumerate(track_centroids):
            for j, dc in enumerate(det_centroids):
                D[i, j] = math.hypot(tc[0] - dc[0], tc[1] - dc[1])

        rows = D.min(axis=1).argsort()
        cols = D.argmin(axis=1)[rows]

        used_rows = set()
        used_cols = set()

        for row, col in zip(rows, cols):
            if row in used_rows or col in used_cols:
                continue
            if D[row, col] > self.max_distance_px:
                continue

            tid = track_ids[row]
            det = detections[col]
            self._update_track(tid, det, timestamp, dt)
            used_rows.add(row)
            used_cols.add(col)

        # Handle unmatched existing tracks
        unused_rows = set(range(len(track_ids))) - used_rows
        for row in unused_rows:
            tid = track_ids[row]
            self.disappeared[tid] = self.disappeared.get(tid, 0) + 1
            if self.disappeared[tid] > self.max_disappeared:
                self._deregister(tid)

        # Register new detections
        unused_cols = set(range(len(detections))) - used_cols
        for col in unused_cols:
            self._register(detections[col], timestamp)

        return self._get_active_tracked_objects()

    def _register(self, det: ObjectDetection, timestamp: float):
        tid = self.next_track_id
        self.next_track_id += 1
        self.tracks[tid] = {
            "track_id": tid,
            "class_name": det.class_name,
            "box": det.box,
            "anchor_point": det.anchor_point,
            "speed_kmh": 0.0,
            "first_seen": timestamp,
            "last_seen": timestamp,
            "trajectory": [det.anchor_point],
            "is_emergency": det.is_potential_emergency,
            "emergency_type": det.emergency_type,
        }
        self.disappeared[tid] = 0

    def _update_track(self, tid: int, det: ObjectDetection, timestamp: float, dt: float):
        track = self.tracks[tid]
        old_anchor = track["anchor_point"]
        new_anchor = det.anchor_point

        dx = (new_anchor[0] - old_anchor[0]) * self.pixel_to_meter
        dy = (new_anchor[1] - old_anchor[1]) * self.pixel_to_meter
        dist_m = math.hypot(dx, dy)
        speed_mps = dist_m / dt
        speed_kmh = speed_mps * 3.6

        # Exponential moving average for velocity smoothing
        smoothed_speed = 0.7 * track["speed_kmh"] + 0.3 * speed_kmh if track["speed_kmh"] > 0 else speed_kmh

        track["box"] = det.box
        track["anchor_point"] = new_anchor
        track["speed_kmh"] = round(smoothed_speed, 1)
        track["last_seen"] = timestamp
        track["is_emergency"] = det.is_potential_emergency or track["is_emergency"]
        if det.emergency_type != "NONE":
            track["emergency_type"] = det.emergency_type

        track["trajectory"].append(new_anchor)
        if len(track["trajectory"]) > 30:
            track["trajectory"].pop(0)

        self.disappeared[tid] = 0

    def _deregister(self, tid: int):
        self.tracks.pop(tid, None)
        self.disappeared.pop(tid, None)

    def _get_active_tracked_objects(self) -> List[TrackedObject]:
        result = []
        for tid, t in self.tracks.items():
            if self.disappeared.get(tid, 0) == 0:
                dwell = t["last_seen"] - t["first_seen"]
                result.append(
                    TrackedObject(
                        track_id=t["track_id"],
                        class_name=t["class_name"],
                        box=t["box"],
                        anchor_point=t["anchor_point"],
                        speed_kmh=t["speed_kmh"],
                        dwell_time_s=round(dwell, 1),
                        trajectory=list(t["trajectory"]),
                        is_emergency=t["is_emergency"],
                        emergency_type=t["emergency_type"],
                    )
                )
        return result
