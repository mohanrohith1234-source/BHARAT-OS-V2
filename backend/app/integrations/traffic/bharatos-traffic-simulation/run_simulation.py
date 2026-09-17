"""
BHARATOS Standalone Traffic & YOLO Vision Simulator
===================================================
Executes the end-to-end vision and telemetry simulation:
  Traffic Camera Feed -> YOLO Detection -> Traffic Analysis -> Incident Detection -> BharatOS API Gateway

Usage:
  python run_simulation.py
  python run_simulation.py --source data/samples/ambulance_sample.jpg --max-frames 10
  python run_simulation.py --demo-ambulance --push-to-bharatos --bharatos-url http://localhost:8000/api/v1
"""

import argparse
import sys
import os
import time
import cv2

# Ensure local package modules are importable
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from simulator.camera_stream import CameraStreamSimulator
from simulator.traffic_analyzer import TrafficAnalyzer
from simulator.incident_generator import IncidentGenerator
from yolo.detector import YoloDetector
from yolo.tracker import MultiObjectTracker
from integration.bharatos_client import BharatOSClient
from integration.event_schemas import EmergencyDispatchPayload, TrafficIncidentSyncPayload


def parse_args():
    parser = argparse.ArgumentParser(description="BharatOS Standalone YOLO Traffic Simulation")
    parser.add_argument(
        "--source",
        type=str,
        default=None,
        help="Path to video file (.mp4), image (.jpg), camera index, or leave blank for synthetic generator",
    )
    parser.add_argument(
        "--camera-id",
        type=str,
        default="CAM-VIZAG-01",
        help="Camera feed identifier",
    )
    parser.add_argument(
        "--fps",
        type=float,
        default=10.0,
        help="Target processing frame rate",
    )
    parser.add_argument(
        "--max-frames",
        type=int,
        default=25,
        help="Maximum frames to simulate (0 = infinite)",
    )
    parser.add_argument(
        "--weights",
        type=str,
        default=None,
        help="Path to custom YOLO weights (.pt)",
    )
    parser.add_argument(
        "--push-to-bharatos",
        action="store_true",
        help="Send detected traffic events to live BharatOS REST API",
    )
    parser.add_argument(
        "--bharatos-url",
        type=str,
        default="http://localhost:8000/api/v1",
        help="Base URL for BharatOS API Gateway",
    )
    parser.add_argument(
        "--auth-token",
        type=str,
        default=None,
        help="Optional JWT Bearer token for BharatOS",
    )
    parser.add_argument(
        "--save-output",
        type=str,
        default="data/samples/latest_simulated_frame.jpg",
        help="File path to save the latest annotated frame",
    )
    return parser.parse_args()


