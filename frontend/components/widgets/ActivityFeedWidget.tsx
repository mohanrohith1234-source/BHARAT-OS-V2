'use client'

import React, { useState } from 'react'
import { Activity, Clock, Shield, CheckCircle2, User, Bot, AlertTriangle, Filter } from 'lucide-react'
import { useVizagDataStore } from '../../store/useVizagDataStore'

interface AuditEvent {
  id: string
  time: string
  actor: string
  actorType: 'CITIZEN' | 'AI_ENGINE' | 'OFFICER' | 'FLEET'
  action: string
  result: string
  level: 'info' | 'warning' | 'critical' | 'success'
}

export default function ActivityFeedWidget() {
  const { simulationTime, incident, demoStage } = useVizagDataStore()
  const [filterType, setFilterType] = useState<'ALL' | 'OFFICER' | 'AI_ENGINE' | 'CITIZEN'>('ALL')

  // Dynamic audit trail combining simulated timeline history
  const auditLogs: AuditEvent[] = [
    ...(incident.humanSignOff ? [{
      id: 'AUD-007',
      time: simulationTime,
      actor: incident.signedBy || 'Duty Commander K. Sharma',
      actorType: 'OFFICER' as const,
      action: 'APPROVE_RESPONSE_PLAN',
      result: 'Directives authorized. DP-04, FT-12, P-305 mobilized.',
      level: 'success' as const
    }] : []),
    {
      id: 'AUD-006',
      time: 'T+25',
      actor: 'Coordination Agent',
      actorType: 'AI_ENGINE',
      action: 'CROSS_DEPARTMENT_PLAN_SYNTHESIS',
      result: '5-point multi-department operational plan constructed. HITL gate engaged.',
      level: 'info'
    },
    {
      id: 'AUD-005',
      time: 'T+20',
      actor: 'Resource Matching Agent',
      actorType: 'AI_ENGINE',
      action: 'PROXIMITY_FLEET_MATCHING',
      result: 'Matched AMB-042 (1.8km), FT-12 (2.4km), P-305 (1.2km), DP-04 (0km).',
      level: 'info'
    },
    {
      id: 'AUD-004',
      time: 'T+15',
      actor: 'Risk Engine',
      actorType: 'AI_ENGINE',
      action: 'HAZARD_SEVERITY_SCORING',
      result: 'Ward 12 Inundation score computed at 88/100 (CRITICAL).',
      level: 'warning'
    },
    {
      id: 'AUD-003',
      time: 'T+10',
      actor: 'Hydro Nowcast Engine',
      actorType: 'AI_ENGINE',
      action: 'NOWCAST_PROJECTION_GENERATED',
      result: 'Predicted water depth: 48cm at Sector 4 culvert in 30 mins.',
      level: 'warning'
    },
    {
      id: 'AUD-002',
      time: 'T+05',
      actor: 'Citizen SOS Beacon (R. Kameswari)',
      actorType: 'CITIZEN',
      action: 'EMERGENCY_SIGNAL_RECEIVED',
      result: 'GPS lock at Beach Road Sector 4 low-lying tenement.',
      level: 'critical'
    },
    {
      id: 'AUD-001',
      time: 'T+00',
      actor: 'IMD Doppler Radar Adapter',
      actorType: 'AI_ENGINE',
      action: 'WEATHER_ANOMALY_INGEST',
      result: '42mm/h convective marine rain cell tracking inland.',
      level: 'info'
    }
  ]

  const filteredLogs = filterType === 'ALL' 
    ? auditLogs 
    : auditLogs.filter(log => log.actorType === filterType)

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070B14] p-5 space-y-4 shadow-xl font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            OPERATIONAL AUDIT TRAIL & DECISION LEDGER
          </h4>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 text-[9.5px]">
          {(['ALL', 'OFFICER', 'AI_ENGINE', 'CITIZEN'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2 py-0.5 rounded transition-all ${
                filterType === f 
                  ? 'bg-slate-800 text-white font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {filteredLogs.map(log => (
          <div 
            key={log.id} 
            className="p-3 rounded-xl border border-slate-850 bg-slate-950/60 flex items-start justify-between gap-3 text-xs"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-400">[{log.time}]</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  log.actorType === 'OFFICER'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : log.actorType === 'AI_ENGINE'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'bg-red-950 text-red-300 border border-red-800'
                }`}>
                  {log.actorType}
                </span>
                <span className="font-bold text-white text-[11px] truncate">{log.actor}</span>
              </div>
              <p className="text-[10.5px] text-slate-300 font-sans">{log.result}</p>
            </div>

            <span className="text-[9px] font-mono text-slate-500 uppercase shrink-0 pt-0.5">
              {log.action}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
        <span>Immutable Simulation Ledger</span>
        <span className="text-emerald-400 font-bold">100% PROVENANCE VERIFIED</span>
      </div>
    </div>
  )
}
