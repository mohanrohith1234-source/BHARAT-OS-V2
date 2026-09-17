'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import { useVizagDataStore } from '../../../store/useVizagDataStore'
import { 
  Bot, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  Waves, 
  Car, 
  Truck, 
  HeartPulse, 
  Compass, 
  ArrowRight,
  Terminal,
  Play,
  RotateCcw
} from 'lucide-react'

export type ScenarioChoice = 'flood' | 'cyclone' | 'fire' | 'accident'

export default function AIOperationsCenterPage() {
  const { demoStage, simulationTime, incident, stepForward, resetDemo } = useVizagDataStore()
  const [selectedScenario, setSelectedScenario] = useState<ScenarioChoice>('flood')
  const [selectedAgent, setSelectedAgent] = useState<string>('risk')

  // Derive agent states based on active demoStage
  const isPostApproval = demoStage === 'T30_OFFICER_APPROVAL' || demoStage === 'T35_WATER_RISING' || demoStage === 'T40_RESPONSE_DEPLOYED' || demoStage === 'T50_DIGITAL_TWIN' || demoStage === 'T60_WATER_FALLING' || demoStage === 'T70_RISK_NORMALIZED'
  const isNowcasting = demoStage === 'T10_AI_NOWCAST' || demoStage === 'T15_WARD_RISK' || demoStage === 'T20_EARLY_WARNING' || demoStage === 'T25_TRAFFIC_IMPACT'

  const agents = [
    {
      id: 'risk',
      name: 'Risk Assessment Agent',
      role: 'Hazard Physics & Triage Evaluation',
      icon: ShieldAlert,
      color: 'red',
      status: demoStage === 'T00_NORMAL' ? 'IDLE' : isNowcasting ? 'ACTIVE' : 'COMPLETE',
      confidence: '95.8%',
      summary: 'Aggregating radar precipitation (42mm/h) and culvert sensor data. Evaluated inundation probability at 88% for Ward 12 RK Beach sector.',
      inputs: ['IMD Doppler Radar DBZ', 'Sump Sensor #1 Level', 'Historical Catchment RAG'],
      outputs: ['Risk Score: 88/100', 'Threat Level: CRITICAL', 'Triage Vector: FLASH_FLOOD']
    },
    {
      id: 'flood',
      name: 'Hydro-Nowcasting Agent',
      role: 'Terrain Elevation & Sump Telemetry',
      icon: Waves,
      color: 'sky',
      status: demoStage === 'T00_NORMAL' ? 'IDLE' : isNowcasting ? 'ACTIVE' : 'COMPLETE',
      confidence: '93.2%',
      summary: 'Physics hydrodynamic model predicts 48cm standing water within 30 mins if dewatering pump is not staged at Sector 4 outfall.',
      inputs: ['Catchment Inflow Rate (180 L/s)', 'Culvert Cross-section 2.2m', 'Tidal Outfall Level 14cm'],
      outputs: ['Inundation Depth: 48cm', 'Culvert Margin: -13cm BREACHED', 'Time to Peak: 24 mins']
    },
    {
      id: 'traffic',
      name: 'Traffic Operations Agent',
      role: 'Arterial Congestion & Detour Routing',
      icon: Car,
      color: 'amber',
      status: demoStage === 'T00_NORMAL' ? 'IDLE' : demoStage === 'T05_WEATHER_SIGNAL' ? 'ANALYZING' : 'COMPLETE',
      confidence: '96.5%',
      summary: 'Beach Road closed to civilian transit. Rerouted 450 vehicles/hr onto NH16 North Bypass. Green Corridor staged on Ram Nagar Road.',
      inputs: ['City CCTV Feeds (Suryabagh/Beach)', 'Municipal Traffic Flow Data', 'Road Elevation Contours'],
      outputs: ['Beach Road: CLOSED_FLOOD', 'Detour: NH16 Bypass Active', 'Green Wave: Ram Nagar Clear']
    },
    {
      id: 'resource',
      name: 'Resource Matching Agent',
      role: 'Fleet Proximity & Asset Optimization',
      icon: Truck,
      color: 'emerald',
      status: isPostApproval ? 'COMPLETE' : isNowcasting ? 'PLANNING' : 'IDLE',
      confidence: '94.4%',
      summary: 'Nearest unit matching completed: Dewatering Pump DP-04 (On Scene), Tender FT-12 (2.4km, ETA 5m), Patrol P-305 (1.2km, ETA 2m).',
      inputs: ['Real-time Emergency GPS Pool', 'Unit Maintenance & Fuel Stats', 'Departmental Availability'],
      outputs: ['Matched Units: 4', 'ETA Delta: < 6 mins', 'Department Sync: GVMC + Police + Fire']
    },
    {
      id: 'medical',
      name: 'Medical Surge Agent',
      role: 'Hospital Bed Triage & EMS Routing',
      icon: HeartPulse,
      color: 'purple',
      status: isPostApproval ? 'COMPLETE' : isNowcasting ? 'ACTIVE' : 'IDLE',
      confidence: '97.1%',
      summary: 'King George Hospital alerted (18 ICU beds free). Paramedic Ambulance A-21 placed on priority green corridor transit.',
      inputs: ['Hospital Bed Availability Registry', 'Trauma Registry Capacity', 'Paramedic Unit Telemetry'],
      outputs: ['Hospital: KGH Ready', 'ICU Beds Reserved: 12', 'Ambulance Unit: A-21 Dispatched']
    },
    {
      id: 'coordination',
      name: 'Inter-Agency Coordination Agent',
      role: 'Master Multi-Department Plan Synthesis',
      icon: Compass,
      color: 'indigo',
      status: isPostApproval ? 'COMPLETE' : demoStage === 'T20_EARLY_WARNING' || demoStage === 'T25_TRAFFIC_IMPACT' ? 'PLANNING' : isNowcasting ? 'ANALYZING' : 'IDLE',
      confidence: '95.2%',
      summary: 'Synthesized 5-point cross-department response plan. Dispatched protocol packet awaiting Duty Commander affirmative sign-off.',
      inputs: ['All Sub-Agent Syntheses', 'State Disaster SOP Framework', 'Municipal Hierarchy Protocols'],
      outputs: ['Consolidated Plan: 5 Directives', 'Gating: OFFICER_APPROVAL_REQUIRED', 'Audit Signature: PENDING']
    }
  ]

  const activeAgent = agents.find(a => a.id === selectedAgent) || agents[0]

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        
        {/* PAGE HEADER */}
        <PageHeader
          title="Multi-Agent AI Operations & Coordination Engine"
          description="Autonomous specialized agent execution graph for hyper-local incident understanding, resource matching, and cross-department planning."
          breadcrumbs={[{ label: 'Home' }, { label: 'AI Operations' }]}
        />

        {/* TOP STATUS STRIP: SCENARIO SELECTOR + TIMELINE STAGE */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-[#070b16] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-400 uppercase">ACTIVE SCENARIO:</span>
            <div className="flex flex-wrap gap-1.5">
              {(['flood', 'cyclone', 'fire', 'accident'] as const).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedScenario(sc)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                    selectedScenario === sc
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sc === 'flood' ? '🌊 Urban Flood (SIH)' : sc === 'cyclone' ? '🌀 Cyclone' : sc === 'fire' ? '🔥 Hazmat Fire' : '🚗 Road Accident'}
                </button>
              ))}
            </div>
          </div>

          {/* SIMULATION TIMELINE CONTROLS */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Timeline:</span>
            <span className="px-2.5 py-1 rounded bg-purple-950 border border-purple-800 text-purple-300 text-xs font-bold">
              {simulationTime} ({demoStage})
            </span>
            <button
              onClick={stepForward}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow"
            >
              <Play className="w-3 h-3" /> Step
            </button>
            <button
              onClick={resetDemo}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 6 SPECIALIZED AGENT CARDS GRID */}
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                SPECIALIZED AGENT CLUSTER (6 AGENTS IN GRAPH)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              State Flow: IDLE → ANALYZING → PLANNING → COMPLETE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const Icon = agent.icon
              const isSelected = selectedAgent === agent.id

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                    isSelected
                      ? 'border-purple-500 bg-[#0a0e20] shadow-xl shadow-purple-950/40'
                      : 'border-slate-800 bg-[#070b16] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-black/40 border border-slate-800">
                        <Icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{agent.name}</h4>
                        <span className="text-[9.5px] text-slate-400 block">{agent.role}</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                      agent.status === 'COMPLETE'
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                        : agent.status === 'ACTIVE' || agent.status === 'PLANNING'
                        ? 'bg-amber-950 border border-amber-800 text-amber-300 animate-pulse'
                        : agent.status === 'ANALYZING'
                        ? 'bg-sky-950 border border-sky-800 text-sky-300 animate-pulse'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}>
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                    {agent.summary}
                  </p>

                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Confidence: <strong className="text-slate-200">{agent.confidence}</strong></span>
                    <span className="text-purple-400 font-bold flex items-center gap-1">
                      Inspect <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* BOTTOM SECTION: AGENT TELEMETRY & EXECUTION DETAIL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
          
          {/* LEFT 2 COLS: SELECTED AGENT DEEP INSPECTION */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#070b16] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  AGENT EXECUTION STATE: {activeAgent.name.toUpperCase()}
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                CONFIDENCE: {activeAgent.confidence}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-slate-850 space-y-1">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">Agent Deliberation Summary:</span>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  {activeAgent.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Inputs */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <span className="text-[9.5px] text-sky-400 font-bold uppercase block">Observed Telemetry Ingests:</span>
                  <ul className="space-y-1 text-[10.5px] text-slate-300">
                    {activeAgent.inputs.map((inp, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5">
                        <span className="text-sky-500">•</span>
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outputs */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                  <span className="text-[9.5px] text-emerald-400 font-bold uppercase block">Derived Directives & Scores:</span>
                  <ul className="space-y-1 text-[10.5px] text-slate-300">
                    {activeAgent.outputs.map((out, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5">
                        <span className="text-emerald-400">✓</span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
              <span>Execution Engine: <strong className="text-white">Deterministic Multi-Agent State Graph</strong></span>
              <Link href="/dashboard/district" className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1">
                View in District Incident Command <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT COL: AUDIT LOG TERMINAL */}
          <div className="rounded-2xl border border-slate-800 bg-[#070b16] p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  COORDINATION AGENT AUDIT LOG
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="bg-black/60 rounded-xl p-3 border border-slate-900 space-y-2 text-[10px] text-slate-300 font-mono h-[220px] overflow-y-auto">
              <div className="text-slate-500">[{simulationTime}] Orchestrator graph cycle initiated</div>
              <div><span className="text-red-400">[RISK]</span> Assessed flood threat severity: 88/100</div>
              <div><span className="text-sky-400">[HYDRO]</span> Inundation depth forecasted at 48cm</div>
              <div><span className="text-amber-400">[TRAFFIC]</span> NH16 North detour verified clear</div>
              <div><span className="text-emerald-400">[FLEET]</span> DP-04, FT-12, P-305 assigned</div>
              <div><span className="text-purple-400">[EMS]</span> KGH trauma capacity reserved</div>
              <div className="text-indigo-300 font-bold">[COORDINATION] Multi-dept plan waiting for officer approval</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-center text-[10px] text-slate-400">
              Safe Operational Protocol: <strong className="text-emerald-400">HITL Gating Enforced</strong>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  )
}
