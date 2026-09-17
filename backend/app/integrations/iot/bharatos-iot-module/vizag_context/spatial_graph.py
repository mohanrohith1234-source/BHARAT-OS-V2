from typing import Dict, List

ZONE_ADJACENCY: Dict[str, List[str]] = {
    'poorna-market':    ['gajuwaka', 'dwaraka-nagar', 'seethammadhara', 'steel-plant'],
    'gajuwaka':         ['poorna-market', 'steel-plant', 'anandapuram', 'gopalapatnam'],
    'gopalapatnam':     ['gajuwaka', 'madhurawada', 'pm-palem'],
    'mvp-colony':       ['seethammadhara', 'dwaraka-nagar', 'rushikonda'],
    'dwaraka-nagar':    ['mvp-colony', 'poorna-market', 'seethammadhara'],
    'seethammadhara':   ['mvp-colony', 'poorna-market', 'dwaraka-nagar', 'gopalapatnam'],
    'pm-palem':         ['gopalapatnam', 'madhurawada'],
    'rushikonda':       ['madhurawada', 'mvp-colony'],
    'madhurawada':      ['rushikonda', 'gopalapatnam', 'pm-palem'],
    'steel-plant':      ['gajuwaka', 'poorna-market'],
}

def get_zone_proximity_weight(from_zone: str, to_zone: str) -> float:
    """
    Returns proximity weight between two zones (1.0 = same zone, 0.7 = direct neighbor, 0.4 = two hops).
    """
    if from_zone == to_zone:
        return 1.0
    neighbors = ZONE_ADJACENCY.get(from_zone, [])
    if to_zone in neighbors:
        return 0.7
    for neighbor in neighbors:
        second_hop = ZONE_ADJACENCY.get(neighbor, [])
        if to_zone in second_hop:
            return 0.4
    return 0.1

def get_affected_zones(flood_zone: str) -> List[Dict[str, float]]:
    """
    Returns neighbor zones affected by a flood cascade in flood_zone, sorted by proximity weight.
    """
    all_zones = list(ZONE_ADJACENCY.keys())
    results = []
    for z in all_zones:
        if z != flood_zone:
            w = get_zone_proximity_weight(flood_zone, z)
            if w > 0.1:
                results.append({"zone": z, "weight": w})
    results.sort(key=lambda x: x["weight"], reverse=True)
    return results
