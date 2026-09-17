"""
Pytest configuration for BharatOS backend test runner.
Inserts modular integration packages into sys.path.
"""

import sys
import os

backend_root = os.path.dirname(os.path.abspath(__file__))

iot_module_path = os.path.join(backend_root, "app", "integrations", "iot", "bharatos-iot-module")
if os.path.exists(iot_module_path) and iot_module_path not in sys.path:
    sys.path.insert(0, iot_module_path)

traffic_module_path = os.path.join(backend_root, "app", "integrations", "traffic", "bharatos-traffic-simulation")
if os.path.exists(traffic_module_path) and traffic_module_path not in sys.path:
    sys.path.insert(0, traffic_module_path)
