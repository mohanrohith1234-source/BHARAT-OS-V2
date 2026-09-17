# BharatOS IoT & AI Data Module (`bharatos-iot-module`)

A clean, modular, and reusable **IoT Device, Simulator, Telemetry, and AI/Data Module** extracted from AquaSentinel for direct integration into **BharatOS**.

This module acts as a supporting layer for BharatOS, supplying live IoT telemetry, simulated multi-sensor feeds, ESP32 device control, ML hydrological flood risk forecasting, synthetic dataset generation, and Vizag geographic context.

---

## Architecture Directory Structure

```
bharatos-iot-module/
├── config/             # Environment configuration & default settings
├── devices/            # ESP32 C++ firmware, pinout specs, & device command schemas
├── gateway/            # FastAPI REST & WebSocket gateway for ESP32 nodes & dashboard clients
├── telemetry/          # Multi-sensor telemetry parser, schema validation, & safety threshold evaluation
├── simulator/          # Multi-sensor IoT simulation engine (water, rain, soil, temp, pressure, gas, vibration)
├── events/             # Generic BharatOS event generator & JSON schema formatter
├── datasets/           # Synthetic data generation, historical flood records, & data augmentation
├── ai_data/            # ML hydrology models (XGBoost, Neural Engine, Neurofuzzy rules, feature importance)
├── camera/             # ESP32-CAM MJPEG stream proxy & snapshot handlers
├── vizag-context/      # Visakhapatnam zone geometries, elevation, drainage, & spatial adjacency graphs
├── requirements.txt    # Module dependencies
├── test_module.py      # Automated test runner verifying all module capabilities
└── README.md           # Documentation & integration guide
```

---

## 1. What Was Retained from AquaSentinel

- **IoT / Device Gateway**: ESP32 REST & WebSocket communication interface, command dispatcher, and connection watchdog.
- **Actuator & Safety Controls**: Dual DC motor control (L298N H-Bridge), SG90 servo motor control, onboard LED toggle, and hard emergency stop reset.
- **ESP32-CAM Capabilities**: MJPEG camera stream proxy and HTTP snapshot grabber.
- **IoT Simulator**: Multi-sensor simulator generating water level, rainfall, soil moisture, temperature, humidity, pressure, gas/smoke, and vibration readings.
- **Datasets & AI Pipeline**:
  - Synthetic training data generator based on hydrological physical formulas.
  - Historical flood event records and schemas.
  - Data augmentation (spatial cascade & noise-based variations).
  - XGBoost gradient-boosted decision tree risk predictor & feature importance calculation.
  - Neural network risk prediction formula.
  - Neurofuzzy explainable AI rule interpreter.
- **Visakhapatnam (Vizag) Context**: Geo-coordinates, elevation factors, drainage capacities, road networks, and spatial zone adjacency graph for 10 Vizag zones.

---

## 2. What Was Removed and Why

- **AquaSentinel Branding & UI Shell**: Removed app pages, headers, footers, sidebars, logos, CSS modules, and custom branding to allow native BharatOS UI integration.
- **Role Portals**: Removed Citizen Portal, Authority Portal, and Farmer Portal UI pages.
- **FieldShield Functionality**: Removed FieldShield UI components and application logic.
- **Supabase & Authentication**: Removed Supabase client dependencies, AuthContext, role callbacks, and database migrations.
- **Secrets & Hardcoded IPs**: Removed all private IP addresses, Wi-Fi credentials, passwords, and API keys.

---

## 3. IoT Simulator Usage

The simulator generates multi-sensor telemetry for Vizag zones with support for normal variations, extreme cloudbursts, low-pressure cyclonic drops, sensor faults, gas leaks, and emergency overrides.

### Python Example:
```python
from simulator.sensor_simulator import IoTSensorSimulator

simulator = IoTSensorSimulator(seed=42)

# Generate normal telemetry across all 5 registered nodes
telemetry_list = simulator.simulate_all_zones()
for t in telemetry_list:
    print(f"Device: {t.device_id} | Zone: {t.zone_id} | Water: {t.water_level_cm} cm | Rain: {t.rainfall_mm_hr} mm/h")

# Simulate emergency cloudburst in Poorna Market
emergency_t = simulator.generate_telemetry("node-poorna-market", force_emergency=True)
print(f"Emergency Condition: {emergency_t.condition}")
```

---

## 4. ESP32 Integration

- Firmware location: `devices/esp32_firmware.ino`
- Pinout documentation: `devices/hardware_pinout.md`

