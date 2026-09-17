'use client'

import React, { useState } from 'react'
import { 
  ShieldAlert, 
  Bot, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Truck, 
  Navigation, 
  Radio, 
  Check, 
  X, 
  Sparkles, 
  Building2, 
  Activity,
  ArrowRight,
  ShieldCheck,
  FileSearch,
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { useVizagDataStore } from '../../store/useVizagDataStore'

export default function IncidentCommandPanel() {
  const { incident, resources, approveIncidentAction, demoStage } = useVizagDataStore()
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [rejectReason, setRejectReason] = useState<string | null>(null)
  const [showRejectPrompt, setShowRejectPrompt] = useState(false)
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['AMB-042', 'FT-12', 'P-305', 'DP-04'])

  const matchedResources = [
    {
      id: 'AMB-042',
      name: 'ALS Ambulance #042',
      type: 'Medical / Paramedic',
      department: 'EMS (108 Dispatch)',
      distance: '1.8 km',
      eta: '3 mins',
      status: 'AVAILABLE',
      actionNeeded: 'Pre-position at Sector 4 medical corridor for civilian triage'
    },
    {
      id: 'FT-12',
      name: 'Water Rescue Tender FT-12',
      type: 'Fire & Water Rescue',
      department: 'AP Fire & Emergency',
      distance: '2.4 km',
      eta: '5 mins',
      status: 'AVAILABLE',
      actionNeeded: 'Rapid inflatable boats deployment & shoreline sweep'
    },
    {
      id: 'P-305',
      name: 'Traffic Interceptor Patrol P-305',
      type: 'Law Enforcement / Traffic',
      department: 'Visakhapatnam City Police',
      distance: '1.2 km',
      eta: '2 mins',
      status: 'AVAILABLE',
      actionNeeded: 'Enforce perimeter detour: RK Beach Rd -> NH16 bypass'
    },
    {
      id: 'DP-04',
      name: 'High-Volume Dewatering Pump DP-04',
      type: 'Stormwater Infrastructure',
      department: 'GVMC Disaster Management',
      distance: 'On Scene',
      eta: 'Stationary',
      status: 'OPERATING',
      actionNeeded: 'Discharging 180 L/s from Sector 4 culvert into outfall'
    },
    {
      id: 'FAC-KGH',
      name: 'King George Hospital (KGH)',
      type: 'Tertiary Trauma Center',
      department: 'Government Medical Services',
      distance: '3.8 km',
      eta: '8 mins via Green Corridor',
      status: '18 ICU BEDS FREE',
      actionNeeded: 'Level 1 Trauma wing alerted, standby for hypothermia/trauma cases'
    },
    {
      id: 'FAC-SHELTER',
      name: 'MVP High School Relief Shelter',
      type: 'Designated Relief Camp',
      department: 'Civil Defense & Revenue Dept',
      distance: '0.6 km',
      eta: '2 mins walking distance',
      status: '120 CAPACITY READY',
      actionNeeded: 'Generators checked, dry rations & drinking water staged'
    }
  ]

  const toggleUnit = (id: string) => {
    if (selectedUnits.includes(id)) {
      setSelectedUnits(selectedUnits.filter(u => u !== id))
    } else {
      setSelectedUnits([...selectedUnits, id])
    }
  }

  const handleApprove = () => {
    approveIncidentAction('Duty Commander (Badge #104)')
    setShowModifyModal(false)
    setRejectReason(null)
  }

  const handleReject = () => {
    if (!rejectReason) {
      setRejectReason('Insufficient field units confirmed. Requesting secondary assessment.')
    }
    setShowRejectPrompt(false)
  }

  // Derive evidence chain components
  const hasYolo = incident.evidence?.detections && incident.evidence.detections.length > 0
  const hasIot = (incident.waterDepthCm && incident.waterDepthCm > 30) || incident.sourceType === 'IOT_SENSOR'
  const probableCause = hasYolo 
    ? 'Vehicle Collision & Traffic Bottleneck' 
    : (hasIot ? 'Culvert Outfall Inundation Overtopping' : 'CAUSE UNCONFIRMED — FIELD VERIFICATION REQUIRED')
  const confidenceScore = incident.aiConfidence || 94.6
  const verificationStatus = 'FIELD VERIFICATION REQUIRED'

  return (
    <div className="rounded-2xl border border-indigo-900/60 bg-[#070b16] p-5 space-y-5 shadow-2xl font-mono">
      
      {/* 1. INCIDENT HEADER & PROVENANCE BADGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-950 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-red-950/80 border border-red-700/60 text-red-300 text-xs font-black uppercase tracking-wider">
              {incident.ticketNumber || 'INC-1042'}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[10px] font-bold uppercase">
              SEVERITY: {incident.severity?.toUpperCase() || 'CRITICAL'}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 text-[9px] font-bold uppercase">
              {incident.provenance || 'PROTOTYPE_SIMULATION'}
            </span>
            <span className="text-[10px] text-slate-400">
              📍 {incident.location}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
            {incident.title}
          </h2>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase flex items-center gap-1.5 ${
            incident.humanSignOff
              ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
              : 'bg-amber-950/60 border-amber-700/60 text-amber-300 animate-pulse'
          }`}>
            {incident.humanSignOff ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OFFICER APPROVED & DISPATCHED</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PENDING OFFICER APPROVAL (HITL)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC REPLANNING / TELEMETRY ESCALATION BANNER (IF WATER RISING OR RE-ASSESSED) */}
      {(incident.waterDepthCm > 30 || demoStage === 'T35_WATER_RISING' || demoStage === 'T15_WARD_RISK') && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block">TELEMETRY CHANGE DETECTED — AI RE-ASSESSMENT ACTIVE</span>
              <span className="text-[11px] text-slate-300">
                Water depth escalated ({incident.waterDepthCm}cm) • Risk score updated: <strong className="text-red-400">{Math.round(incident.aiRiskScore || 88)}/100</strong> • Response plan steps regenerated.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold text-[10px] whitespace-nowrap">
            REPLANNING
          </span>
        </div>
      )}

      {/* 3. AI ASSESSMENT METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-black/40 border border-slate-850">
          <span className="text-[9px] text-slate-500 uppercase block">AI Classification</span>
          <span className="font-bold text-sky-400 text-[11px] truncate block">{incident.category || 'Coastal Flash Flood'}</span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-slate-850">
          <span className="text-[9px] text-slate-500 uppercase block">Risk Score</span>
          <span className="font-black text-red-400 text-sm">{incident.aiRiskScore ? Math.round(incident.aiRiskScore) : 88} / 100</span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-slate-850">
          <span className="text-[9px] text-slate-500 uppercase block">AI Confidence</span>
          <span className="font-bold text-emerald-400 text-[11px]">{incident.aiConfidence ? `${incident.aiConfidence}%` : '94.6%'} (Multi-agent)</span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-slate-850">
          <span className="text-[9px] text-slate-500 uppercase block">Est. Citizens at Risk</span>
          <span className="font-bold text-amber-300 text-[11px]">~{incident.peopleAtRisk || 140} Civilians</span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-slate-850 col-span-2 sm:col-span-1">
          <span className="text-[9px] text-slate-500 uppercase block">Trigger Source</span>
          <span className="font-bold text-orange-300 text-[11px] truncate block">{incident.sourceType || 'Edge Sensor'}</span>
        </div>
      </div>

      {/* 4. WHY / EVIDENCE CORRELATION CHAIN (CRITICAL REQUIREMENT) */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-teal-900/60 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-teal-400" />
            WHY / EVIDENCE CORRELATION CHAIN
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300 font-mono">
            PROBABILISTIC REASONING
          </span>
        </div>

        {/* Correlation Pipeline Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-[10px] items-center text-center">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
            <span className="text-[8px] font-bold text-slate-500 block uppercase">1. DETECTED</span>
            <span className="text-slate-200 font-bold block">{incident.sourceType || 'IoT Sensor'}</span>
          </div>

          <div className="hidden sm:flex justify-center text-slate-600">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
            <span className="text-[8px] font-bold text-slate-500 block uppercase">2. EVIDENCE</span>
            <span className="text-sky-300 font-bold block truncate">
              {hasYolo ? 'YOLO Frame (89%)' : `${incident.waterDepthCm}cm Water Level`}
            </span>
          </div>

          <div className="hidden sm:flex justify-center text-slate-600">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
            <span className="text-[8px] font-bold text-slate-500 block uppercase">3. PROBABLE CAUSE</span>
            <span className="text-amber-300 font-bold block truncate">{probableCause}</span>
          </div>

          <div className="p-2 rounded-lg bg-teal-950/60 border border-teal-800 space-y-0.5 col-span-1">
            <span className="text-[8px] font-bold text-teal-400 block uppercase">4. VERIFICATION</span>
            <span className="text-teal-200 font-bold block text-[9px]">{verificationStatus}</span>
          </div>
        </div>

        {/* Detailed Evidence Cards */}
        {incident.evidence && (
          <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
            {incident.evidence.camera_id && (
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Camera: <strong className="text-white">{incident.evidence.camera_id}</strong>
              </span>
            )}
            {incident.evidence.detections?.map((d: any, idx: number) => (
              <span key={idx} className="px-2.5 py-1 rounded bg-teal-950/80 border border-teal-700 text-teal-300">
                YOLO Detection: <strong>{d.class_name} ({Math.round(d.confidence * 100)}%)</strong>
              </span>
            ))}
            {incident.evidence.reading && (
              <span className="px-2.5 py-1 rounded bg-sky-950/80 border border-sky-700 text-sky-300">
                Telemetry: <strong>{incident.evidence.reading}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 5. AI RECOMMENDED RESPONSE PLAN */}
      <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              CROSS-DEPARTMENT RESPONSE PLAN (AI GENERATED)
            </h3>
          </div>
          <span className="text-[9.5px] px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
            {incident.aiResponsePlan?.length || 5} ACTION DIRECTIVES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {(incident.aiResponsePlan && incident.aiResponsePlan.length > 0 ? incident.aiResponsePlan : [
            "Deploy Dewatering Pump DP-04 and Hazmat Water Rescue Tender FT-12 to Sector 4.",
            "Close Beach Road corridor; divert all westbound traffic onto NH16 North Bypass via Patrol P-305.",
            "Alert King George Hospital to reserve 12 emergency beds & establish green wave corridor on Ram Nagar Rd.",
            "Activate MVP High School Shelter (capacity 120) with auxiliary generator power & dry rations.",
            "Issue localized BharatOS Citizen OS push notification to all phones connected to Beach Road cellular towers."
          ]).map((step, idx) => (
            <div key={idx} className={`p-2.5 rounded-lg bg-black/50 border border-indigo-950 flex items-start space-x-2 text-slate-200 ${idx === 4 ? 'md:col-span-2' : ''}`}>
              <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. TRAFFIC GREEN CORRIDOR ACTION FRAMING */}
      {incident.category === 'Traffic Disruption' || incident.category === 'Accident' ? (
        <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-300 flex items-center gap-1.5 uppercase text-[11px]">
              <Zap className="w-4 h-4 text-amber-400" />
              SMART GREEN WAVE SIGNAL OVERRIDE (RECOMMENDATION)
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300">
              ACTION FRAMING
            </span>
          </div>
          <p className="text-slate-300 text-[11px]">
            AI Recommendation → Officer Approval → Simulated / Authorized Operational Signal Override.
          </p>
        </div>
      ) : null}

      {/* 7. RESOURCE MATCHING (DECISION SUPPORT) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              INTELLIGENT RESOURCE MATCHING (PROXIMITY ENGINE)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            6 Units & Facilities Matched
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {matchedResources.map((res) => {
            const isSelected = selectedUnits.includes(res.id)
            return (
              <div 
                key={res.id} 
                className={`p-3.5 rounded-xl border transition-all space-y-2 text-xs ${
                  isSelected 
                    ? 'border-slate-800 bg-[#060a14]' 
                    : 'border-slate-900 bg-slate-950/40 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">{res.name}</span>
                  <span className={`text-[8.5px] font-black px-2 py-0.5 rounded uppercase ${
                    res.status.includes('AVAILABLE') || res.status.includes('FREE') || res.status.includes('READY')
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                      : 'bg-sky-950/80 border border-sky-800 text-sky-300'
                  }`}>
                    {res.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{res.department}</span>
                  <span className="text-sky-300 font-bold">{res.distance} • {res.eta}</span>
                </div>

                <p className="text-[10px] text-slate-300 leading-snug pt-1 border-t border-slate-900">
                  {res.actionNeeded}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 8. HUMAN APPROVAL CONTROLS (HITL SAFETY GATING) */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase text-white">
              HUMAN-IN-THE-LOOP COMMAND GATE
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            {incident.humanSignOff 
              ? `Authorized by ${incident.signedBy || 'Duty Commander K. Sharma'} • Dispatched via State Emergency Gateway` 
              : 'AI proposed plan requires affirmative officer sign-off before resource dispatch.'}
          </p>
          {rejectReason && (
            <p className="text-[10px] text-red-400 font-bold mt-1">
              ⚠️ Last Decision: {rejectReason}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {!incident.humanSignOff ? (
            <>
              <button
                onClick={handleApprove}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition-all shadow-lg hover:shadow-emerald-900/40 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>APPROVE RESPONSE PLAN</span>
              </button>

              <button
                onClick={() => setShowModifyModal(!showModifyModal)}
                className="px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase transition-all cursor-pointer"
              >
                MODIFY
              </button>

              <button
                onClick={() => setShowRejectPrompt(true)}
                className="px-3 py-2.5 rounded-xl border border-red-900/60 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold uppercase transition-all cursor-pointer"
              >
                REJECT
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800">
                <Check className="w-4 h-4" /> PLAN EXECUTING IN FIELD
              </span>
              <button
                onClick={() => setShowModifyModal(!showModifyModal)}
                className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs font-bold uppercase"
              >
                REASSIGN UNITS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* REJECT CONFIRMATION PROMPT */}
      {showRejectPrompt && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 space-y-2 text-xs">
          <span className="font-bold text-red-300 block">Confirm Plan Rejection:</span>
          <p className="text-slate-300 text-[11px]">Select reason to append to audit ledger:</p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => { setRejectReason('Resource units re-routed to higher-priority sector.'); handleReject(); }}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-red-500 text-slate-300 text-[10px]"
            >
              Units needed elsewhere
            </button>
            <button 
              onClick={() => { setRejectReason('Awaiting ground reconnaissance confirmation.'); handleReject(); }}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-red-500 text-slate-300 text-[10px]"
            >
              Awaiting scout report
            </button>
            <button 
              onClick={() => setShowRejectPrompt(false)}
              className="px-2.5 py-1 rounded bg-black text-slate-500 hover:text-white text-[10px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MODIFY UNITS MODAL / ACCORDION */}
      {showModifyModal && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase">Modify Unit Allocation (Commander Override):</span>
            <button onClick={() => setShowModifyModal(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {['AMB-042', 'FT-12', 'P-305', 'DP-04'].map((unitId) => (
              <button
                key={unitId}
                onClick={() => toggleUnit(unitId)}
                className={`p-2 rounded-lg border font-bold text-[10px] transition-all flex items-center justify-between ${
                  selectedUnits.includes(unitId)
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-black border-slate-800 text-slate-500'
                }`}
              >
                <span>{unitId}</span>
                <span>{selectedUnits.includes(unitId) ? '✓' : '+'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
