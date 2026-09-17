"""
Standalone Verification Test Suite for BharatOS IoT & AI Data Module.
Tests simulator, telemetry, event generation, datasets, ML engines, gateway, and Vizag context.
"""

import unittest
import asyncio
from datetime import datetime

from config.settings import settings
from devices.models import MotorCommandRequest, MotorStatus
from telemetry.schemas import TelemetryData
from telemetry.processor import TelemetryProcessor
from simulator.sensor_simulator import IoTSensorSimulator
from events.event_generator import EventGenerator, BharatOSEvent
from vizag_context.zones import VIZAG_ZONES, get_zone_by_id
from vizag_context.spatial_graph import ZONE_ADJACENCY, get_affected_zones
from datasets.synthetic_generator import generate_synthetic_samples
from datasets.historical_events import HISTORICAL_FLOOD_EVENTS
from datasets.augmentation import build_training_dataset
from ai_data.xgboost_engine import predict_flood_risk_xgboost, XGBoostInputFeatures
from ai_data.neural_engine import predict_flood_risk_neural
from ai_data.neurofuzzy import interpret_prediction
from gateway.motor_controller import MotorController

class TestBharatOSIoTModule(unittest.TestCase):

    def test_01_config(self):
        self.assertIsNotNone(settings.MODULE_NAME)
        self.assertTrue(settings.SIMULATION_MODE)
        self.assertEqual(settings.WATER_LEVEL_CRITICAL_CM, 120.0)

    def test_02_vizag_context(self):
        self.assertEqual(len(VIZAG_ZONES), 10)
        pm = get_zone_by_id("poorna-market")
        self.assertIsNotNone(pm)
        self.assertEqual(pm["area"], "Old Town")

        affected = get_affected_zones("poorna-market")
        self.assertTrue(len(affected) > 0)
        self.assertEqual(affected[0]["zone"], "gajuwaka")

    def test_03_telemetry_processor(self):
        normal_t = TelemetryData(
            device_id="WL-TEST-01",
            zone_id="mvp-colony",
            water_level_cm=15.0,
            rainfall_mm_hr=10.0,
            soil_moisture=0.45,
            temperature_c=28.0,
            humidity_pct=70.0,
            pressure_hpa=1012.0
        )
        cond, reasons = TelemetryProcessor.evaluate_condition(normal_t)
        self.assertEqual(cond, "NORMAL")
        self.assertEqual(len(reasons), 0)

        critical_t = TelemetryData(
            device_id="WL-TEST-02",
            zone_id="poorna-market",
            water_level_cm=135.0,
            rainfall_mm_hr=95.0,
            soil_moisture=0.95,
            temperature_c=26.0,
            humidity_pct=95.0,
            pressure_hpa=992.0
        )
        cond_crit, reasons_crit = TelemetryProcessor.evaluate_condition(critical_t)
        self.assertEqual(cond_crit, "CRITICAL")
        self.assertTrue(len(reasons_crit) > 0)

    def test_04_sensor_simulator(self):
        sim = IoTSensorSimulator(seed=42)
        telemetry_list = sim.simulate_all_zones()
        self.assertEqual(len(telemetry_list), 5)
        for t in telemetry_list:
            self.assertIsNotNone(t.device_id)
            self.assertIsNotNone(t.water_level_cm)

        # Test emergency generation
        emerg_t = sim.generate_telemetry("node-poorna-market", force_emergency=True)
        self.assertEqual(emerg_t.condition, "CRITICAL")

    def test_05_event_generator(self):
        sim = IoTSensorSimulator(seed=100)
        t = sim.generate_telemetry("node-poorna-market", force_emergency=True)
        event = EventGenerator.from_telemetry(t)
        
        self.assertIsInstance(event, BharatOSEvent)
        self.assertTrue(event.event_id.startswith("EVT-"))
        self.assertEqual(event.source.type, "iot")
        self.assertEqual(event.event_type, "WATER_LEVEL_ANOMALY")
        self.assertEqual(event.severity, "HIGH")
        self.assertIn("water_level_cm", event.measurements)
        self.assertIn("rainfall_mm", event.measurements)
        self.assertAlmostEqual(event.location.lat, 17.6983, places=2)
        self.assertAlmostEqual(event.location.lon, 83.2984, places=2)

    def test_06_datasets_and_augmentation(self):
        synthetic = generate_synthetic_samples(count=50)
        self.assertEqual(len(synthetic), 50)
        self.assertEqual(len(synthetic[0].input_features), 6)
        self.assertEqual(len(synthetic[0].target_risk), 1)

        self.assertTrue(len(HISTORICAL_FLOOD_EVENTS) >= 3)
        dataset = build_training_dataset(HISTORICAL_FLOOD_EVENTS, synthetic_count=20)
        self.assertTrue(len(dataset) > 20)

    def test_07_ai_data_xgboost(self):
        input_data = XGBoostInputFeatures(
            rainfall_1h=85.0,
            soil_moisture=0.90,
            elevation_multiplier=1.8,
            drainage_capacity=6.0,
            pressure_hpa=994.0
        )
        pred = predict_flood_risk_xgboost(input_data)
        self.assertEqual(pred.risk_level, "high")
        self.assertTrue(pred.risk_score > 70.0)
        self.assertTrue(len(pred.feature_importance) > 0)

    def test_08_ai_data_neural_and_neurofuzzy(self):
        neural_pred = predict_flood_risk_neural(
            rain=65.0, soil_moisture=0.85, elevation=1.5, drainage_capacity=8.0, pressure=998.0, humidity=90.0
        )
        self.assertEqual(neural_pred.risk_level, "high")

        fuzzy_eval = interpret_prediction(
            risk_score=neural_pred.risk_score,
            rain=65.0, soil=0.85, elevation=1.5, drainage=8.0, pressure=998.0, humidity=90.0
        )
        self.assertEqual(fuzzy_eval.overall_risk, "high")
        self.assertTrue(len(fuzzy_eval.rules) > 0)

    def test_09_motor_controller(self):
        async def run_async():
            mc = MotorController(simulation_mode=True)
            self.assertTrue(mc.esp32_connected)
            
            # Forward command
            req = MotorCommandRequest(command="motor_a_forward", speed=85)
            res = await mc.handle_command(req)
            self.assertEqual(mc.motor_a_dir, "forward")
            self.assertEqual(mc.motor_a_speed, 85)

            # Emergency Stop command
            req_emerg = MotorCommandRequest(command="emergency_stop")
            await mc.handle_command(req_emerg)
            self.assertTrue(mc.emergency_stop)
            self.assertEqual(mc.motor_a_dir, "stop")

            # Try command during emergency stop -> should raise error
            with self.assertRaises(ValueError):
                await mc.handle_command(MotorCommandRequest(command="motor_a_forward"))

            # Clear emergency stop
            await mc.handle_command(MotorCommandRequest(command="stop"))
            self.assertFalse(mc.emergency_stop)

        asyncio.run(run_async())

if __name__ == "__main__":
    unittest.main()
