from typing import List, Dict, Optional

VIZAG_ZONES: List[Dict] = [
    {
        "id": "poorna-market",
        "name": "Poorna Market",
        "area": "Old Town",
        "risk_baseline": "high",
        "elevation": 2.0,
        "drainage": 5.0,
        "population": 24500,
        "center": [17.6983, 83.2984],
        "coordinates": [
            [17.7010, 83.2950],
            [17.7010, 83.3020],
            [17.6960, 83.3020],
            [17.6960, 83.2950]
        ],
        "roads": ["Old Town Road", "Jagadamba Junction"]
    },
    {
        "id": "gajuwaka",
        "name": "Gajuwaka",
        "area": "Industrial Zone",
        "risk_baseline": "high",
        "elevation": 1.5,
        "drainage": 10.0,
        "population": 31000,
        "center": [17.6867, 83.2095],
        "coordinates": [
            [17.6920, 83.2050],
            [17.6920, 83.2140],
            [17.6810, 83.2140],
            [17.6810, 83.2050]
        ],
        "roads": ["Gajuwaka Main Road", "Steel Plant Road"]
    },
    {
        "id": "gopalapatnam",
        "name": "Gopalapatnam",
        "area": "North Visakhapatnam",
        "risk_baseline": "high",
        "elevation": 1.6,
        "drainage": 8.0,
        "population": 18200,
        "center": [17.7588, 83.2506],
        "coordinates": [
            [17.7640, 83.2460],
            [17.7640, 83.2550],
            [17.7530, 83.2550],
            [17.7530, 83.2460]
        ],
        "roads": ["Gopalapatnam Road", "NH-16 Junction"]
    },
    {
        "id": "mvp-colony",
        "name": "MVP Colony",
        "area": "Central Vizag",
        "risk_baseline": "medium",
        "elevation": 1.0,
        "drainage": 15.0,
        "population": 12800,
        "center": [17.7326, 83.3304],
        "coordinates": [
            [17.7380, 83.3260],
            [17.7380, 83.3350],
            [17.7270, 83.3350],
            [17.7270, 83.3260]
        ],
        "roads": ["MVP Colony Main Road", "50th Ward Road"]
    },
    {
        "id": "dwaraka-nagar",
        "name": "Dwaraka Nagar",
        "area": "Central Vizag",
        "risk_baseline": "medium",
        "elevation": 1.2,
        "drainage": 12.0,
        "population": 9400,
        "center": [17.7262, 83.3130],
        "coordinates": [
            [17.7310, 83.3090],
            [17.7310, 83.3170],
            [17.7210, 83.3170],
            [17.7210, 83.3090]
        ],
        "roads": ["Dwaraka Nagar Main Road", "RTC Complex Road"]
    },
    {
        "id": "seethammadhara",
        "name": "Seethammadhara",
        "area": "North Vizag",
        "risk_baseline": "medium",
        "elevation": 0.9,
        "drainage": 18.0,
        "population": 7200,
        "center": [17.7425, 83.3219],
        "coordinates": [
            [17.7470, 83.3180],
            [17.7470, 83.3260],
            [17.7380, 83.3260],
            [17.7380, 83.3180]
        ],
        "roads": ["Seethammadhara Main Road"]
    },
    {
        "id": "pm-palem",
        "name": "PM Palem",
        "area": "West Vizag",
        "risk_baseline": "low",
        "elevation": 0.4,
        "drainage": 20.0,
        "population": 3200,
        "center": [17.7723, 83.2261],
        "coordinates": [
            [17.7770, 83.2220],
            [17.7770, 83.2300],
            [17.7670, 83.2300],
            [17.7670, 83.2220]
        ],
        "roads": ["PM Palem Main Road"]
    },
    {
        "id": "rushikonda",
        "name": "Rushikonda",
        "area": "Beach Zone",
        "risk_baseline": "low",
        "elevation": 0.3,
        "drainage": 25.0,
        "population": 1500,
        "center": [17.7889, 83.3765],
        "coordinates": [
            [17.7940, 83.3720],
            [17.7940, 83.3810],
            [17.7840, 83.3810],
            [17.7840, 83.3720]
        ],
        "roads": ["Beach Road", "Rushikonda Beach Access"]
    },
    {
        "id": "madhurawada",
        "name": "Madhurawada",
        "area": "IT Corridor",
        "risk_baseline": "low",
        "elevation": 0.5,
        "drainage": 22.0,
        "population": 2800,
        "center": [17.7898, 83.3551],
        "coordinates": [
            [17.7950, 83.3510],
            [17.7950, 83.3590],
            [17.7850, 83.3590],
            [17.7850, 83.3510]
        ],
        "roads": ["Madhurawada Main Road", "Tech Park Road"]
    },
    {
        "id": "steel-plant",
        "name": "Steel Plant Area",
        "area": "Industrial",
        "risk_baseline": "high",
        "elevation": 1.4,
        "drainage": 10.0,
        "population": 15600,
        "center": [17.6756, 83.2342],
        "coordinates": [
            [17.6810, 83.2300],
            [17.6810, 83.2390],
            [17.6700, 83.2390],
            [17.6700, 83.2300]
        ],
        "roads": ["Steel Plant Gate Road", "RINL Access Road"]
    }
]

ZONE_PROPERTIES: Dict[str, Dict[str, float]] = {
    z["id"]: {"elevation": z["elevation"], "drainage": z["drainage"]}
    for z in VIZAG_ZONES
}

def get_zone_by_id(zone_id: str) -> Optional[Dict]:
    for z in VIZAG_ZONES:
        if z["id"] == zone_id:
            return z
    return None
