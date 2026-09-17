import os
from pydantic import BaseModel, Field

class Settings(BaseModel):
    """
    Central Configuration Settings for BharatOS IoT & AI Data Module.
    No hardcoded secrets or private IP addresses.
    """
    MODULE_NAME: str = "BharatOS IoT & AI Data Module"
    VERSION: str = "1.0.0"

    # Gateway & Server Settings
    HOST: str = os.getenv("BHARATOS_IOT_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("BHARATOS_IOT_PORT", "8000"))
    SIMULATION_MODE: bool = os.getenv("BHARATOS_SIMULATION_MODE", "true").lower() in ("true", "1", "yes")
    DEVICE_ID: str = os.getenv("BHARATOS_DEVICE_ID", "esp32-node-01")
    HEARTBEAT_INTERVAL: float = float(os.getenv("BHARATOS_HEARTBEAT_INTERVAL", "2.0"))

    # ESP32-CAM Defaults (Configurable via ENV)
    DEFAULT_CAM_HOST: str = os.getenv("BHARATOS_CAM_HOST", "192.168.1.100")
    CAM_STREAM_PORT: int = int(os.getenv("BHARATOS_CAM_STREAM_PORT", "81"))
    CAM_CONTROL_PORT: int = int(os.getenv("BHARATOS_CAM_CONTROL_PORT", "80"))

    # Thresholds for Safety & Anomalies
    WATER_LEVEL_HIGH_CM: float = 80.0
    WATER_LEVEL_CRITICAL_CM: float = 120.0
    RAINFALL_HEAVY_MM_HR: float = 50.0
    SOIL_MOISTURE_SATURATED: float = 0.85
    PRESSURE_STORM_HPA: float = 1000.0

    # CORS settings
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
