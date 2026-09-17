"""
Visakhapatnam (Vizag) geographical context, flood zones, and spatial adjacency graphs.
"""
from .zones import VIZAG_ZONES, get_zone_by_id, ZONE_PROPERTIES
from .spatial_graph import ZONE_ADJACENCY, get_zone_proximity_weight, get_affected_zones

__all__ = [
    "VIZAG_ZONES",
    "get_zone_by_id",
    "ZONE_PROPERTIES",
    "ZONE_ADJACENCY",
    "get_zone_proximity_weight",
    "get_affected_zones"
]
