from pydantic import BaseModel, Field
from typing import List

class FloodEventRecord(BaseModel):
    id: str
    zone_id: str
    timestamp: str
    weather_rainfall: float
    weather_soil_moisture: float
    weather_pressure: float
    weather_humidity: float
    predicted_risk: float
    actual_outcome: str
    actions_taken: str
    lives_saved: int
    surrounding_zones: List[str]
    lesson_learned: str

HISTORICAL_FLOOD_EVENTS: List[FloodEventRecord] = [
    FloodEventRecord(
        id="evt-hist-001",
        zone_id="poorna-market",
        timestamp="2024-10-12T04:30:00Z",
        weather_rainfall=112.5,
        weather_soil_moisture=0.92,
        weather_pressure=994.0,
        weather_humidity=96.0,
        predicted_risk=94.0,
        actual_outcome="Severe Inundation (142cm depth)",
        actions_taken="Evacuated 24,500 residents; deployed 4 heavy motor pumps",
        lives_saved=120,
        surrounding_zones=["dwaraka-nagar", "gajuwaka", "seethammadhara"],
        lesson_learned="Old Town storm drains overflow within 40 minutes of >90mm/h rainfall."
    ),
    FloodEventRecord(
        id="evt-hist-002",
        zone_id="gajuwaka",
        timestamp="2024-11-04T14:15:00Z",
        weather_rainfall=94.0,
        weather_soil_moisture=0.88,
        weather_pressure=998.0,
        weather_humidity=92.0,
        predicted_risk=86.0,
        actual_outcome="Industrial Zone Waterlogging (118cm depth)",
        actions_taken="Shifted steel plant shift workers; blocked low-lying bypass road",
        lives_saved=45,
        surrounding_zones=["steel-plant", "poorna-market"],
        lesson_learned="Industrial runoff multiplies natural basin accumulation by 1.3x."
    ),
    FloodEventRecord(
        id="evt-hist-003",
        zone_id="gopalapatnam",
        timestamp="2025-07-22T08:00:00Z",
        weather_rainfall=78.0,
        weather_soil_moisture=0.81,
        weather_pressure=1001.0,
        weather_humidity=89.0,
        predicted_risk=78.0,
        actual_outcome="NH-16 Highway Submergence (105cm depth)",
        actions_taken="Rerouted national highway traffic via Inner Ring Road",
        lives_saved=30,
        surrounding_zones=["madhurawada", "pm-palem"],
        lesson_learned="Highway culverts block quickly due to silt deposit during monsoon onset."
    ),
]
