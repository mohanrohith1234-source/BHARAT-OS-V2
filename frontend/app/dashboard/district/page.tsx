'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import IncidentCommandPanel from '../../../components/widgets/IncidentCommandPanel'
import { IoTSimulatorConsole } from '../../../components/widgets/IoTSimulatorConsole'
import { useVizagDataStore } from '../../../store/useVizagDataStore'
import { 
  CloudRain, 
  Waves, 
  Activity, 
  Shield, 
  MapPin, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Navigation, 
  Car, 
  Truck, 
  Check, 
  X, 
  Bot, 
  PhoneCall, 
  Camera, 
  Mic, 
  ShieldAlert, 
  Layers, 
  Cpu, 
  TrendingUp, 
  ExternalLink 
} from 'lucide-react'

export default function DistrictDashboardPage() {
  const { 
    nowcast, 
    earlyWarnings, 
    preparednessActions, 
    citizenReports, 
    incident, 
    resources, 
    trafficCorridors, 
    sensors, 
    demoStage, 
    simulationTime, 
    approveIncidentAction, 
    approvePreparednessAction, 
    approveCitizenReport 
  } = useVizagDataStore()

  const [selectedHorizon, setSelectedHorizon] = useState<'NOW' | '+15 MIN' | '+30 MIN' | '+60 MIN'>('NOW')
  const [activeLayer, setActiveLayer] = useState<'current' | 'predicted' | 'corridors'>('current')
  const [showIoTSimulator, setShowIoTSimulator] = useState<boolean>(true)

  // Map markers generated dynamically from shared store
  const mapMarkers: MapMarker[] = [
    // Hero Sensor Sump Marker (Real IoT)
    {
      id: 'sensor-sump-1',
      position: [17.7210, 83.3180],
      title: `🌊 Beach Road Outfall Sump #1 (${sensors['beach-node-1']?.levelCm}cm)`,
      description: `Sensor Level: ${sensors['beach-node-1']?.levelCm}cm (Threshold: ${sensors['beach-node-1']?.thresholdCm}cm) • Status: ${sensors['beach-node-1']?.status} • Source: PROTOTYPE_SIMULATION`,
      category: sensors['beach-node-1']?.levelCm >= 35 ? 'critical' : sensors['beach-node-1']?.levelCm >= 25 ? 'high' : 'low'
    },
    // MVP Canal Sump
    {
      id: 'sensor-sump-2',
      position: [17.7280, 83.3240],
      title: `💧 MVP Double Road Canal (${sensors['mvp-node-2']?.levelCm}cm)`,
      description: `Inflow rate: ${sensors['mvp-node-2']?.flowRateLps} L/s • Status: ${sensors['mvp-node-2']?.status} • Source: PROTOTYPE_SIMULATION`,
      category: sensors['mvp-node-2']?.status === 'WARNING' ? 'high' : 'low'
    },
    // Inundation impact barrier on Beach Road
    ...(incident.status !== 'resolved' ? [{
      id: 'incident-culvert',
      position: [17.7230, 83.3195] as [number, number],
      title: `🚨 Beach Road Inundation Zone (Sector 4)`,
      description: `Predicted waterlogging depth: ${incident.waterDepthCm}cm. Road barrier active. Citizens at risk: ~${incident.peopleAtRisk}.`,
      category: 'critical' as const
    }] : []),
    // Detour point on NH16
    {
      id: 'detour-nh16',
      position: [17.7400, 83.3100],
      title: `🔄 NH16 Detour Entry Point`,
      description: `Recommended Bypass route. Status: ${trafficCorridors['nh16-bypass']?.status} • Speed: ${trafficCorridors['nh16-bypass']?.speedKmH} km/h`,
      category: 'low'
    },
    // Dynamic Units (Police P-305, FT-12, Ambulance A-21, Dewatering Pump DP-04)
    {
      id: 'unit-p305',
      position: resources['P-305']?.coords || [17.7050, 83.2850],
      title: `🚓 Police Patrol P-305 (${resources['P-305']?.status.toUpperCase()})`,
      description: `Speed: ${resources['P-305']?.speed} • ETA: ${resources['P-305']?.eta} • Assignment: ${resources['P-305']?.currentAssignment}`,
      category: resources['P-305']?.status === 'on_scene' ? 'critical' : 'high'
    },
    {
      id: 'unit-ft12',
      position: resources['FT-12']?.coords || [17.6850, 83.2200],
      title: `🚒 Water Rescue Tender FT-12 (${resources['FT-12']?.status.toUpperCase()})`,
      description: `Speed: ${resources['FT-12']?.speed} • ETA: ${resources['FT-12']?.eta} • Staging Pump DP-04`,
      category: resources['FT-12']?.status === 'on_scene' ? 'critical' : 'high'
    },
    {
      id: 'unit-a21',
      position: resources['A-21']?.coords || [17.7120, 83.3050],
      title: `🚑 ALS Ambulance A-21 (${resources['A-21']?.status.toUpperCase()})`,
      description: `Transit via Ram Nagar Medical Corridor • ETA: ${resources['A-21']?.eta}`,
      category: resources['A-21']?.status === 'on_scene' ? 'critical' : 'high'
    },
    {
      id: 'unit-dp04',
      position: resources['DP-04']?.coords || [17.7210, 83.3180],
      title: `💧 Dewatering Pump DP-04 (${resources['DP-04']?.status.toUpperCase()})`,
      description: `High-volume municipal pump deployed at Beach Road culvert outfall`,
      category: resources['DP-04']?.status === 'operating' ? 'critical' : 'low'
    }
  ]

  const activeHorizonStep = nowcast.steps.find(s => s.offset === selectedHorizon) || nowcast.steps[0]

  return (
    <DashboardLayout userRole="officer">
      <div className="space-y-6 font-sans">
        
        {/* 1. HERO PAGE HEADER & BHARATOS NOWCAST BADGE */}
        <PageHeader
          title="BHARATOS — Severe Weather Nowcasting & District Command"
          description="AI-Driven Hyper-Local Nowcasting & Early Warning Platform — Predict locally. Warn early. Prepare intelligently. Respond effectively."
          breadcrumbs={[
            { label: 'Home', path: '/dashboard/city' },
            { label: 'State (Andhra Pradesh)', path: '/dashboard/state' },
            { label: 'Visakhapatnam District Command' }
          ]}
          actions={
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-sky-950/80 border border-sky-700/60 text-sky-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>NOWCAST ENGINE ACTIVE</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300">
                SCENARIO: {simulationTime}
              </span>
            </div>
          }
        />

        {/* 2. TOP WEATHER & SENSOR TELEMETRY METRIC STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Metric 1: Precipitation Rate */}
          <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>RADAR RAINFALL</span>
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-black font-mono text-white">{nowcast.rainfallMmHr} mm/h</div>
            <div className="text-[9.5px] font-mono text-sky-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Trend: {nowcast.rainfallTrend}</span>
            </div>
          </div>

          {/* Metric 2: Culvert Sump Level */}
          <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>CULVERT SUMP #1</span>
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black font-mono text-white">{incident.waterDepthCm} cm</div>
            <div className="text-[9.5px] font-mono text-amber-400 font-bold">
              Threshold: 35 cm ({sensors['beach-node-1']?.status})
            </div>
          </div>

          {/* Metric 3: Ward 12 Risk Level */}
          <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>WARD 12 RISK</span>
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className={`text-xl font-black font-mono uppercase ${
              nowcast.currentRisk === 'CRITICAL' || nowcast.currentRisk === 'VERY HIGH' 
                ? 'text-red-400' 
                : nowcast.currentRisk === 'HIGH' 
                ? 'text-amber-400' 
                : 'text-emerald-400'
            }`}>
              {nowcast.currentRisk}
            </div>
            <div className="text-[9.5px] font-mono text-slate-400">
              Risk Score: <strong className="text-white">{nowcast.riskScore}/100</strong>
            </div>
          </div>

          {/* Metric 4: Nowcast Time Horizon */}
          <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>NOWCAST HORIZON</span>
              <Clock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-black font-mono text-purple-300">0 → 60 MIN</div>
            <div className="text-[9.5px] font-mono text-slate-400">4-Interval Projection</div>
          </div>

          {/* Metric 5: Beach Road Corridor */}
          <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>BEACH ROAD STATUS</span>
              <Car className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-sm font-black font-mono truncate text-amber-300 pt-1">
              {trafficCorridors['beach-road']?.status === 'CLOSED_FLOOD' ? 'CLOSED (FLOOD)' : trafficCorridors['beach-road']?.status}
            </div>
            <div className="text-[9.5px] font-mono text-slate-400">
              Detour: <strong className="text-sky-300">NH16 North Bypass</strong>
            </div>
          </div>

          {/* Metric 6: Data Provenance */}
          <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>SYSTEM PROVENANCE</span>
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xs font-bold font-mono text-emerald-400 pt-1 truncate">
              PROTOTYPE_SIMULATION
            </div>
            <div className="text-[9px] font-mono text-slate-500">GVMC Sensor + IMD Radar</div>
          </div>
        </div>

        {/* 2.4 REAL-TIME IOT & MULTI-HAZARD SIMULATION CONSOLE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                IoT Edge Ingestion Gateway & Multi-Hazard Simulator
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowIoTSimulator(!showIoTSimulator)}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold transition-all"
            >
              {showIoTSimulator ? 'COLLAPSE SENSOR CONSOLE ▲' : 'EXPAND IOT CONSOLE ▼'}
            </button>
          </div>

          {showIoTSimulator && <IoTSimulatorConsole />}
        </div>

        {/* 2.5 CENTRAL AI INCIDENT COMMAND & RESOURCE MATCHING PANEL */}
        <IncidentCommandPanel />

        {/* 3. CENTER MAP & RIGHT EARLY WARNINGS DECK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLS: HYPER-LOCAL NOWCAST & INUNDATION MAP */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#070B14] p-5 space-y-4 shadow-2xl backdrop-blur-md flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-black font-mono uppercase tracking-wider text-white">
                    HYPER-LOCAL NOWCAST & INUNDATION MAP — WARD 12
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  RK Beach Catchment • Sector 4 Culvert Outfall • MVP Colony Inflow Canal
                </p>
              </div>

              {/* Map Layer Selector */}
              <div className="flex items-center space-x-1 p-1 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[10px]">
                <button
                  onClick={() => setActiveLayer('current')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeLayer === 'current' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Current Telemetry
                </button>
                <button
                  onClick={() => setActiveLayer('predicted')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeLayer === 'predicted' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Predicted Inundation (+30m)
                </button>
                <button
                  onClick={() => setActiveLayer('corridors')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeLayer === 'corridors' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Emergency Routes
                </button>
              </div>
            </div>

            {/* Live Leaflet Map Container */}
            <div className="h-[380px] w-full rounded-xl overflow-hidden border border-slate-850 relative">
              <MapContainer
                markers={mapMarkers}
                center={[17.7210, 83.3180]}
                zoom={14}
              />

              {/* In-Map Telemetry HUD Overlay */}
              <div className="absolute top-3 right-3 z-[400] bg-slate-950/90 border border-slate-800 p-3 rounded-xl font-mono text-[10px] space-y-1 shadow-xl backdrop-blur-md pointer-events-none">
                <div className="flex items-center justify-between gap-3 text-slate-400">
                  <span>OUTFLOW CULVERT #1:</span>
                  <span className="text-white font-bold">{sensors['beach-node-1']?.levelCm} cm</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-400">
                  <span>CANAL DISCHARGE:</span>
                  <span className="text-sky-400 font-bold">{sensors['beach-node-1']?.flowRateLps} L/s</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-400">
                  <span>STORM DRAIN CAPACITY:</span>
                  <span className="text-amber-400 font-bold">{sensors['beach-node-1']?.drainLevelPct}%</span>
                </div>
                <div className="pt-1 border-t border-slate-850 text-[9px] text-emerald-400">
                  ● SENSOR TELEMETRY: PROTOTYPE_SIMULATION
                </div>
              </div>
            </div>

            {/* Map Legend & Action Links */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] font-mono text-slate-400">
              <div className="flex items-center space-x-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical Inundation
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Sump Telemetry Node
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Fleet Units En Route
                </span>
              </div>

              <Link
                href="/dashboard/digital-twin"
                className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
              >
                <span>Open Full Weather Digital Twin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT COL: SEVERE WEATHER EARLY WARNINGS */}
          <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-5 space-y-4 shadow-2xl backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-black font-mono uppercase tracking-wider text-white">
                  SEVERE WEATHER EARLY WARNINGS
                </h3>
              </div>
              <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded bg-orange-950/80 border border-orange-700/60 text-orange-300">
                AI_DERIVED
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
              {earlyWarnings.map((warn) => (
                <div key={warn.id} className="p-3.5 rounded-xl border border-orange-900/40 bg-orange-950/15 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-orange-400 uppercase">{warn.wardName}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 uppercase">
                      {warn.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">{warn.title}</h4>
                  
                  <div className="text-[10.5px] text-slate-300 leading-relaxed">
                    <span className="text-slate-400">Time Horizon:</span> <strong className="text-white">{warn.timeHorizon}</strong>
                  </div>

                  <p className="text-[10.5px] text-slate-300 leading-relaxed">
                    {warn.expectedImpact}
                  </p>

                  <div className="space-y-1 pt-1 border-t border-orange-950/80">
                    <span className="text-[9.5px] text-slate-400 uppercase font-bold block">Target Audiences:</span>
                    <div className="flex flex-wrap gap-1">
                      {warn.targetAudiences.map((aud, i) => (
                        <span key={i} className="text-[8.5px] px-1.5 py-0.5 rounded bg-black/60 border border-slate-800 text-slate-300">
                          {aud}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[9.5px] text-amber-300 uppercase font-bold block">Actionable Preparedness:</span>
                    <ul className="text-[10px] text-slate-200 space-y-0.5 list-disc list-inside">
                      {warn.recommendedPreparedness.slice(0, 2).map((p, i) => (
                        <li key={i} className="truncate">{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Source: <strong className="text-white">IMD Doppler + Sump Telemetry</strong></span>
              <span className="text-emerald-400 font-bold">ALL CHANNELS SYNCHRONIZED</span>
            </div>
          </div>

        </div>

        {/* 4. NOWCAST TIME HORIZON TIMELINE (+00, +15, +30, +60 MIN) */}
        <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-5 space-y-3.5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
            <div className="flex items-center space-x-2 font-mono">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                HYPER-LOCAL NOWCAST TIMELINE — WARD 12 INUNDATION FORECAST
              </h3>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2.5 py-0.5 rounded">
              DETERMINISTIC PHYSICS & TELEMETRY MODEL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            {nowcast.steps.map((step) => {
              const isSelected = selectedHorizon === step.offset
              return (
                <div
                  key={step.offset}
                  onClick={() => setSelectedHorizon(step.offset)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-950/50' 
                      : 'border-slate-850 bg-slate-950/60 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{step.offset}</span>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase ${
                      step.riskLevel === 'CRITICAL' || step.riskLevel === 'VERY HIGH'
                        ? 'bg-red-950 border border-red-800 text-red-300'
                        : step.riskLevel === 'HIGH'
                        ? 'bg-amber-950 border border-amber-800 text-amber-300'
                        : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                    }`}>
                      {step.riskLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded bg-black/40 border border-slate-900">
                      <span className="text-[9px] text-slate-400 block uppercase">Rainfall</span>
                      <span className="font-bold text-sky-400">{step.rainfallRateMmHr} mm/h</span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-slate-900">
                      <span className="text-[9px] text-slate-400 block uppercase">Water Depth</span>
                      <span className="font-bold text-white">{step.waterLevelCm} cm</span>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-slate-300 leading-snug">
                    {step.predictedImpact}
                  </p>

                  <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between text-[9.5px] text-slate-400">
                    <span>Drain Load: <strong className="text-slate-200">{step.drainageCapacityPct}%</strong></span>
                    <span className="text-purple-300">Score: {step.riskScore}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 5. EXPLAINABLE AI ("WHY RISK IS INCREASING?") & PREPAREDNESS GATING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: EXPLAINABLE AI PANEL */}
          <div className="rounded-2xl border border-indigo-900/50 bg-indigo-950/15 p-5 space-y-3.5 shadow-xl font-mono">
            <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2.5">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  EXPLAINABLE AI — WHY IS THE RISK INCREASING?
                </h3>
              </div>
              <span className="text-[9px] text-indigo-300 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800/60 font-bold">
                MEASURABLE FACTORS
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {nowcast.whyRiskIncreasing.map((reason, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-black/50 border border-indigo-950/80 flex items-start space-x-2.5 text-slate-200">
                  <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                  <p className="text-[11px] leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-900/50 space-y-1">
              <span className="text-[9.5px] text-indigo-400 font-bold uppercase tracking-wider block">
                AI NOWCAST SYNTHESIS:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Severe convective cloud cell is producing concentrated stormwater inflow over Ward 12 outfall. Culvert capacity threshold has been breached. Immediate pre-positioning of dewatering assets and traffic bypass recommended prior to peak inundation.
              </p>
            </div>
          </div>

          {/* RIGHT: PREPAREDNESS BEFORE RESPONSE & HUMAN APPROVAL */}
          <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-5 space-y-3.5 shadow-xl font-mono flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  PREPAREDNESS BEFORE RESPONSE — ACTIONS QUEUE
                </h3>
              </div>
              <span className="text-[9px] text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded font-bold">
                HUMAN APPROVAL REQUIRED
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {preparednessActions.map((act) => (
                <div key={act.id} className="p-3 rounded-xl border border-slate-850 bg-slate-950/60 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white truncate">{act.title}</span>
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        act.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {act.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{act.description}</p>
                  </div>

                  {act.status !== 'APPROVED' ? (
                    <button
                      onClick={() => approvePreparednessAction(act.id, 'Duty Commander K. Sharma')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase shrink-0 transition-all cursor-pointer shadow-md"
                    >
                      Authorize
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                      <Check className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Global Master Authorization Banner */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase block">
                  {incident.humanSignOff ? '✅ ALL PREPAREDNESS ACTIONS AUTHORIZED' : '⚠️ HIGH-IMPACT DISPATCH REQUIRES SIGN-OFF'}
                </span>
                <p className="text-[9.5px] text-slate-400">
                  {incident.humanSignOff 
                    ? `Signed by: ${incident.signedBy}`
                    : 'Municipal protocol mandates human commander review prior to vehicle mobilization.'}
                </p>
              </div>

              {!incident.humanSignOff && (
                <button
                  onClick={() => approveIncidentAction('Duty Commander (Badge #104)')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition-all shadow-lg cursor-pointer active:scale-95 animate-pulse shrink-0"
                >
                  AUTHORIZE ALL
                </button>
              )}
            </div>
          </div>

        </div>

        {/* 6. INCOMING CITIZEN REPORTS QUEUE (SOS, PHOTO, VOICE, TEXT) */}
        <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-5 space-y-3.5 shadow-xl font-mono">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                INCOMING CITIZEN EMERGENCY REPORTS QUEUE
              </h3>
            </div>
            <span className="text-[10px] text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2.5 py-0.5 rounded font-bold">
              CITIZEN OS LIVE FEED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {citizenReports.map((rpt) => {
              let Icon = PhoneCall
              if (rpt.source === 'CITIZEN_PHOTO') Icon = Camera
              if (rpt.source === 'CITIZEN_VOICE') Icon = Mic
              if (rpt.source === 'CITIZEN_SOS') Icon = ShieldAlert

              return (
                <div key={rpt.id} className="p-4 rounded-xl border border-slate-850 bg-slate-950/60 space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Icon className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-xs font-bold text-white">{rpt.id}</span>
                      </div>
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        rpt.severity === 'critical' ? 'bg-red-950 border border-red-800 text-red-300' : 'bg-amber-950 border border-amber-800 text-amber-300'
                      }`}>
                        {rpt.severity}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-sky-300 truncate">{rpt.category}</p>
                    <p className="text-[10px] text-slate-400 truncate">📍 {rpt.location}</p>
                    <p className="text-[10.5px] text-slate-300 leading-snug">{rpt.evidenceSummary}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <div className="flex items-center justify-between text-[9.5px]">
                      <span className="text-slate-500">AI Status:</span>
                      <span className="text-purple-300 font-bold uppercase">{rpt.aiTriageStatus}</span>
                    </div>

                    {rpt.aiTriageStatus !== 'OFFICER_VERIFIED' && rpt.aiTriageStatus !== 'DISPATCHED' && rpt.aiTriageStatus !== 'RESOLVED' ? (
                      <button
                        onClick={() => approveCitizenReport(rpt.id, 'Duty Commander K. Sharma')}
                        className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase transition-all shadow cursor-pointer"
                      >
                        Verify & Assign Unit
                      </button>
                    ) : (
                      <div className="text-center py-1 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[9.5px] font-bold">
                        VERIFIED BY COMMANDER
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 7. RESPONSE FLEET TELEMETRY STRIP */}
        <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                DEPLOYED RESPONSE FLEET TELEMETRY
              </h3>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              GPS SOURCE: SIMULATION
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {Object.values(resources).slice(0, 4).map((res) => (
              <div key={res.id} className="p-3 rounded-xl border border-slate-850 bg-slate-950 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">{res.id} — {res.callSign}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    res.status === 'en_route' || res.status === 'on_scene' || res.status === 'operating'
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                      : 'bg-slate-900 text-slate-400'
                  }`}>
                    {res.status}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Speed: <strong className="text-slate-200">{res.speed}</strong></span>
                  <span>ETA: <strong className="text-slate-200">{res.eta}</strong></span>
                </div>
                <p className="text-[9.5px] text-slate-500 truncate">{res.currentAssignment || 'Patrol'}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
