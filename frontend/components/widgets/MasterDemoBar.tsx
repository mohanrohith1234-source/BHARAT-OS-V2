'use client'

import React from 'react'
import { useVizagDataStore, DemoStage } from '../../store/useVizagDataStore'
import { Play, Pause, StepForward, RotateCcw, ShieldAlert, Sparkles, Activity, CheckCircle2 } from 'lucide-react'

export default function MasterDemoBar() {
  const { demoStage, demoRunning, startDemo, pauseDemo, stepForward, resetDemo, approveIncidentAction, incident } = useVizagDataStore()

  const stageDescriptions: Record<DemoStage, { title: string; color: string; badge: string }> = {
    IDLE: { title: 'Baseline Monitoring — Normal Sensor Readings', color: 'text-slate-400', badge: 'IDLE' },
    HEAVY_RAIN: { title: 'Precipitation Spike (64mm/hr) — Mudasarlova & Beach Rd Inflow', color: 'text-blue-400', badge: 'HEAVY RAIN' },
    WATER_RISING: { title: 'Sensor #1 Culvert Level 42cm (Threshold 35cm) — Alert Triggered', color: 'text-amber-400', badge: 'WATER RISING' },
    INCIDENT_DETECTED: { title: 'INC-1042 Auto-Generated — Beach Road Outfall Flooded', color: 'text-red-400', badge: 'INCIDENT LOGGED' },
    AI_TRIAGE: { title: 'AI Flood Agent Evaluates: Divert Traffic, Stage Dewatering Pump', color: 'text-purple-400', badge: 'AI TRIAGE' },
    OFFICER_APPROVED: { title: 'Human Operator Sign-Off Confirmed — Dispatch Authorized', color: 'text-emerald-400', badge: 'OFFICER SIGN-OFF' },
    UNITS_DISPATCHED: { title: 'Units En Route: P-305, FT-12 (Pump DP-04), A-21 Transit', color: 'text-cyan-400', badge: 'MULTI-AGENCY DISPATCH' },
    WATER_DRAINED: { title: 'High-Volume Dewatering DP-04 Active — Water Receding to 18cm', color: 'text-teal-400', badge: 'PUMPING ACTIVE' },
    RESOLVED: { title: 'Incident Resolved — Road Reopened, Baseline Restored', color: 'text-emerald-400', badge: 'RESOLVED' }
  }

  const currentInfo = stageDescriptions[demoStage] || stageDescriptions.IDLE

  return (
    <aside aria-label="Master Scenario Simulator" className="fixed bottom-7 right-8 z-[90] max-w-2xl w-full bg-[#050816]/95 border border-sky-500/30 rounded-2xl p-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between border-b border-slate-850 pb-2.5 mb-2.5">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={demoRunning ? "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-sky-400" : "absolute inline-flex h-full w-full rounded-full opacity-75 bg-slate-500"}></span>
            <span className={demoRunning ? "relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" : "relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"}></span>
          </span>
          <span className="text-[11px] font-extrabold tracking-wider font-mono text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            BHARATOS MASTER SCENARIO SIMULATOR
          </span>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 text-sky-300 font-bold uppercase tracking-wider">
            {currentInfo.badge}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-300 font-bold">
            SIMULATION
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold truncate ${currentInfo.color}`}>
            {currentInfo.title}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
            <span>Ticket: <strong className="text-white">INC-1042</strong></span>
            <span>•</span>
            <span>Depth: <strong className="text-white">{incident.waterDepthCm} cm</strong></span>
            <span>•</span>
            <span>Sign-off: <strong className={incident.humanSignOff ? "text-emerald-400" : "text-amber-400"}>{incident.humanSignOff ? "APPROVED" : "PENDING"}</strong></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {!incident.humanSignOff && (demoStage === 'AI_TRIAGE' || demoStage === 'INCIDENT_DETECTED') && (
            <button
              onClick={() => approveIncidentAction('Duty Commander (Badge #104)')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
              title="Human-in-the-loop Safety Gate Sign-Off"
            >
              <CheckCircle2 className="w-3 h-3" />
              AUTHORIZE
            </button>
          )}

          {demoRunning ? (
            <button
              onClick={pauseDemo}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Pause Simulation"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={startDemo}
              className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-sky-900/40 transition-all active:scale-95"
              title="Run Automated Scenario"
            >
              <Play className="w-3 h-3 fill-current" />
              START DEMO
            </button>
          )}

          <button
            onClick={stepForward}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Step Forward (1 Phase)"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            onClick={resetDemo}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
