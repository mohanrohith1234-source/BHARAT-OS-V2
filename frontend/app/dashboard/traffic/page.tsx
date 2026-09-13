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
  ArrowRight
} from 'lucide-react'

export default function TrafficOperationsPage() {
  const { trafficCorridors, resources, incident, updateCorridorStatus } = useVizagDataStore()
  const [selectedCorridorId, setSelectedCorridorId] = useState('beach-road')
  const [currentTime, setCurrentTime] = useState('')
  const [signalOverrideActive, setSignalOverrideActive] = useState(false)

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
      title: 'Beach Road Inundation Barrier',
      description: 'Sector 4 Sump flooded. Traffic diversion in effect.',
      category: 'critical'
    },
    {
      id: 'nh16-node',
      position: [17.7400, 83.3100],
      title: 'NH16 Detour Entry Junction',
      description: 'Signage illuminated. Evacuation & detour open.',
      category: 'low'
    },
    {
      id: 'siripuram-junction',
      position: [17.7202, 83.3156],
      title: 'Siripuram Circle',
      description: 'Transit bottleneck. Signal override ready.',
      category: 'high'
    },
    {
      id: 'ambulance-a21',
      position: [17.7180, 83.3120],
      title: 'Ambulance A-21 (Green Corridor Active)',
      description: 'Transit to Beach Road. Speed: 42 km/h',
      category: 'high'
    }
  ]

  const corridorsList = Object.values(trafficCorridors)
  const selectedCorridor = trafficCorridors[selectedCorridorId] || corridorsList[0]

  const toggleCorridor = (id: string) => {
    const current = trafficCorridors[id]?.status
    if (current === 'CLOSED_FLOOD') {
      updateCorridorStatus(id, 'OPEN')
    } else {
      updateCorridorStatus(id, 'CLOSED_FLOOD')
    }
  }

  return (
    <DashboardLayout userRole="officer">
      <div className="space-y-6">
        <PageHeader
          title="Visakhapatnam Traffic Intelligence & Emergency Corridors"
          description="Integrated traffic management, dynamic flood bypass routing, signal overrides, and multi-agency green light corridors."
          breadcrumbs={[
            { label: 'Home', path: '/dashboard/city' },
            { label: 'Operations', path: '/dashboard/city' },
            { label: 'Traffic & Corridors' }
          ]}
        />

        {/* Real-time Status KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/80 p-4 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">NETWORK STATUS</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900/40 text-emerald-400">
                LIVE TELEMETRY
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">4 Corridors Monitored</div>
            <p className="text-xs text-slate-400 mt-1">Beach Road, NH16, VIP Rd, Ram Nagar</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/80 p-4 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">FLOOD CLOSURES</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950/60 border border-red-900/40 text-red-400">
                VERIFIED
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-red-400">
              {corridorsList.filter(c => c.status === 'CLOSED_FLOOD').length} Active Blockage
            </div>
            <p className="text-xs text-slate-400 mt-1">Beach Road Sector 4 bypass detour</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/80 p-4 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">EMERGENCY CORRIDOR</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950/60 border border-sky-900/40 text-sky-400">
                ACTIVE
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-sky-400">Green Wave Priority</div>
            <p className="text-xs text-slate-400 mt-1">Clear path for A-21 & FT-12</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/80 p-4 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">AVG EVAC SPEED</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-900/40 text-purple-400">
                ANALYTICS
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">38 km/h</div>
            <p className="text-xs text-slate-400 mt-1">Detour flowing at 86% normal speed</p>
          </div>
        </div>

        {/* Main Traffic Dashboard: Corridors List + Live Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Corridor Selection & Override Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-sky-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Monitored Corridors
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{currentTime} IST</span>
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
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{c.provenance}</span>
                      </div>

                      {/* Manual Toggle Switch */}
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

            {/* Smart Green Wave Signal Override */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Smart Green Wave Signal Override
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300 font-mono">
                  AI RECOMMENDATION
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically synchronize traffic signals along Ram Nagar and NH16 corridor to give priority green passage to incoming emergency response units.
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-300 font-mono">Status: <strong className={signalOverrideActive ? "text-emerald-400" : "text-slate-400"}>{signalOverrideActive ? "ENGAGED (GREEN WAVE)" : "STANDBY (CYCLE AUTO)"}</strong></span>
                <button
                  onClick={() => setSignalOverrideActive(!signalOverrideActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
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

          {/* Traffic Interactive Map & Detour Route */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-4 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Corridor Geometry & Live Unit Transits
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded">
                  GPS TRACKING ACTIVE
                </span>
              </div>

              <div className="h-[460px] rounded-xl overflow-hidden border border-slate-800 relative">
                <MapContainer
                  center={[17.7250, 83.3150]}
                  zoom={13}
                  markers={mapMarkers}
                />
              </div>

              {/* Rerouting Detour Banner */}
              <div className="p-3 rounded-xl border border-sky-900/50 bg-sky-950/20 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-sky-900/40 border border-sky-800">
                    <ArrowRight className="w-4 h-4 text-sky-300" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Active Detour Advisory: Beach Road Bypass</span>
                    <span className="text-[11px] text-slate-400">All westbound civilian traffic redirected through NH16 north connector.</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded border border-sky-800">
                  ETA 14 mins
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
