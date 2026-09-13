'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import TimelinePlaybackWidget from '../../../components/widgets/TimelinePlaybackWidget'
import AssetDetailsDrawer from '../../../components/widgets/AssetDetailsDrawer'
import { SelectedAssetDetail } from '../../../lib/digitalTwin/selectionManager'
import { GeoJsonManager } from '../../../lib/digitalTwin/geoJsonManager'
import { HeatmapManager } from '../../../lib/digitalTwin/heatmapManager'
import { useVizagDataStore } from '../../../store/useVizagDataStore'
import { 
  apiService, 
  BackendIncident, 
  BackendFacility, 
  BackendResource, 
  BackendDigitalTwinNode 
} from '../../../services/api'

export default function DigitalTwinPage() {
  const [currentHour, setCurrentHour] = useState<number>(9)
  const [selectedAsset, setSelectedAsset] = useState<SelectedAssetDetail | null>(null)
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  // Live database states
  const [incidents, setIncidents] = useState<BackendIncident[]>([])
  const [facilities, setFacilities] = useState<BackendFacility[]>([])
  const [resources, setResources] = useState<BackendResource[]>([])
  const [nodes, setNodes] = useState<BackendDigitalTwinNode[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Synchronized Master Scenario Store
  const { incident, resources: vizagResources, sensors: vizagSensors, trafficCorridors, demoStage, simulationTime } = useVizagDataStore()

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    Promise.all([
      apiService.getIncidents({ 
        category: categoryFilter, 
        severity: severityFilter 
      }),
      apiService.getFacilities({ limit: 100 }),
      apiService.getResources({ limit: 100 }),
      apiService.getDigitalTwinNodes({ limit: 100 }),
      apiService.getDigitalTwinConnections()
    ]).then(([incidentsRes, facilitiesRes, resourcesRes, nodesRes, connectionsRes]) => {
      if (!isMounted) return
      setIncidents(incidentsRes)
      setFacilities(facilitiesRes.items || [])
      setResources(resourcesRes.items || [])
      setNodes(nodesRes.items || [])
      setConnections(connectionsRes.items || [])
      setLoading(false)
    }).catch(err => {
      console.error("Failed to load digital twin data", err)
      if (isMounted) setLoading(false)
    })

    return () => { isMounted = false }
  }, [categoryFilter, severityFilter])

  // Convert DB items to map markers
  const incidentMarkers: MapMarker[] = incidents
    .filter(inc => {
      const createdHour = new Date(inc.created_at).getHours()
      return isNaN(createdHour) || createdHour <= currentHour
    })
    .map(inc => ({
      id: `inc-${inc.id}`,
      position: [inc.latitude, inc.longitude] as [number, number],
      title: `🔥 [${inc.category.toUpperCase()}] ${inc.title}`,
      description: `${inc.description} • Severity: ${inc.severity} • Status: ${inc.status}`,
      category: inc.severity === 'critical' ? 'critical' as const : inc.severity === 'high' ? 'high' as const : inc.severity === 'medium' ? 'medium' as const : 'low' as const
    }))

  // Dynamic simulation master incident marker
  const simulationIncidentMarker: MapMarker[] = incident.status !== 'resolved' ? [{
    id: `sim-inc-1042`,
    position: [17.7210, 83.3180],
    title: `🚨 [SIMULATION INCIDENT] INC-1042 Beach Road Culvert Flooding`,
    description: `Water Depth: ${incident.waterDepthCm}cm • Status: ${incident.status.toUpperCase()} • Assigned: ${incident.assignedUnits.join(', ')} • Auth: ${incident.humanSignOff ? 'APPROVED' : 'PENDING'}`,
    category: 'critical' as const
  }] : []

  const facilityMarkers: MapMarker[] = facilities.map(fac => {
    let emoji = '🏥'
    if (fac.facility_type === 'POLICE_STATION') emoji = '👮'
    if (fac.facility_type === 'FIRE_STATION') emoji = '🚒'
    
    return {
      id: `fac-${fac.id}`,
      position: [fac.latitude, fac.longitude] as [number, number],
      title: `${emoji} ${fac.name}`,
      description: `Type: ${fac.facility_type} • Source: ${fac.source_type} • Address: ${fac.address || 'N/A'}`,
      category: 'info' as const
    }
  })

  // Static DB resources (excluding simulated units to prevent duplicates)
  const dbResourceMarkers: MapMarker[] = resources
    .filter(res => !['P-305', 'FT-12', 'A-21', 'P-101', 'DP-04'].includes(res.name))
    .map(res => {
      let emoji = '🚗'
      if (res.type === 'ambulance') emoji = '🚑'
      if (res.type === 'fire_truck') emoji = '🚒'
      if (res.type === 'patrol_car') emoji = '🚓'

      return {
        id: `res-${res.id}`,
        position: [res.latitude, res.longitude] as [number, number],
        title: `${emoji} ${res.name}`,
        description: `Type: ${res.type} • Status: ${res.status}`,
        category: 'info' as const
      }
    })

  // Dynamic moving simulation vehicles from useVizagDataStore
  const dynamicSimVehicleMarkers: MapMarker[] = Object.values(vizagResources).map(res => {
    let emoji = '🚗'
    let cat: 'critical' | 'high' | 'medium' | 'low' = 'low'
    if (res.type === 'ambulance') emoji = '🚑'
    if (res.type === 'fire') emoji = '🚒'
    if (res.type === 'police') emoji = '🚓'
    if (res.type === 'pump') emoji = '💧'

    if (res.status === 'on_scene' || res.status === 'operating') cat = 'critical'
    else if (res.status === 'en_route') cat = 'high'
    else if (res.status === 'dispatched') cat = 'medium'

    return {
      id: `sim-veh-${res.id}`,
      position: res.coords,
      title: `${emoji} [${res.id}] ${res.callSign} (${res.department})`,
      description: `Status: ${res.status.toUpperCase()} • Speed: ${res.speed} • Location: ${res.location} • ETA: ${res.eta} • Assignment: ${res.currentAssignment || 'N/A'} • Source: ${res.provenance}`,
      category: cat
    }
  })

  // Static DB nodes
  const dbNodeMarkers: MapMarker[] = nodes.map(node => {
    const isRealIoT = node.id === '847ac10b-58cc-4372-a567-0e02b2c3d486' || node.name?.toLowerCase().includes('beach road')
    return {
      id: `node-${node.id}`,
      position: [node.latitude, node.longitude] as [number, number],
      title: isRealIoT 
        ? `⚡ [REAL IoT] ${node.name}` 
        : (node.type === 'weather' ? `⛈️ [OPEN DATA] ${node.name}` : `🌊 [SIMULATED] ${node.name}`),
      description: `Hydrological Sensor Node • Status: ${node.status} • Source: ${isRealIoT ? 'REAL_IOT' : 'SIMULATED'} • Value: ${typeof node.last_telemetry === 'object' ? JSON.stringify(node.last_telemetry) : (node.last_telemetry || 'N/A')}`,
      category: node.status === 'critical' ? 'critical' as const : node.status === 'warning' ? 'high' as const : 'info' as const
    }
  })

  // Live simulation telemetry sensors from useVizagDataStore
  const simSensorMarkers: MapMarker[] = [
    {
      id: 'sim-sensor-beach',
      position: [17.7210, 83.3180] as [number, number],
      title: `🌊 [REAL_IOT] ${vizagSensors['beach-node-1'].name}`,
      description: `Level: ${vizagSensors['beach-node-1'].levelCm}cm (Threshold: ${vizagSensors['beach-node-1'].thresholdCm}cm) • Drain: ${vizagSensors['beach-node-1'].drainLevelPct}% • Flow: ${vizagSensors['beach-node-1'].flowRateLps} L/s • Status: ${vizagSensors['beach-node-1'].status}`,
      category: vizagSensors['beach-node-1'].status === 'CRITICAL' ? 'critical' as const : vizagSensors['beach-node-1'].status === 'WARNING' ? 'high' as const : 'info' as const
    },
    {
      id: 'sim-sensor-mvp',
      position: [17.7340, 83.3320] as [number, number],
      title: `🌊 [REAL_IOT] ${vizagSensors['mvp-node-2'].name}`,
      description: `Level: ${vizagSensors['mvp-node-2'].levelCm}cm • Drain: ${vizagSensors['mvp-node-2'].drainLevelPct}% • Flow: ${vizagSensors['mvp-node-2'].flowRateLps} L/s • Status: ${vizagSensors['mvp-node-2'].status}`,
      category: vizagSensors['mvp-node-2'].status === 'CRITICAL' ? 'critical' as const : vizagSensors['mvp-node-2'].status === 'WARNING' ? 'high' as const : 'info' as const
    },
    {
      id: 'sim-sensor-mudasarlova',
      position: [17.7550, 83.2950] as [number, number],
      title: `🌊 [VERIFIED] ${vizagSensors['mudasarlova-4'].name}`,
      description: `Level: ${vizagSensors['mudasarlova-4'].levelCm}cm • Drain: ${vizagSensors['mudasarlova-4'].drainLevelPct}% • Flow: ${vizagSensors['mudasarlova-4'].flowRateLps} L/s • Status: ${vizagSensors['mudasarlova-4'].status}`,
      category: vizagSensors['mudasarlova-4'].status === 'CRITICAL' ? 'critical' as const : 'info' as const
    }
  ]

  const allMarkers = [
    ...simulationIncidentMarker,
    ...dynamicSimVehicleMarkers,
    ...simSensorMarkers,
    ...incidentMarkers,
    ...facilityMarkers,
    ...dbResourceMarkers,
    ...dbNodeMarkers
  ].filter(marker => marker.position[0] !== undefined && marker.position[1] !== undefined && !isNaN(marker.position[0]) && !isNaN(marker.position[1]))

  // Load polygons & heatmaps via managers
  const polygons = GeoJsonManager.getVisakhapatnamWardPolygons()
  const heatpoints = HeatmapManager.getVisakhapatnamFloodHeatmap()

  // Dynamic Beach Road flood zone polygon when water is rising
  if (incident.waterDepthCm > 25 && incident.status !== 'resolved') {
    polygons.push({
      id: 'flood-beach-zone',
      label: `Beach Road Inundation Zone (${incident.waterDepthCm}cm)`,
      positions: [
        [17.7180, 83.3140],
        [17.7240, 83.3150],
        [17.7250, 83.3220],
        [17.7190, 83.3210]
      ],
      color: incident.waterDepthCm >= 45 ? '#ef4444' : '#f97316',
      fillOpacity: incident.waterDepthCm >= 45 ? 0.45 : 0.25
    })
  }

  // Compute connection polylines + active dynamic emergency corridors
  const dynamicCorridors = [
    // Ram Nagar Green Wave Corridor for A-21 Ambulance
    {
      id: 'corridor-ram-nagar-green-wave',
      positions: [
        [17.7120, 83.3050],
        [17.7180, 83.3120],
        [17.7210, 83.3180]
      ] as [number, number][],
      color: trafficCorridors['ram-nagar']?.status === 'EMERGENCY_CORRIDOR' ? '#10b981' : '#38bdf8',
      weight: trafficCorridors['ram-nagar']?.status === 'EMERGENCY_CORRIDOR' ? 5 : 2,
      dashArray: trafficCorridors['ram-nagar']?.status === 'EMERGENCY_CORRIDOR' ? undefined : '4 4'
    },
    // NH16 Bypass Active Diversion Route
    {
      id: 'corridor-nh16-detour',
      positions: [
        [17.7050, 83.2850],
        [17.7250, 83.3000],
        [17.7400, 83.3250]
      ] as [number, number][],
      color: trafficCorridors['nh16-bypass']?.status === 'EMERGENCY_CORRIDOR' ? '#06b6d4' : '#64748b',
      weight: 3,
      dashArray: '5 5'
    }
  ]

  const mapPolylines = [
    ...dynamicCorridors,
    ...connections
      .map(conn => {
        const fromNode = nodes.find(n => n.id === conn.from_node_id)
        const toNode = nodes.find(n => n.id === conn.to_node_id)
        if (!fromNode || !toNode) return null

        let color = '#10b981'
        if (conn.status === 'warning') color = '#eab308'
        if (conn.status === 'offline') color = '#ef4444'

        return {
          id: conn.id,
          positions: [
            [fromNode.latitude, fromNode.longitude],
            [toNode.latitude, toNode.longitude]
          ] as [number, number][],
          color,
          weight: 2,
          dashArray: conn.status === 'offline' ? '5 5' : undefined
        }
      })
      .filter((l): l is NonNullable<typeof l> => l !== null)
  ]

  // Handle marker selection event
  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedAsset({
      id: String(marker.id),
      name: marker.title,
      category: marker.category || 'Asset',
      status: 'Active Monitoring',
      coordinates: marker.position,
      description: marker.description || 'Spatial asset registered in Visakhapatnam Digital Twin registry.',
      relatedIncidents: []
    })
  }

  return (
    <DashboardLayout userRole="officer">
      <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
        {/* Page Header with Live Simulation Sync Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <PageHeader
            title="Visakhapatnam Digital Twin Spatial Platform"
            description="Interactive 3D/2D GIS spatial map framework mapping live sensors, emergency assets, hazard overlays, and incident playback timeline."
            breadcrumbs={[{ label: 'Home' }, { label: 'Digital Twin' }]}
          />
          <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto bg-[#0B0F19] border border-sky-500/30 px-3 py-1.5 rounded-xl font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">SCENARIO CLOCK:</span>
            <span className="text-sky-400 font-bold">{simulationTime}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold">{demoStage}</span>
          </div>
        </div>

        {/* Global Map Filters Bar */}
        <div id="sensors" className="glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Filters:</span>
            
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#050816] border border-slate-800 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Accident">Accident</option>
              <option value="Medical">Medical</option>
              <option value="Water Leakage">Water Leakage</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#050816] border border-slate-800 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono-data text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Simulated Movement: <strong className="text-cyan-300">P-305, FT-12, A-21</strong></span>
            </div>
            <div>
              {loading ? (
                <span className="animate-pulse">Loading markers...</span>
              ) : (
                <>Visible Pins: <span className="text-blue-400 font-bold">{allMarkers.length}</span></>
              )}
            </div>
          </div>
        </div>

        {/* Leaflet Dynamic Spatial Map Canvas Workspace */}
        <div id="risk" className="flex-1 min-h-0 relative">
          <MapContainer
            center={[17.7210, 83.3180]}
            zoom={13}
            markers={allMarkers}
            polygons={polygons}
            heatpoints={heatpoints}
            polylines={mapPolylines}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Timeline Playback Slider Bar */}
        <div className="shrink-0">
          <TimelinePlaybackWidget
            currentHour={currentHour}
            onHourChange={(h) => setCurrentHour(h)}
          />
        </div>

        {/* Asset Details Drawer */}
        <AssetDetailsDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      </div>
    </DashboardLayout>
  )
}
