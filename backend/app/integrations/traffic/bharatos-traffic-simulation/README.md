# BharatOS Traffic & YOLO Vision Simulation Package

A standalone, lightweight Computer Vision and Traffic Telemetry Simulation toolkit extracted specifically for **BharatOS**.

This package runs **completely independently** from the main BharatOS repository. It simulates traffic camera/CCTV video feeds, performs YOLOv8 vehicle detection, tracks vehicles, calculates macroscopic traffic metrics (speed, PCU, queues), and transmits clean event payloads to a live BharatOS instance.

---

## 🎯 Architecture & Data Flow

```
+---------------------------+
| Traffic Video / Camera    |  (Video file, Image sequence, Webcam, or Synthetic Generator)
+---------------------------+
              | (RGB Frames @ 15 FPS)
              v
+---------------------------+
| YOLOv8 Object Detection   |  (Car, Motorcycle, Bus, Truck, Bicycle, Pedestrian)
| & Emergency Classifier    |  (Ambulance, Fire Tender, Police)
+---------------------------+
              | (Detections + Contact Patch Anchors)
              v
+---------------------------+
| Multi-Object Tracker      |  (Centroid & IoU association, speed km/h, dwell times)
+---------------------------+
              | (Active Trajectories)
              v
+---------------------------+
| Traffic Flow Analyzer     |  (PCU density, average speed, congestion level, queues)
+---------------------------+
              | (Macroscopic Traffic State)
              v
+---------------------------+
| Incident Generator        |  (Evaluates thresholds: Emergency spot, Gridlock, Hazard)
+---------------------------+
              | (Structured BharatOS JSON)
              v
+---------------------------+
| BharatOS REST Gateway     |  (POST /api/v1/traffic/events/emergency-dispatch)
| (Port 8000 / 8005)        |  (POST /api/v1/traffic/sync/incident)
+---------------------------+
```

---

## 📂 Extracted Directory Structure

```
bharatos-traffic-simulation/
├── simulator/
│   ├── __init__.py
│   ├── camera_stream.py       # Video reader, image sequencer, and synthetic camera feed generator
│   ├── traffic_analyzer.py    # Density (PCU), average speed, queue length, and congestion classifier
│   └── incident_generator.py  # Generates actionable event payloads (emergency, congestion, hazard)
├── yolo/
│   ├── __init__.py
│   ├── detector.py            # YOLOv8 object detector with graceful fallback for non-GPU machines
│   ├── tracker.py             # Multi-object centroid & IoU tracking with velocity estimation
│   ├── emergency_detector.py  # Secondary chromatic profile analyzer for emergency vehicle liveries
│   └── config.py              # COCO classes, IRC PCU weights, and confidence thresholds
├── data/
│   ├── samples/
│   │   ├── ambulance_sample.jpg   # Sample emergency traffic frame
│   │   └── junction_annotated.jpg # Sample annotated multi-lane traffic junction
│   ├── events/
│   │   ├── example_emergency_dispatch.json # Ready-to-send green corridor dispatch payload
│   │   ├── example_congestion_event.json   # Ready-to-send traffic congestion payload
│   │   └── example_incident_event.json     # Ready-to-send road hazard incident payload
│   └── yolov8n.pt             # Pre-trained YOLOv8 nano model weights (6.5 MB)
├── integration/
│   ├── __init__.py
│   ├── bharatos_client.py     # Resilient HTTP client communicating with BharatOS Gateway
│   ├── event_schemas.py       # Pydantic data schemas matching BharatOS API contracts
│   └── test_integration.py    # Self-test script to verify pipeline integrity
├── run_simulation.py          # Main CLI runner for live simulation and telemetry streaming
├── requirements.txt           # Minimal standalone Python dependencies
└── README.md                  # Complete documentation and integration guide
```

---

## ⚡ Quickstart

### 1. Install Dependencies
In your Python environment (Python 3.9+ recommended):
```bash
pip install -r requirements.txt
```

### 2. Run Self-Test
Verify that detection, tracking, analysis, and event generation work:
```bash
python integration/test_integration.py
```

### 3. Run the Live Simulation
Run using the built-in synthetic traffic camera generator (no video file required):
```bash
python run_simulation.py
```

Run against a custom video file or image:
```bash
# Using a video file
python run_simulation.py --source /path/to/traffic_video.mp4 --fps 15

# Using a sample image
python run_simulation.py --source data/samples/ambulance_sample.jpg --max-frames 20
```

---

## 🔗 Connecting to Your Friend's Live BharatOS

