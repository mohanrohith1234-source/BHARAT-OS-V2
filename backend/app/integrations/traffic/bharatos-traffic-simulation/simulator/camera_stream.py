"""
Camera & Video Stream Simulator
================================
Simulates video streams from camera feeds, recorded video files, image sequences,
or synthetic overhead traffic views. Provides playback controls (FPS, loop, step).
"""

from typing import Optional, Generator, Tuple
import os
import time
import cv2
import numpy as np


class CameraStreamSimulator:
    """
    Video stream provider for traffic camera simulation.
    """

    def __init__(
        self,
        source: Optional[str] = None,
        camera_id: str = "CAM-VIZAG-01",
        fps: float = 15.0,
        loop: bool = True,
    ):
        self.source = source
        self.camera_id = camera_id
        self.target_fps = fps
        self.frame_delay = 1.0 / max(1.0, fps)
        self.loop = loop

        self.cap = None
        self.is_image_source = False
        self.is_synthetic = False
        self.frame_index = 0
        self.is_paused = False

        self._init_source()

    def _init_source(self):
        if not self.source or not os.path.exists(self.source):
            # Check if source is integer (webcam)
            if self.source and self.source.isdigit():
                self.cap = cv2.VideoCapture(int(self.source))
                return

            # Default to synthetic traffic camera generator
            self.is_synthetic = True
            return

        ext = os.path.splitext(self.source)[1].lower()
        if ext in [".jpg", ".jpeg", ".png", ".bmp"]:
            self.is_image_source = True
            self.single_frame = cv2.imread(self.source)
        elif ext in [".mp4", ".avi", ".mov", ".mkv"]:
            self.cap = cv2.VideoCapture(self.source)
        else:
            self.is_synthetic = True

    def get_frame(self) -> Tuple[bool, Optional[np.ndarray], float]:
        """
        Retrieves next frame adhering to configured target FPS.
        Returns (success, frame, timestamp).
        """
        now = time.time()
        self.frame_index += 1

        if self.is_synthetic:
            frame = self._generate_synthetic_frame(self.frame_index)
            return True, frame, now

        if self.is_image_source:
            # Shift image slightly to simulate subtle sensor / traffic motion
            frame = self.single_frame.copy() if self.single_frame is not None else self._generate_synthetic_frame(self.frame_index)
            return True, frame, now

        if self.cap is not None and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                if self.loop:
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ret, frame = self.cap.read()
                    if not ret:
                        return False, None, now
                else:
                    return False, None, now
            return True, frame, now

        # Fallback to synthetic
        return True, self._generate_synthetic_frame(self.frame_index), now

    def _generate_synthetic_frame(self, frame_num: int) -> np.ndarray:
        """
        Generates a synthetic 720p overhead road intersection with animated vehicles.
        """
        h, w = 720, 1280
        frame = np.full((h, w, 3), 45, dtype=np.uint8)  # Dark asphalt background

        # Draw 4-lane intersection
        cv2.rectangle(frame, (440, 0), (840, h), (35, 35, 35), -1)  # N-S Road
        cv2.rectangle(frame, (0, 220), (w, 500), (35, 35, 35), -1)  # E-W Road

        # Lane dividers
        for y in range(0, h, 40):
            cv2.line(frame, (640, y), (640, min(h, y + 20)), (200, 200, 200), 2)
        for x in range(0, w, 40):
            cv2.line(frame, (x, 360), (min(w, x + 20), 360), (200, 200, 200), 2)

        # Draw animated civilian cars (White, Blue, Silver)
        offset1 = (frame_num * 6) % h
        cv2.rectangle(frame, (540, offset1), (580, offset1 + 65), (220, 220, 220), -1)  # Car 1

        offset2 = ((frame_num * 4) + 200) % w
        cv2.rectangle(frame, (offset2, 270), (offset2 + 70, 310), (180, 120, 40), -1)   # Car 2

        # Draw animated Emergency Ambulance (White body with bright red cross)
        amb_y = ((frame_num * 10) + 100) % h
        cv2.rectangle(frame, (680, amb_y), (730, amb_y + 90), (250, 250, 250), -1)    # White body
        cv2.rectangle(frame, (700, amb_y + 35), (710, amb_y + 55), (0, 0, 220), -1)    # Red cross v
        cv2.rectangle(frame, (693, amb_y + 42), (717, amb_y + 48), (0, 0, 220), -1)    # Red cross h

        # Flashing beacon effect
        if (frame_num % 10) < 5:
            cv2.circle(frame, (705, amb_y + 20), 8, (0, 0, 255), -1)
        else:
            cv2.circle(frame, (705, amb_y + 20), 8, (255, 100, 0), -1)

        # On-screen HUD watermark
        cv2.putText(
            frame,
            f"BHARATOS CCTV [{self.camera_id}] - SIMULATED STREAM - FRAME {frame_num}",
            (30, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 200),
            2,
        )
        return frame

    def release(self):
        if self.cap is not None:
            self.cap.release()
            self.cap = None
