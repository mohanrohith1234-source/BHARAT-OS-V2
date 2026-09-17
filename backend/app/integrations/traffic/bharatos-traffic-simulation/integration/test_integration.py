"""
Self-Test Verification Script
=============================
Validates that YOLO detection, tracking, traffic analysis, and BharatOS event
generation function end-to-end without requiring any external dependencies.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from simulator.camera_stream import CameraStreamSimulator
from simulator.traffic_analyzer import TrafficAnalyzer
from simulator.incident_generator import IncidentGenerator
from yolo.detector import YoloDetector
from yolo.tracker import MultiObjectTracker
from integration.bharatos_client import BharatOSClient
from integration.event_schemas import EmergencyDispatchPayload, TrafficIncidentSyncPayload


def test_pipeline():
    print("[1/5] Initializing Camera Stream Simulator...")
    stream = CameraStreamSimulator(source=None, fps=10.0)
    ret, frame, ts = stream.get_frame()
    assert ret is True and frame is not None, "Failed to acquire frame from stream"
    print(f" -> Acquired frame of dimensions: {frame.shape[1]}x{frame.shape[0]}")

    print("[2/5] Running YOLO Object Detector...")
    detector = YoloDetector()
    detections = detector.detect(frame)
    print(f" -> Detector found {len(detections)} vehicle candidates")
    assert len(detections) > 0, "Expected at least one detected object"

    print("[3/5] Tracking Objects & Calculating Velocities...")
    tracker = MultiObjectTracker()
    tracks = tracker.update(detections, timestamp=ts, dt=0.1)
    print(f" -> Tracker registered {len(tracks)} active vehicle tracks")
    assert len(tracks) > 0, "Expected active tracks"

    print("[4/5] Analyzing Traffic Flow & Classifying Congestion...")
    analyzer = TrafficAnalyzer()
    analysis = analyzer.analyze(
        camera_id="CAM-TEST",
        junction_id="JCT-TEST",
        detections=detections,
        tracked_objects=tracks,
        timestamp=ts,
    )
    print(f" -> Traffic Density: {analysis.total_pcu} PCU | Speed: {analysis.average_speed_kmh} km/h | Level: {analysis.congestion_level}")

    print("[5/5] Generating BharatOS Events & Checking Schemas...")
    generator = IncidentGenerator(incident_cooldown_seconds=0.0)
    events = generator.evaluate_and_generate_events(analysis)
    print(f" -> Generated {len(events)} events for BharatOS")

    # Test schema serialization
    dispatch = EmergencyDispatchPayload(
        resource_id="RES-AMB-01",
        external_simulation_id="AMB-021",
        vehicle_type="AMBULANCE",
        priority="CRITICAL",
    )
    json_data = dispatch.model_dump_json()
    assert "RES-AMB-01" in json_data
    print(" -> EmergencyDispatchPayload serialized successfully")

    incident = TrafficIncidentSyncPayload(
        title="Test Accident",
        description="Two vehicle collision",
        severity="high",
    )
    json_data2 = incident.model_dump_json()
    assert "Test Accident" in json_data2
    print(" -> TrafficIncidentSyncPayload serialized successfully")

    print("\nALL SELF-TESTS PASSED SUCCESSFULLY! The package is ready for deployment.")


if __name__ == "__main__":
    test_pipeline()
