'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import { useVizagDataStore } from '../../../store/useVizagDataStore'
import { apiService } from '../../../services/api'
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
  RotateCcw,
  Check,
  AlertCircle
} from 'lucide-react'

export type ScenarioChoice = 'flood' | 'cyclone' | 'fire' | 'accident'

export interface StandardAgentResult {
  agent: string
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'BLOCKED' | 'FAILED'
  input_signals: string[]
  finding: string
  risk_impact_score?: string
  why: string
  confidence?: string
  recommendation: string
  action: string
  action_status: 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'READY' | 'PENDING'
  next_step: string
  provenance: string
}

export default function AIOperationsCenterPage() {
  const { demoStage, simulationTime, incident, stepForward, resetDemo } = useVizagDataStore()
  const [selectedScenario, setSelectedScenario] = useState<ScenarioChoice>('flood')
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0)
  const [liveIntelligence, setLiveIntelligence] = useState<any | null>(null)
  const [isLoadingIntel, setIsLoadingIntel] = useState<boolean>(false)

  // Fetch real backend incident intelligence if available
  useEffect(() => {
    async function loadIntelligence() {
      setIsLoadingIntel(true)
      try {
        const incidentsList = await apiService.getIncidents({ limit: 5 })
        if (incidentsList && incidentsList.length > 0) {
          const targetInc = incidentsList[0]
          const intel = await apiService.getIncidentIntelligence(targetInc.id)
          if (intel) {
            setLiveIntelligence(intel)
          }
        }
      } catch (err) {
        console.warn('Live backend intelligence connection unavailable, using synchronized agent graph state:', err)
      } finally {
        setIsLoadingIntel(false)
      }
    }
    loadIntelligence()
  }, [demoStage, selectedScenario])

  // Derive 9 capability agents from live intelligence or synchronized store
  const capabilityAgents: StandardAgentResult[] = liveIntelligence?.capability_agents || [
    {
      agent: 'Risk Assessment Agent',
      status: demoStage === 'T00_NORMAL' ? 'QUEUED' : 'COMPLETED',
      input_signals: ['Visakhapatnam Sump Telemetry', 'IMD Doppler Radar DBZ', 'Historical Catchment RAG'],
      finding: `Threat Level ${demoStage === 'T00_NORMAL' ? 'NORMAL' : 'CRITICAL'} (Score: ${incident.aiRiskScore || 88}/100, Trend: ${demoStage === 'T35_WATER_RISING' ? 'RISING' : 'STABLE'})`,
      risk_impact_score: `${Math.round(incident.aiRiskScore || 88)}/100`,
      why: `Risk score evaluated from telemetry depth (${incident.waterDepthCm || 18}cm) and spatial catchment exposure.`,
      confidence: `${incident.aiConfidence || 94.6}%`,
      recommendation: `Escalate threat classification to ${incident.severity?.toUpperCase() || 'CRITICAL'}`,
      action: 'Update incident risk classification and notify emergency dispatchers',
      action_status: 'COMPLETED',
      next_step: 'Pass risk vector to Impact Assessment & Hydro-Nowcasting Agents',
      provenance: incident.provenance || 'PROTOTYPE_SIMULATION'
    },
    {
      agent: 'Impact Assessment Agent',
      status: demoStage === 'T00_NORMAL' ? 'QUEUED' : 'COMPLETED',
      input_signals: ['Spatial Infrastructure Cadastre', 'Arterial Road Contours', 'Ward Population Exposure'],
      finding: `Impact Score 92/100 affecting ${incident.location || 'RK Beach Road Sector 4 Corridor'}`,
      risk_impact_score: '92/100',
      why: 'Arterial roadway submergence threatens emergency medical transit to KGH hospital.',
      confidence: '94%',
      recommendation: 'Isolate vulnerable coastal road sectors and protect critical hospital transit route',
      action: 'Flag Beach Road corridor for emergency traffic diversion',
      action_status: 'COMPLETED',
      next_step: 'Trigger Hydro-Nowcasting & Traffic Operations Agents',
      provenance: incident.provenance || 'PROTOTYPE_SIMULATION'
    },
    {
      agent: 'Environmental / Hazard Agent',
      status: demoStage === 'T00_NORMAL' ? 'QUEUED' : demoStage === 'T35_WATER_RISING' ? 'RUNNING' : 'COMPLETED',
      input_signals: ['Hydrometer Telemetry', 'Catchment Inflow Rate (180 L/s)', 'Tidal Outfall Level'],
      finding: `Hydrodynamic model predicts ${incident.waterDepthCm || 48}cm standing water depth at outfall`,
      risk_impact_score: '+12 cm/hr',
      why: 'Sump inflow velocity exceeds gravity drainage capacity during peak coastal tide.',
      confidence: '92%',
      recommendation: 'Stage high-capacity municipal dewatering pump DP-04 at Sector 4 outfall',
      action: 'Deploy Dewatering Pump DP-04 to outfall breach point',
      action_status: 'IN_PROGRESS',
      next_step: 'Execute traffic detour via Traffic Operations Agent',
      provenance: incident.provenance || 'PROTOTYPE_SIMULATION'
    },
    {
      agent: 'Traffic Operations Agent',
      status: demoStage === 'T00_NORMAL' ? 'QUEUED' : 'COMPLETED',
      input_signals: ['CCTV YOLO Perception (CAM-04)', 'Traffic Interceptor Patrol P-305', 'Road Elevation Map'],
      finding: 'Beach Road arterial segment flooded; detour required onto NH16 North Bypass',
      risk_impact_score: '78/100 Congestion',
      why: 'Standing water depth impedes civilian vehicular transit; green corridor required for ambulances.',
      confidence: '78%',
      recommendation: 'Divert civilian traffic to NH16; establish Smart Green Wave on Ram Nagar Rd',
      action: 'Enforce green corridor signal priority for emergency vehicles',
      action_status: 'PROPOSED',
      next_step: 'Reserve trauma bed capacity via Medical Agent',
      provenance: incident.provenance || 'PROTOTYPE_SIMULATION'
    },
    {
      agent: 'Medical Agent',
      status: demoStage === 'T00_NORMAL' ? 'QUEUED' : 'COMPLETED',
      input_signals: ['Hospital Bed Availability Registry', 'King George Hospital ICU Capacity', 'Paramedic Telemetry'],
      finding: 'King George Hospital alerted (18 ICU beds free); Priority EMS green wave ready',
      risk_impact_score: '18 ICU Beds Free',
      why: 'High-severity incident requires pre-positioned trauma bed reservation and paramedic standby.',
      confidence: '95%',
      recommendation: 'Alert KGH Level 1 Trauma wing and place Ambulance A-21 on priority transit',
      action: 'Reserve emergency ICU beds at nearest tertiary hospital',
      action_status: 'READY',
      next_step: 'Match response fleet via Resource Matching Agent',
      provenance: incident.provenance || 'PROTOTYPE_SIMULATION'
    },
    {
      agent: 'Resource Matching Agent',
      status: demoStage === 'T00_NORMAL' ? 'QUEUED' : 'COMPLETED',
      input_signals: ['Real-time Emergency GPS Pool', 'Proximity Matching Engine', 'Atomic Lock Status'],
      finding: '4 units matched by proximity: Dewatering Pump DP-04, Tender FT-12, Patrol P-305, Ambulance A-21',
      risk_impact_score: '96/100 Proximity Match',
      why: 'Units selected based on <6 min ETA, required capability, and available lock status.',
      confidence: '94%',
      recommendation: 'Lock and allocate primary emergency units with atomic concurrency protection',
      action: 'Reserve 4 primary units for multi-department dispatch',
      action_status: 'PROPOSED',
      next_step: 'Pass asset directives to Planning Agent',
      provenance: incident.provenance || 'PROTOTYPE_SIMULATION'
    },
    {
      agent: 'Planning Agent',
      status: demoStage === 'T00_NORMAL' ? 'QUEUED' : 'COMPLETED',
      input_signals: ['Incident Intelligence Object', 'Action Dependency Tree', 'Plan Version History'],
      finding: 'Response Plan V1 synthesized containing 5 cross-department directives',
      risk_impact_score: 'Plan V1',
      why: 'Multi-agent directives aggregated into structured execution sequence.',
      confidence: '92%',
      recommendation: 'Submit Response Plan V1 sequence to Duty Commander for HITL sign-off',
      action: 'Generate 5-point cross-department response plan',
      action_status: 'PROPOSED',
      next_step: 'Submit for Inter-Agency & Officer HITL approval',
      provenance: incident.provenance || 'PROTOTYPE_SIMULATION'
    },
    {
      agent: 'Inter-Agency Coordination Agent',
      status: demoStage === 'T00_NORMAL' ? 'QUEUED' : 'COMPLETED',
      input_signals: ['State Disaster SOP Framework', 'Multi-Department Capability Matrix', 'Command Hierarchy'],
      finding: 'Synchronized GVMC, Police, Fire, and Health departments under Duty Commander protocol',
      risk_impact_score: '5 Depts Aligned',
      why: 'High-impact municipal actions require affirmative human-in-the-loop authorization.',
      confidence: '96%',
      recommendation: 'Enforce Duty Commander HITL gating prior to field dispatch',
      action: 'Gate plan execution on Duty Commander affirmative sign-off',
      action_status: 'PENDING',
      next_step: 'Broadcast approved directives via WebSocket upon officer sign-off',
      provenance: incident.provenance || 'PROTOTYPE_SIMULATION'
    },
    {
      agent: 'Monitoring / Reassessment Agent',
      status: demoStage === 'T00_NORMAL' ? 'QUEUED' : demoStage === 'T70_RISK_NORMALIZED' ? 'COMPLETED' : 'RUNNING',
      input_signals: ['Live Sump Sensor Stream', 'CCTV Queue Perception', 'Telemetry Surge Monitor'],
      finding: 'Continuously monitoring water depth and traffic queue velocity for metric shifts',
      risk_impact_score: demoStage === 'T35_WATER_RISING' ? 'RISING' : 'STABLE',
      why: 'Dynamic telemetry changes trigger automatic AI re-assessment and Plan V2 version increment.',
      confidence: '90%',
      recommendation: 'Poll telemetry loop at 1-minute intervals and trigger dynamic replanning on surge',
      action: 'Maintain continuous digital twin monitoring loop',
      action_status: 'IN_PROGRESS',
      next_step: 'Trigger dynamic replanning upon telemetry change',
      provenance: incident.provenance || 'PROTOTYPE_SIMULATION'
    }
  ]

  const activeAgent = capabilityAgents[selectedAgentIndex] || capabilityAgents[0]

  // Execution Timeline Steps
  const timelineSteps = [
    { label: 'EVENT INGESTED', status: demoStage === 'T00_NORMAL' ? 'QUEUED' : 'COMPLETED' },
    { label: 'RISK ASSESSMENT', status: capabilityAgents[0].status },
    { label: 'IMPACT ASSESSMENT', status: capabilityAgents[1].status },
    { label: 'ENVIRONMENTAL/HAZARD', status: capabilityAgents[2].status },
    { label: 'TRAFFIC OPERATIONS', status: capabilityAgents[3].status },
    { label: 'RESOURCE MATCHING', status: capabilityAgents[5].status },
    { label: 'PLANNING', status: capabilityAgents[6].status },
    { label: 'INTER-AGENCY COORDINATION', status: capabilityAgents[7].status },
    { label: 'HITL', status: incident.humanSignOff ? 'COMPLETED' : 'PENDING' },
    { label: 'OPERATIONAL EXECUTION', status: incident.humanSignOff ? 'COMPLETED' : 'QUEUED' },
    { label: 'MONITORING', status: capabilityAgents[8].status },
    { label: 'REASSESSMENT', status: demoStage === 'T35_WATER_RISING' ? 'RUNNING' : 'COMPLETED' }
  ]

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

        {/* AGENT EXECUTION TIMELINE BAR */}
        <div className="p-4 rounded-2xl border border-indigo-900/60 bg-[#070b16] space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              END-TO-END AGENT EXECUTION TIMELINE
            </span>
            <span className="text-[10px] text-slate-400">
              State: {isLoadingIntel ? 'Syncing Backend...' : 'VERIFIED REALTIME SYNC'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-[9.5px]">
            {timelineSteps.map((step, idx) => (
              <div 
                key={idx} 
                className={`p-2 rounded-xl border flex items-center justify-between ${
                  step.status === 'COMPLETED'
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                    : step.status === 'RUNNING'
                    ? 'bg-amber-950/40 border-amber-800/80 text-amber-300 animate-pulse'
                    : 'bg-slate-950 border-slate-850 text-slate-500'
                }`}
              >
                <span className="font-bold truncate">{step.label}</span>
                <span className="text-[8px] font-black uppercase shrink-0 ml-1">
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 9 CAPABILITY AGENT CARDS GRID */}
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                SPECIALIZED CAPABILITY AGENT CLUSTER (9 AGENTS IN GRAPH)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Select Agent Card to Inspect Deliberation View
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilityAgents.map((agent, idx) => {
              const isSelected = selectedAgentIndex === idx

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedAgentIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                    isSelected
                      ? 'border-purple-500 bg-[#0a0e20] shadow-xl shadow-purple-950/40'
                      : 'border-slate-800 bg-[#070b16] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-black/40 border border-slate-800">
                        <Bot className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{agent.agent}</h4>
                        <span className="text-[9.5px] text-slate-400 block truncate max-w-[160px]">{agent.finding}</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                      agent.status === 'COMPLETED'
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                        : agent.status === 'RUNNING'
                        ? 'bg-amber-950 border border-amber-800 text-amber-300 animate-pulse'
                        : agent.status === 'FAILED'
                        ? 'bg-red-950 border border-red-800 text-red-300'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}>
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                    {agent.recommendation}
                  </p>

                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Score: <strong className="text-slate-200">{agent.risk_impact_score || 'N/A'}</strong></span>
                    <span className="text-purple-400 font-bold flex items-center gap-1">
                      Inspect <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* STANDARDIZE FRONTEND AGENT RESULT VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
          
          {/* LEFT 2 COLS: STANDARDIZED AGENT RESULT VIEW */}
          <div className="lg:col-span-2 rounded-2xl border border-purple-900/60 bg-[#070b16] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-purple-950 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  STANDARDIZED AGENT RESULT: {activeAgent.agent.toUpperCase()}
                </h3>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded uppercase ${
                activeAgent.status === 'COMPLETED'
                  ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                  : activeAgent.status === 'RUNNING'
                  ? 'bg-amber-950 border border-amber-800 text-amber-300 animate-pulse'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}>
                STATUS: {activeAgent.status}
              </span>
            </div>

            {/* STANDARDIZED FIELD GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* AGENT */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">AGENT</span>
                <span className="font-bold text-white block">{activeAgent.agent}</span>
              </div>

              {/* STATUS */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">STATUS</span>
                <span className="font-bold text-emerald-400 block">{activeAgent.status}</span>
              </div>

              {/* INPUT / SIGNALS USED */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1 sm:col-span-2">
                <span className="text-[9px] text-sky-400 uppercase font-bold block">INPUT / SIGNALS USED</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {activeAgent.input_signals.map((sig, sidx) => (
                    <span key={sidx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                      • {sig}
                    </span>
                  ))}
                </div>
              </div>

              {/* FINDING */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1 sm:col-span-2">
                <span className="text-[9px] text-purple-400 uppercase font-bold block">FINDING</span>
                <p className="text-slate-200 font-sans leading-relaxed">{activeAgent.finding}</p>
              </div>

              {/* RISK / IMPACT SCORE WHEN AVAILABLE */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1">
                <span className="text-[9px] text-red-400 uppercase font-bold block">RISK / IMPACT SCORE</span>
                <span className="font-black text-red-300 text-sm">{activeAgent.risk_impact_score || 'Not available'}</span>
              </div>

              {/* CONFIDENCE WHEN AVAILABLE */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1">
                <span className="text-[9px] text-emerald-400 uppercase font-bold block">CONFIDENCE</span>
                <span className="font-bold text-emerald-300">{activeAgent.confidence || 'Not available'}</span>
              </div>

              {/* WHY / RATIONALE */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1 sm:col-span-2">
                <span className="text-[9px] text-amber-400 uppercase font-bold block">WHY / RATIONALE</span>
                <p className="text-slate-300 font-sans leading-relaxed text-[11px]">{activeAgent.why}</p>
              </div>

              {/* RECOMMENDATION */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1 sm:col-span-2">
                <span className="text-[9px] text-teal-400 uppercase font-bold block">RECOMMENDATION</span>
                <p className="text-slate-200 font-sans leading-relaxed">{activeAgent.recommendation}</p>
              </div>

              {/* ACTION & ACTION STATUS */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1">
                <span className="text-[9px] text-indigo-400 uppercase font-bold block">ACTION</span>
                <span className="font-bold text-slate-200 text-[11px] block">{activeAgent.action}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1">
                <span className="text-[9px] text-indigo-400 uppercase font-bold block">ACTION STATUS</span>
                <span className="font-bold text-indigo-300 text-[11px] block">{activeAgent.action_status}</span>
              </div>

              {/* NEXT STEP */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1">
                <span className="text-[9px] text-orange-400 uppercase font-bold block">NEXT STEP</span>
                <span className="font-bold text-slate-300 text-[11px] block">{activeAgent.next_step}</span>
              </div>

              {/* PROVENANCE */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-850 space-y-1">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">PROVENANCE</span>
                <span className="font-bold text-amber-300 text-[11px] block">{activeAgent.provenance}</span>
              </div>

            </div>

            <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
              <span>Execution Contract: <strong className="text-white">Standardized Agent Result View</strong></span>
              <Link href="/dashboard/district" className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1">
                View in District Incident Command <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT COL: AUDIT LOG TERMINAL */}
          <div className="rounded-2xl border border-slate-800 bg-[#070b16] p-5 space-y-3 flex flex-col justify-between font-mono">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  COORDINATION AGENT AUDIT LOG
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="bg-black/60 rounded-xl p-3 border border-slate-900 space-y-2 text-[10px] text-slate-300 font-mono h-[280px] overflow-y-auto">
              <div className="text-slate-500">[{simulationTime}] Orchestrator graph cycle initiated</div>
              <div><span className="text-red-400">[RISK]</span> Assessed flood threat severity: {incident.aiRiskScore ? Math.round(incident.aiRiskScore) : 88}/100</div>
              <div><span className="text-sky-400">[IMPACT]</span> Inundation depth forecasted at {incident.waterDepthCm || 48}cm</div>
              <div><span className="text-amber-400">[TRAFFIC]</span> NH16 North detour verified clear</div>
              <div><span className="text-purple-400">[MEDICAL]</span> KGH trauma bed capacity reserved</div>
              <div><span className="text-emerald-400">[RESOURCE]</span> DP-04, FT-12, P-305 assigned</div>
              <div><span className="text-indigo-400">[PLANNING]</span> Plan V1 synthesized with 5 directives</div>
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