### Flashing & Setup:
1. Open `devices/esp32_firmware.ino` in Arduino IDE or PlatformIO.
2. Set `WIFI_SSID`, `WIFI_PASS`, `GATEWAY_HOST`, and `GATEWAY_PORT`.
3. Flash to ESP32 NodeMCU DevKit V1.
4. When powered, the ESP32 automatically connects to `ws://<GATEWAY_HOST>:8000/ws/esp32` and broadcasts heartbeat status packets.

---

## 5. Telemetry Flow

```
ESP32 Node / Simulator
         ↓
  Raw Telemetry
         ↓
Telemetry Processor (evaluates safety thresholds & anomalies)
         ↓
Event Generator (formats standardized JSON event)
         ↓
     BharatOS
```

---

## 6. Event Format

The module outputs standardized JSON events that conform to the BharatOS contract:

```json
{
  "event_id": "EVT-001",
  "source": {
    "type": "iot",
    "device_id": "WL-PM-001"
  },
  "event_type": "WATER_LEVEL_ANOMALY",
  "location": {
    "lat": 17.6983,
    "lon": 83.2984
  },
  "measurements": {
    "water_level_cm": 135.0,
    "rainfall_mm": 95.0,
    "soil_moisture": 0.95,
    "temperature_c": 26.0,
    "humidity_pct": 95.0,
    "pressure_hpa": 992.0,
    "smoke_gas_ppm": 180.0,
    "vibration_g": 3.2
  },
  "severity": "HIGH",
  "timestamp": "2026-09-17T15:00:00.000000+00:00"
}
```

---

## 7. Dataset / Training-Data Functionality

The `datasets/` module provides data pipelines for AI model training:
- `synthetic_generator.py`: Generates physics-based synthetic samples using hydrological infiltration formulas.
- `historical_events.py`: Contains structured historical Vizag flood event records.
- `augmentation.py`: Applies spatial cascade learning (neighboring zone risk propagation) and Gaussian noise augmentation.

---

## 8. Synthetic-Data Generation

To generate synthetic hydrological samples:
```python
from datasets.synthetic_generator import generate_synthetic_samples

# Generate 500 training samples
samples = generate_synthetic_samples(count=500)
sample = samples[0]
print("Inputs [rain, soil, elevation, drainage, pressure, humidity]:", sample.input_features)
print("Target Risk (0.0 to 1.0):", sample.target_risk)
```

---

## 9. Historical-Event Data Usage

Convert real historical flood records into ML training sets:
```python
from datasets.historical_events import HISTORICAL_FLOOD_EVENTS
from datasets.augmentation import build_training_dataset

# Build a combined dataset (1000 synthetic + real historical events & augmented variations)
dataset = build_training_dataset(HISTORICAL_FLOOD_EVENTS, synthetic_count=1000)
print(f"Total training samples: {len(dataset)}")
```

---

## 10. Vizag-Specific Data Retained

- **Zones Supported**: Poorna Market, Gajuwaka, Gopalapatnam, MVP Colony, Dwaraka Nagar, Seethammadhara, PM Palem, Rushikonda, Madhurawada, Steel Plant Area.
- **Geographical Attributes**: Latitude/longitude centroids, polygon boundaries, basin elevation levels, drainage discharge baselines, population affected, and primary road links.
- **Spatial Adjacency Graph**: Graph mapping nearest-neighbor flood propagation dynamics across Vizag wards.

---

## 11. How BharatOS Can Consume Events

BharatOS can consume events in two ways:

1. **Direct Python Import**:
   ```python
   from simulator.sensor_simulator import IoTSensorSimulator
   from events.event_generator import EventGenerator

   simulator = IoTSensorSimulator()
   telemetry = simulator.generate_telemetry("node-poorna-market", force_emergency=True)

   # Convert to BharatOS Event
   event = EventGenerator.from_telemetry(telemetry)
   print(event.model_dump_json(indent=2))
   ```

2. **FastAPI HTTP / WebSocket Gateway**:
   - Start Gateway: `uvicorn gateway.main:app --port 8000`
   - Connect to `/ws/dashboard` for live status streams.
   - Post motor/actuator commands to `/api/motor/command`.

---

## 12. Dependencies & Running the Module

### Prerequisites
- Python 3.10+

### Installation
```bash
pip install -r requirements.txt
```

### Running Automated Test Suite
To verify all module components (simulator, telemetry, events, ML models, and gateway):
```bash
python -m unittest test_module.py
```

### Starting the Gateway
```bash
uvicorn gateway.main:app --host 0.0.0.0 --port 8000
```
