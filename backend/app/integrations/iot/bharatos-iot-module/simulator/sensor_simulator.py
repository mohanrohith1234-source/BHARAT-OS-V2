import random
from datetime import datetime
from typing import List, Dict, Optional
from telemetry.schemas import TelemetryData
from telemetry.processor import TelemetryProcessor

class IoTSensorSimulator:
    """
    Simulates real-time multi-sensor telemetry for IoT nodes deployed across Vizag zones.
    Supports normal trends, cloudburst surge, sensor faults, gas leaks, and emergency events.
    """

    def __init__(self, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)

        self.devices: Dict[str, Dict] = {
            "node-poorna-market": {
                "device_id": "WL-PM-001",
                "zone_id": "poorna-market",
                "water_base": 120.0,
                "rain_base": 75.0,
                "online": True,
            },
            "node-gajuwaka": {
                "device_id": "WL-GJ-002",
                "zone_id": "gajuwaka",
                "water_base": 95.0,
                "rain_base": 85.0,
                "online": True,
            },
            "node-gopalapatnam": {
                "device_id": "WL-GP-003",
                "zone_id": "gopalapatnam",
                "water_base": 88.0,
                "rain_base": 65.0,
                "online": True,
            },
            "node-mvp-colony": {
                "device_id": "WL-MVP-004",
                "zone_id": "mvp-colony",
                "water_base": 42.0,
                "rain_base": 35.0,
                "online": True,
            },
            "node-rushikonda": {
                "device_id": "WL-RK-005",
                "zone_id": "rushikonda",
                "water_base": 10.0,
                "rain_base": 15.0,
                "online": True,
            },
        }

    def set_device_status(self, device_key: str, online: bool):
        if device_key in self.devices:
            self.devices[device_key]["online"] = online

    def generate_telemetry(self, device_key: str, force_emergency: bool = False) -> TelemetryData:
        dev = self.devices.get(device_key)
        if not dev:
            # Create dynamic device node if not pre-registered
            dev = {
                "device_id": f"WL-{device_key.upper()}",
                "zone_id": device_key,
                "water_base": 25.0,
                "rain_base": 20.0,
                "online": True,
            }

        online = dev["online"]
        if not online:
            return TelemetryData(
                device_id=dev["device_id"],
                zone_id=dev["zone_id"],
                timestamp=datetime.now(),
                online=False,
                water_level_cm=0.0,
                rainfall_mm_hr=0.0,
                soil_moisture=0.0,
                temperature_c=25.0,
                humidity_pct=50.0,
                pressure_hpa=1013.0,
                smoke_gas_ppm=0.0,
                vibration_g=0.0,
                condition="FAULT"
            )

        # Baseline value fluctuations
        water = max(0.0, dev["water_base"] + random.uniform(-5.0, 5.0))
        rain = max(0.0, dev["rain_base"] + random.uniform(-4.0, 4.0))
        soil = min(1.0, max(0.1, 0.6 + (water / 200.0) + random.uniform(-0.05, 0.05)))
        temp = 28.0 + random.uniform(-2.0, 2.0)
        humidity = min(100.0, max(40.0, 75.0 + (rain / 2.0) + random.uniform(-3.0, 3.0)))
        pressure = max(970.0, min(1030.0, 1008.0 - (rain * 0.25) + random.uniform(-1.0, 1.0)))
        smoke_gas = max(0.0, random.uniform(5.0, 25.0))
        vibration = max(0.0, random.uniform(0.01, 0.2))

        # Emergency override condition
        if force_emergency:
            water += 65.0
            rain += 45.0
            soil = 0.96
            pressure = 992.0
            smoke_gas = 180.0
            vibration = 3.2

        telemetry = TelemetryData(
            device_id=dev["device_id"],
            zone_id=dev["zone_id"],
            timestamp=datetime.now(),
            online=True,
            water_level_cm=round(water, 1),
            rainfall_mm_hr=round(rain, 1),
            soil_moisture=round(soil, 2),
            temperature_c=round(temp, 1),
            humidity_pct=round(humidity, 1),
            pressure_hpa=round(pressure, 1),
            smoke_gas_ppm=round(smoke_gas, 1),
            vibration_g=round(vibration, 3),
            condition="NORMAL"
        )

        condition, _ = TelemetryProcessor.evaluate_condition(telemetry)
        telemetry.condition = condition
        return telemetry

    def simulate_all_zones(self, force_emergency_zone: Optional[str] = None) -> List[TelemetryData]:
        results: List[TelemetryData] = []
        for key in self.devices.keys():
            is_emergency = (force_emergency_zone is not None and self.devices[key]["zone_id"] == force_emergency_zone)
            results.append(self.generate_telemetry(key, force_emergency=is_emergency))
        return results