This package does **not** overwrite or modify any files in your friend's BharatOS codebase. It interacts solely over standard HTTP REST endpoints.

### Step 1: Ensure BharatOS is Running
Your friend's BharatOS backend should be running (default `http://localhost:8000`).

### Step 2: Stream Live Events to BharatOS
Pass the `--push-to-bharatos` flag to transmit detected events automatically:
```bash
python run_simulation.py --push-to-bharatos --bharatos-url http://localhost:8000/api/v1
```

If his backend requires an administrative JWT token:
```bash
python run_simulation.py --push-to-bharatos --auth-token "YOUR_JWT_TOKEN_HERE"
```

---

## 📡 BharatOS API Endpoints & Payload Contracts

### 1. Emergency Green Corridor Trigger
When an ambulance or fire tender is spotted by the YOLO vision pipeline, it transmits to:
- **Endpoint**: `POST /api/v1/traffic/events/emergency-dispatch`
- **Purpose**: Queues an AI Green Corridor recommendation in `PENDING_REVIEW` on the BharatOS Operator Dashboard.

**Payload Example** (`data/events/example_emergency_dispatch.json`):
```json
{
  "event_id": "DISPATCH-AMB-8813-001",
  "event_type": "EMERGENCY_DISPATCHED",
  "timestamp": "2026-09-17T15:00:00Z",
  "source": "BHARATOS_YOLO_SIMULATOR",
  "resource_id": "RES-AMB-021",
  "external_simulation_id": "AMB-021",
  "vehicle_type": "AMBULANCE",
  "origin": {
    "latitude": 17.7215,
    "longitude": 83.3055,
    "label": "Siripuram Circle (Camera CAM-01)"
  },
  "destination": {
    "latitude": 17.7120,
    "longitude": 83.3180,
    "label": "King George Hospital (KGH Emergency Wing)"
  },
  "priority": "CRITICAL",
  "route": [
    "Siripuram Circle",
    "Asilmetta Flyover",
    "Jagadamba Junction",
    "KGH Emergency Gate"
  ]
}
```

### 2. Traffic Congestion & Road Hazard Incidents
When severe queues or stalled vehicles are detected, it transmits to:
- **Endpoint**: `POST /api/v1/traffic/sync/incident`
- **Purpose**: Synchronizes an active incident to the BharatOS relational incident ledger and 2D GIS map.

**Payload Example** (`data/events/example_congestion_event.json`):
```json
{
  "event_id": "INC-CONG-9901-A",
  "category": "severe_congestion",
  "title": "Severe Traffic Gridlock Detected at Siripuram Junction",
  "description": "YOLO Traffic Camera CAM-01 recorded persistent vehicle queue exceeding 28.5 PCU with average flow speed under 6.2 km/h.",
  "latitude": 17.7215,
  "longitude": 83.3055,
  "address": "Siripuram Junction Approach, Visakhapatnam",
  "severity": "critical",
  "status": "active",
  "scenario_id": "YOLO_VISION_PERCEPTION",
  "extra_data": {
    "camera_id": "CAM-VIZAG-01",
    "total_vehicles_counted": 34,
    "pcu_density": 28.5,
    "average_speed_kmh": 6.2,
    "queue_count": 18,
    "provenance": "SIMULATED"
  }
}
```

---

## 🛠️ CLI Arguments Reference

| Flag | Default | Description |
| :--- | :--- | :--- |
| `--source` | `None` (Synthetic) | Path to video file (`.mp4`), image (`.jpg`), camera index (`0`), or blank |
| `--camera-id` | `CAM-VIZAG-01` | Identifier of simulated camera location |
| `--fps` | `10.0` | Target simulation frame rate |
| `--max-frames` | `25` | Maximum frames to run (0 for continuous loop) |
| `--push-to-bharatos`| `False` | Enables live HTTP transmission of events to BharatOS |
| `--bharatos-url` | `http://localhost:8000/api/v1` | BharatOS Gateway base URL |
| `--auth-token` | `None` | Optional Bearer JWT token |
| `--save-output` | `data/samples/latest_simulated_frame.jpg` | Saves annotated frame with HUD telemetry |

---

## 🔒 Zero-Interference Safety Guarantee

- **Decoupled**: Does not touch any existing database tables or files in your friend's BharatOS repository.
- **Fail-Open**: If BharatOS is stopped or offline, the simulation continues running without crashing, storing events locally.
- **Strict Data Provenance**: All generated telemetry and events are stamped with `"provenance": "SIMULATED"` ensuring synthetic data never contaminates live municipal logs.
