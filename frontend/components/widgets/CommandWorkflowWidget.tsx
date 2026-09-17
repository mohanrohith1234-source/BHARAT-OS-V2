'use client'

import React from 'react'
import { Activity, CheckCircle2, Clock, ShieldAlert, ArrowRight } from 'lucide-react'
import { useVizagDataStore, DemoStage } from '../../store/useVizagDataStore'

export default function CommandWorkflowWidget() {
  const { demoStage, simulationTime } = useVizagDataStore()

  // 7-step standard emergency operations workflow
  const workflowSteps = [
    { id: 1, label: 'Citizen Signal', stageKey: 'T05_WEATHER_SIGNAL', desc: 'SOS / Telemetry Ingest' },
    { id: 2, label: 'Incident Understanding', stageKey: 'T10_AI_NOWCAST', desc: 'Multi-Sensor Fusion' },
    { id: 3, label: 'AI Classification', stageKey: 'T15_WARD_RISK', desc: 'Threat & Risk Scoring' },
    { id: 4, label: 'Resource Matching', stageKey: 'T20_EARLY_WARNING', desc: 'Fleet Proximity Engine' },
    { id: 5, label: 'Response Plan', stageKey: 'T25_TRAFFIC_IMPACT', desc: 'Cross-Dept Directives' },
    { id: 6, label: 'Human Approval', stageKey: 'T30_OFFICER_APPROVAL', desc: 'Officer Sign-Off (HITL)' },
    { id: 7, label: 'Dispatch & Execution', stageKey: 'T40_RESPONSE_DEPLOYED', desc: 'Field Fleet Mobilization' }
  ]

  // Determine completion index based on demoStage
  const getStageIndex = (stage: DemoStage): number => {
    switch (stage) {
      case 'T00_NORMAL': return 0
      case 'T05_WEATHER_SIGNAL': return 1
      case 'T10_AI_NOWCAST': return 2
      case 'T15_WARD_RISK': return 3
      case 'T20_EARLY_WARNING': return 4
      case 'T25_TRAFFIC_IMPACT': return 5
      case 'T30_OFFICER_APPROVAL': return 6
      case 'T35_WATER_RISING': return 6
      case 'T40_RESPONSE_DEPLOYED': return 7
      case 'T50_DIGITAL_TWIN': return 7
      case 'T60_WATER_FALLING': return 7
      case 'T70_RISK_NORMALIZED': return 7
      default: return 4
    }
  }

  const currentStepIndex = getStageIndex(demoStage)

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-5 space-y-4 shadow-xl font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-sky-400" />
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            EMERGENCY RESPONSE WORKFLOW — 7-STAGE PIPELINE
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400">Timeline:</span>
          <span className="text-[10px] text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded font-bold">
            {simulationTime} ({demoStage})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {workflowSteps.map((st, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStepIndex
          const isActive = stepNum === currentStepIndex
          const isPending = stepNum > currentStepIndex

          return (
            <div 
              key={st.id} 
              className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                isCompleted 
                  ? 'border-emerald-900/60 bg-emerald-950/20' 
                  : isActive
                  ? 'border-amber-500 bg-amber-950/30 shadow-lg shadow-amber-950/40 animate-pulse'
                  : 'border-slate-850 bg-slate-950/40 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black rounded px-1.5 py-0.5 ${
                  isCompleted 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : isActive
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-black text-slate-500'
                }`}>
                  0{stepNum}
                </span>
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isActive && <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
              </div>

              <div>
                <h5 className="text-[11px] font-bold text-white leading-snug">{st.label}</h5>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">{st.desc}</p>
              </div>

              <div className="pt-1 border-t border-slate-900 text-[8.5px] uppercase font-bold">
                {isCompleted ? (
                  <span className="text-emerald-400">COMPLETE</span>
                ) : isActive ? (
                  <span className="text-amber-400 font-extrabold">ACTIVE NOW</span>
                ) : (
                  <span className="text-slate-500">PENDING</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
