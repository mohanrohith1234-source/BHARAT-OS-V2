'use client'

import React, { useState } from 'react'
import { useVizagDataStore, DemoStage } from '../../store/useVizagDataStore'
import { Play, Pause, StepForward, RotateCcw, ShieldAlert, Sparkles, Activity, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react'

export default function MasterDemoBar() {
  const [expanded, setExpanded] = useState<boolean>(false)

  const { 
    demoStage, 
    simulationTime,
    demoRunning, 
    startDemo, 
    pauseDemo, 
    stepForward, 
    resetDemo, 
    approveIncidentAction, 
    incident 
  } = useVizagDataStore()

  const stageDescriptions: Record<string, { title: string; color: string; badge: string }> = {
    T00_NORMAL: { title: 'T+00: Baseline Monitoring — Radar & Outfall Flow Normal', color: 'text-slate-400', badge: 'T+00 NORMAL' },
    T05_WEATHER_SIGNAL: { title: 'T+05: Radar Convective Band Intensifies (28 mm/h)', color: 'text-blue-400', badge: 'T+05 WEATHER' },
    T10_AI_NOWCAST: { title: 'T+10: AI Nowcast Activated — 4-Horizon Trajectory Generated', color: 'text-purple-400', badge: 'T+10 NOWCAST' },
    T15_WARD_RISK: { title: 'T+15: Ward 12 Culvert Level 36cm (Threshold 35cm) — HIGH RISK', color: 'text-amber-400', badge: 'T+15 RISK' },
    T20_EARLY_WARNING: { title: 'T+20: Multi-Agency Early Warning Issued (Citizens & Response)', color: 'text-orange-400', badge: 'T+20 WARNING' },
    T25_TRAFFIC_IMPACT: { title: 'T+25: Traffic Congestion Predicted; NH16 Bypass Detour Staged', color: 'text-amber-300', badge: 'T+25 TRAFFIC' },
    T30_OFFICER_APPROVAL: { title: 'T+30: Officer Human Sign-Off Confirmed — Preparedness Authorized', color: 'text-emerald-400', badge: 'T+30 APPROVED' },
    T35_WATER_RISING: { title: 'T+35: Inundation Depth 48cm — Beach Road Barrier Closed', color: 'text-red-400', badge: 'T+35 FLOOD' },
    T40_RESPONSE_DEPLOYED: { title: 'T+40: Multi-Agency En Route: FT-12 (Pump), A-21 (EMS), P-305 (Detour)', color: 'text-cyan-400', badge: 'T+40 DEPLOYED' },
    T50_DIGITAL_TWIN: { title: 'T+50: Dewatering Pump DP-04 Operating on Scene — Tracking on Twin', color: 'text-teal-400', badge: 'T+50 TWIN' },
    T60_WATER_FALLING: { title: 'T+60: Pump DP-04 Operating — Water Receding to 22cm', color: 'text-emerald-400', badge: 'T+60 RECEDING' },
    T70_RISK_NORMALIZED: { title: 'T+70: Scene Secured — Roadway Reopened, Normal Baseline Restored', color: 'text-emerald-400', badge: 'T+70 NORMALIZED' },
    IDLE: { title: 'T+00: Baseline Monitoring — Normal Hydrological Flow', color: 'text-slate-400', badge: 'T+00 NORMAL' },
    HEAVY_RAIN: { title: 'T+05: Radar Inflow Rising (28 mm/h)', color: 'text-blue-400', badge: 'T+05 WEATHER' },
    WATER_RISING: { title: 'T+35: Inundation Depth 48cm — Water Rising', color: 'text-red-400', badge: 'T+35 FLOOD' },
    INCIDENT_DETECTED: { title: 'T+15: Ward 12 Culvert Sump Level Escalates — HIGH RISK', color: 'text-amber-400', badge: 'T+15 RISK' },
    AI_TRIAGE: { title: 'T+20: Early Warning Issued across Agencies', color: 'text-orange-400', badge: 'T+20 WARNING' },
    OFFICER_APPROVED: { title: 'T+30: Officer Human Sign-Off Confirmed', color: 'text-emerald-400', badge: 'T+30 APPROVED' },
    UNITS_DISPATCHED: { title: 'T+40: Units En Route: FT-12, A-21, P-305', color: 'text-cyan-400', badge: 'T+40 DEPLOYED' },
    WATER_DRAINED: { title: 'T+60: Water Receding to 22cm', color: 'text-teal-400', badge: 'T+60 RECEDING' },
    RESOLVED: { title: 'T+70: Incident Resolved — Scene Secured', color: 'text-emerald-400', badge: 'T+70 NORMALIZED' }
  }

  const currentInfo = stageDescriptions[demoStage] || stageDescriptions.T00_NORMAL

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="fixed bottom-5 right-5 z-[90] px-3.5 py-2 rounded-xl bg-[#050816]/95 border border-sky-500/40 text-white text-xs font-bold font-mono shadow-2xl backdrop-blur-xl flex items-center space-x-2.5 hover:border-sky-400 transition-all cursor-pointer group"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className={demoRunning ? "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-sky-400" : "absolute inline-flex h-full w-full rounded-full opacity-75 bg-slate-500"}></span>
          <span className={demoRunning ? "relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" : "relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"}></span>
        </span>
        <Sparkles className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
        <span className="tracking-wider">DEMO CONTROL</span>
        <span className="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 text-[9.5px]">
          {currentInfo.badge}
        </span>
        <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
      </button>
    )
  }

  return (
    <aside aria-label="Master Scenario Simulator" className="fixed bottom-5 right-5 z-[90] max-w-xl w-full bg-[#050816]/95 border border-sky-500/40 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all font-mono">
      <div className="flex items-center justify-between border-b border-slate-850 pb-2.5 mb-2.5">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={demoRunning ? "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-sky-400" : "absolute inline-flex h-full w-full rounded-full opacity-75 bg-slate-500"}></span>
            <span className={demoRunning ? "relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" : "relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"}></span>
          </span>
          <span className="text-[11px] font-extrabold tracking-wider text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            BHARATOS DEMO CONTROL
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-blue-950/70 border border-blue-700/60 text-blue-300 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            {simulationTime}
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 text-sky-300 font-bold uppercase tracking-wider">
            {currentInfo.badge}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Collapse Demo Control"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold truncate ${currentInfo.color}`}>
            {currentInfo.title}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
            <span>Ticket: <strong className="text-white">INC-1042</strong></span>
            <span>•</span>
            <span>Depth: <strong className="text-white">{incident.waterDepthCm} cm</strong></span>
            <span>•</span>
            <span>Sign-off: <strong className={incident.humanSignOff ? "text-emerald-400" : "text-amber-400"}>{incident.humanSignOff ? "APPROVED" : "PENDING"}</strong></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {!incident.humanSignOff && ['T15_WARD_RISK', 'T20_EARLY_WARNING', 'T25_TRAFFIC_IMPACT', 'T30_OFFICER_APPROVAL', 'AI_TRIAGE', 'INCIDENT_DETECTED'].includes(demoStage) && (
            <button
              type="button"
              onClick={() => approveIncidentAction('Duty Commander (Badge #104)')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-emerald-900/30 transition-all active:scale-95 animate-pulse cursor-pointer"
              title="Human-in-the-loop Safety Gate Sign-Off"
            >
              <CheckCircle2 className="w-3 h-3" />
              AUTHORIZE
            </button>
          )}

          {demoRunning ? (
            <button
              type="button"
              onClick={pauseDemo}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Pause Simulation"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startDemo}
              className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-sky-900/40 transition-all active:scale-95 cursor-pointer"
              title="Run Automated Scenario"
            >
              <Play className="w-3 h-3 fill-current" />
              START DEMO
            </button>
          )}

          <button
            type="button"
            onClick={stepForward}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            title="Step Forward (1 Phase)"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={resetDemo}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
