'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import { useVizagDataStore } from '../../../store/useVizagDataStore'
import { 
  Car, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Activity, 
  Shield, 
  Radio, 
  Navigation, 
  CheckCircle2, 
  Zap, 
  Waves,
  ArrowRight,
  Eye,
  Camera,
  Layers,
  FileSearch,
  Check
} from 'lucide-react'

export default function TrafficOperationsPage() {
  const { trafficCorridors, resources, incident, demoStage, simulationTime, updateCorridorStatus } = useVizagDataStore()
  const [selectedCorridorId, setSelectedCorridorId] = useState('beach-road')
  const [currentTime, setCurrentTime] = useState('')
  const [signalOverrideActive, setSignalOverrideActive] = useState(false)
  const [activeCameraId, setActiveCameraId] = useState('CAM-VIZAG-01')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false }))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const mapMarkers: MapMarker[] = [
    {
      id: 'beach-block',
      position: [17.7210, 83.3180],
      title: '🚨 Beach Road Inundation Barrier (Sector 4)',
      description: `Sector 4 Sump flooded (${incident.waterDepthCm}cm). Traffic diversion in effect. Status: ${incident.status}`,
      category: 'critical'
    },
    {
      id: 'nh16-node',
      position: [17.7400, 83.3100],
      title: '🔄 NH16 Detour Entry Junction',
      description: 'Signage illuminated. Evacuation & detour route open.',
      category: 'low'
    },
    {
      id: 'siripuram-junction',
      position: [17.7202, 83.3156],
      title: '🚦 Siripuram Circle Signal Node',
      description: `Transit bottleneck. Signal Override: ${signalOverrideActive ? 'GREEN WAVE ENGAGED' : 'NORMAL CYCLE'}`,
      category: 'high'
    },
    {
      id: 'police-p305',
      position: resources['P-305']?.coords || [17.7050, 83.2850],
      title: `🚓 Police Patrol P-305 (${resources['P-305']?.callSign})`,
      description: `Status: ${resources['P-305']?.status.toUpperCase()} • Location: ${resources['P-305']?.location} • Speed: ${resources['P-305']?.speed}`,
      category: 'high'
    },
    {
      id: 'ambulance-a21',
      position: resources['A-21']?.coords || [17.7120, 83.3050],
      title: `🚑 Ambulance A-21 (${resources['A-21']?.callSign})`,
      description: `Transit to Beach Road via Ram Nagar. Speed: ${resources['A-21']?.speed} • Status: ${resources['A-21']?.status.toUpperCase()}`,
      category: 'high'
    }
  ]

  const corridorsList = Object.values(trafficCorridors)

  const toggleCorridor = (id: string) => {
    const current = trafficCorridors[id]?.status
    if (current === 'CLOSED_FLOOD') {
      updateCorridorStatus(id, 'OPEN')
    } else {
      updateCorridorStatus(id, 'CLOSED_FLOOD')
    }
  }

  // YOLO Detections metadata (bound to live incident evidence if ingested)
  const backendDetections = incident.evidence?.detections
  const yoloDetections = Array.isArray(backendDetections) && backendDetections.length > 0
    ? backendDetections.map((d: any, idx: number) => ({
        id: idx + 1,
        class_name: d.class_name || d.class || 'vehicle',
        confidence: typeof d.confidence === 'number' ? d.confidence : 0.88,
        bbox: Array.isArray(d.bbox) ? d.bbox : [120, 80, 240, 190],
        status: (d.class_name?.includes('collision') || d.class_name?.includes('emergency') || d.class_name === 'ambulance') ? 'emergency' : 'normal'
      }))
    : [
        { id: 1, class_name: 'car', confidence: 0.94, bbox: [120, 80, 240, 190], status: 'normal' },
        { id: 2, class_name: 'car', confidence: 0.91, bbox: [260, 100, 380, 210], status: 'normal' },
        { id: 3, class_name: 'accident_collision', confidence: 0.89, bbox: [130, 85, 235, 185], status: 'emergency' },
        { id: 4, class_name: 'ambulance', confidence: 0.96, bbox: [410, 110, 520, 230], status: 'emergency' }
      ]

  return (
    <DashboardLayout userRole="officer">
      <div className="space-y-6">
        <PageHeader
          title="Visakhapatnam Traffic Intelligence & YOLO Vision Perception"
          description="Optical YOLO object detection, multi-vehicle tracking, PCU density analysis, emergency green corridors, and evidence-backed incident triage."
          breadcrumbs={[
            { label: 'Home', path: '/dashboard/city' },
            { label: 'Operations', path: '/dashboard/city' },
            { label: 'Traffic & Perception' }
          ]}
          actions={
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-mono tracking-wider animate-pulse">
                YOLO v8 VISION PERCEPTION
              </span>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono tracking-wider">
                CLOCK: {simulationTime}
              </span>
            </div>
          }
        />

        {/* Real-time Status KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/80 p-4 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">NETWORK STATUS</span>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-300 font-mono">
                PROTOTYPE_SIMULATION
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">4 Corridors Monitored</div>
            <p className="text-xs text-slate-400 mt-1">Beach Road, NH16, VIP Rd, Ram Nagar</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/80 p-4 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">FLOOD CLOSURES</span>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-red-950/60 border border-red-900/40 text-red-400 font-mono">
                {incident.status !== 'resolved' ? 'ACTIVE BLOCK' : 'REOPENED'}
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-red-400">
              {corridorsList.filter(c => c.status === 'CLOSED_FLOOD').length} Active Blockage
            </div>
            <p className="text-xs text-slate-400 mt-1">Beach Road Sector 4 bypass detour</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/80 p-4 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">GREEN CORRIDOR PRIORITY</span>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-sky-950/60 border border-sky-900/40 text-sky-400 font-mono">
                {signalOverrideActive ? 'ENGAGED' : 'STANDBY'}
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-sky-400">Green Wave Priority</div>
            <p className="text-xs text-slate-400 mt-1">AI Recommendation → HITL Approval</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/80 p-4 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">TRAFFIC DENSITY</span>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-900/40 text-purple-400 font-mono">
                YOLO PCU
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              16.8 PCU / Moderate
            </div>
            <p className="text-xs text-slate-400 mt-1">Siripuram Junction flow analysis</p>
          </div>
        </div>

        {/* Main Section: YOLO Perception Panel & Live Camera Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: YOLO Perception Feed & Bounding Box Details */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-5 backdrop-blur-md space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    YOLO Vision Stream & Detections
                  </h3>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                  CAMERA: {activeCameraId}
                </span>
              </div>

              {/* Perception Visual Container */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black h-[260px] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10 pointer-events-none" />
                
                {/* HUD Overlay Text */}
                <div className="absolute top-3 left-3 z-20 space-y-1 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-700 text-red-300 font-bold block w-fit animate-pulse">
                    REC • LIVE YOLOV8 PERCEPTION
                  </span>
                  <span className="text-slate-400 block font-mono">Junction: Siripuram Circle</span>
                </div>

                {/* Dynamic Bounding Box Representation */}
                <div className="relative w-full h-full border border-purple-900/40 rounded-lg bg-slate-950/60 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600 opacity-20">
                    <Eye className="w-24 h-24" />
                  </div>

                  {/* Sample Detected Box 1 */}
                  <div className="absolute top-12 left-16 border-2 border-emerald-500 bg-emerald-500/10 rounded px-1 py-0.5 text-[9px] font-bold text-emerald-300 z-20">
                    CAR 94%
                  </div>
                  
                  {/* Sample Emergency Collision Box */}
                  <div className="absolute bottom-12 right-20 border-2 border-red-500 bg-red-500/20 rounded px-1.5 py-1 text-[10px] font-bold text-red-300 z-20 animate-pulse">
                    🚨 ACCIDENT_COLLISION 89%
                  </div>

                  {/* Ambulance Box */}
                  <div className="absolute top-16 right-16 border-2 border-sky-500 bg-sky-500/20 rounded px-1.5 py-1 text-[10px] font-bold text-sky-300 z-20">
                    🚑 AMBULANCE 96%
                  </div>
                </div>
              </div>

              {/* Detections List Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  ACTIVE INFERENCE DETECTIONS
                </span>
                <div className="space-y-1.5">
                  {yoloDetections.map((d) => (
                    <div key={d.id} className="p-2.5 rounded-lg border border-slate-850 bg-slate-900/40 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full ${d.status === 'emergency' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                        <span className="font-bold text-white uppercase">{d.class_name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="text-slate-400">Confidence: <strong className="text-emerald-400">{Math.round(d.confidence * 100)}%</strong></span>
                        <span className="text-slate-500 font-mono">BBox: [{d.bbox.join(', ')}]</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Green Wave Signal Override Control */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-5 backdrop-blur-md space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Smart Green Wave Signal Override
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300">
                  AI RECOMMENDATION
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Synchronize traffic signals along Siripuram and Ram Nagar corridor to grant green wave priority passage to incoming emergency response units.
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-300">Status: <strong className={signalOverrideActive ? "text-emerald-400" : "text-slate-400"}>{signalOverrideActive ? "ENGAGED (GREEN WAVE)" : "STANDBY (CYCLE AUTO)"}</strong></span>
                <button
                  onClick={() => setSignalOverrideActive(!signalOverrideActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    signalOverrideActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  {signalOverrideActive ? 'DISENGAGE OVERRIDE' : 'ENGAGE GREEN WAVE'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Monitored Corridors & Interactive Map */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-5 backdrop-blur-md space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-sky-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Monitored Corridors
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">{currentTime} IST</span>
              </div>

              <div className="space-y-2.5">
                {corridorsList.map((c) => {
                  const isSelected = c.id === selectedCorridorId
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCorridorId(c.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500/50 bg-sky-950/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                          : 'border-slate-850 bg-slate-900/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{c.name}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider ${
                            c.status === 'CLOSED_FLOOD'
                              ? 'bg-red-950/60 border border-red-800 text-red-400 animate-pulse'
                              : c.status === 'EMERGENCY_CORRIDOR'
                              ? 'bg-sky-950/60 border border-sky-800 text-sky-400'
                              : c.status === 'CONGESTED'
                              ? 'bg-amber-950/60 border border-amber-800 text-amber-400'
                              : 'bg-emerald-950/60 border border-emerald-800 text-emerald-400'
                          }`}
                        >
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                        <span>Speed: <strong className="text-slate-200">{c.speedKmH} km/h</strong></span>
                        <span>Est. Transit: <strong className="text-slate-200">{c.travelTimeMins} mins</strong></span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-300 font-bold font-mono">
                          {c.provenance}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-850/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Emergency Barrier Control</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCorridor(c.id)
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                            c.status === 'CLOSED_FLOOD'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-red-600 hover:bg-red-500 text-white'
                          }`}
                        >
                          {c.status === 'CLOSED_FLOOD' ? 'REOPEN ROAD' : 'CLOSE FOR FLOOD'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Interactive Map */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-4 backdrop-blur-md space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Corridor Geometry & Live Unit Transits
                  </h3>
                </div>
              </div>

              <div className="h-[280px] rounded-xl overflow-hidden border border-slate-800 relative">
                <MapContainer
                  center={[17.7210, 83.3180]}
                  zoom={13}
                  markers={mapMarkers}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