def annotate_frame(frame, detections, tracked_objects, analysis):
    """Draws visual bounding boxes, tracks, and traffic HUD on frame."""
    annotated = frame.copy()
    
    # Draw detections
    for d in detections:
        x1, y1, x2, y2 = [int(v) for v in d.box]
        color = (0, 0, 255) if d.is_potential_emergency else (0, 255, 0)
        label = f"{d.class_name.upper()} {d.confidence:.2f}"
        if d.is_potential_emergency:
            label = f"[EMERGENCY] {d.emergency_type}"
        
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        cv2.putText(annotated, label, (x1, max(15, y1 - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        # Draw anchor contact patch
        ax, ay = int(d.anchor_point[0]), int(d.anchor_point[1])
        cv2.circle(annotated, (ax, ay), 4, (255, 255, 0), -1)

    # Draw telemetry HUD box in bottom corner
    h, w = annotated.shape[:2]
    hud_h = 100
    cv2.rectangle(annotated, (10, h - hud_h - 10), (360, h - 10), (15, 15, 15), -1)
    cv2.rectangle(annotated, (10, h - hud_h - 10), (360, h - 10), (60, 60, 60), 1)

    cv2.putText(annotated, f"TRAFFIC DENSITY: {analysis.total_pcu:.1f} PCU ({analysis.congestion_level})", (20, h - hud_h + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1)
    cv2.putText(annotated, f"VEHICLES DETECTED: {analysis.total_vehicles} | QUEUE: {analysis.queue_count}", (20, h - hud_h + 45), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 200, 200), 1)
    cv2.putText(annotated, f"FLOW SPEED: {analysis.average_speed_kmh:.1f} km/h | STALLED: {analysis.stalled_vehicle_count}", (20, h - hud_h + 70), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 200, 200), 1)
    
    return annotated


def main():
    args = parse_args()
    print("=" * 75)
    print("      BHARATOS STANDALONE TRAFFIC & YOLO SIMULATION ENGINE")
    print("=" * 75)
    print(f" * Stream Source:    {args.source or 'Synthetic Road Intersection Generator'}")
    print(f" * Camera ID:        {args.camera_id}")
    print(f" * Target FPS:       {args.fps}")
    print(f" * Push to BharatOS: {args.push_to_bharatos} ({args.bharatos_url if args.push_to_bharatos else 'Disabled'})")
    print("=" * 75)

    # Initialize modules
    stream = CameraStreamSimulator(source=args.source, camera_id=args.camera_id, fps=args.fps)
    detector = YoloDetector(weights_path=args.weights)
    tracker = MultiObjectTracker()
    analyzer = TrafficAnalyzer()
    generator = IncidentGenerator(incident_cooldown_seconds=6.0)
    client = BharatOSClient(base_url=args.bharatos_url, auth_token=args.auth_token)

    if args.push_to_bharatos:
        print("\n[Init] Testing connection to BharatOS Gateway...")
        online = client.check_connection()
        if online:
            print(" -> Connection Status: [ONLINE] BharatOS Gateway is responding.")
        else:
            print(" -> Connection Status: [OFFLINE] Gateway unreachable; events will be logged locally.")

    print("\n[Simulation Started] Press Ctrl+C to terminate.\n")
    processed_frames = 0
    total_events_emitted = 0

    try:
        while True:
            ret, frame, timestamp = stream.get_frame()
            if not ret or frame is None:
                print("End of stream reached.")
                break

            processed_frames += 1
            dt = 1.0 / args.fps

            # 1. YOLO Detection
            detections = detector.detect(frame)

            # 2. Multi-Object Tracking & Velocity
            tracked_objects = tracker.update(detections, timestamp=timestamp, dt=dt)

            # 3. Traffic Analysis & PCU
            analysis = analyzer.analyze(
                camera_id=args.camera_id,
                junction_id="SIRIPURAM-JCT-01",
                detections=detections,
                tracked_objects=tracked_objects,
                timestamp=timestamp,
            )

            # 4. Evaluate Incident Triggers
            events = generator.evaluate_and_generate_events(analysis)

            # Print terminal status
            emerg_flag = " [🚨 EMERGENCY VEHICLE]" if len(analysis.emergency_vehicles_detected) > 0 else ""
            print(
                f"[Frame {processed_frames:03d}] "
                f"Vehicles: {analysis.total_vehicles:02d} | "
                f"Density: {analysis.total_pcu:04.1f} PCU | "
                f"Speed: {analysis.average_speed_kmh:04.1f} km/h | "
                f"Status: {analysis.congestion_level:<9}"
                f"{emerg_flag}"
            )

            # 5. Process & Forward Events to BharatOS
            for evt in events:
                total_events_emitted += 1
                print(f"   └──> EMITTED EVENT: {evt.event_type} ({evt.event_id})")

                if args.push_to_bharatos:
                    if evt.event_type == "EMERGENCY_VEHICLE_DETECTED":
                        dispatch_payload = EmergencyDispatchPayload(
                            event_id=evt.event_id,
                            resource_id=f"RES-{evt.payload['vehicle_id']}",
                            external_simulation_id=evt.payload["vehicle_id"],
                            vehicle_type=evt.payload.get("vehicle_type", "AMBULANCE"),
                            priority=evt.payload.get("priority", "CRITICAL"),
                            route=["Siripuram Circle", "Asilmetta Flyover", "King George Hospital"],
                        )
                        res = client.send_emergency_dispatch(dispatch_payload)
                        print(f"        [BharatOS Bridge] Emergency Dispatch: Status={res.get('status_code', 0)} Success={res.get('success')}")
                    else:
                        incident_payload = TrafficIncidentSyncPayload(
                            event_id=evt.event_id,
                            category="severe_congestion" if evt.event_type == "CONGESTION_ALERT" else "traffic_accident",
                            title=evt.payload.get("title", "Traffic Anomaly"),
                            description=evt.payload.get("description", "Detected by vision simulation"),
                            severity=evt.payload.get("severity", "medium").lower(),
                            status="active",
                            extra_data=evt.payload,
                        )
                        res = client.send_incident_sync(incident_payload)
                        print(f"        [BharatOS Bridge] Incident Sync: Status={res.get('status_code', 0)} Success={res.get('success')}")

            # Save annotated frame on last frame
            if args.save_output and (processed_frames == args.max_frames or processed_frames % 10 == 0):
                annotated = annotate_frame(frame, detections, tracked_objects, analysis)
                cv2.imwrite(args.save_output, annotated)

            if args.max_frames > 0 and processed_frames >= args.max_frames:
                break

            time.sleep(max(0.01, stream.frame_delay * 0.5))

    except KeyboardInterrupt:
        print("\nSimulation aborted by user.")

    finally:
        stream.release()

    print("\n" + "=" * 75)
    print("                    SIMULATION RUN COMPLETED")
    print("=" * 75)
    print(f" * Total Frames Processed: {processed_frames}")
    print(f" * Total Events Generated:  {total_events_emitted}")
    if args.save_output and os.path.exists(args.save_output):
        print(f" * Annotated Output Saved: {os.path.abspath(args.save_output)}")
    print("=" * 75)


if __name__ == "__main__":
    main()
