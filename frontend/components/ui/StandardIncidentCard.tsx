'use client'

import React, { useState } from 'react'
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Droplets, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Layers, 
  Database,
  Radio
} from 'lucide-react'
import { ProvenanceType } from '../../store/useVizagDataStore'

export interface StandardIncidentCardProps {
  id: string
  ticketNumber: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  location: string
  timestamp?: string
  status: 'active' | 'assigned' | 'in_progress' | 'resolved'
  waterDepthCm?: number
  peopleAtRisk?: number
  assignedUnits?: string[]
  aiRecommendation?: string
  confidence?: number
  humanSignOff?: boolean
  signedBy?: string
  provenance?: ProvenanceType
  technicalDetails?: {
    modelUsed?: string
    latencyMs?: number
    mcpToolsInvoked?: string[]
    langGraphNodes?: string[]
    rawTelemetrySnapshot?: Record<string, any>
  }
  onAuthorize?: () => void
}

export default function StandardIncidentCard({
  id,
  ticketNumber,
  category,
  severity,
  title,
  location,
  timestamp = 'Just now',
  status,
  waterDepthCm,
  peopleAtRisk,
  assignedUnits = [],
  aiRecommendation,
  confidence = 94,
  humanSignOff = false,
  signedBy,
  provenance = 'PROTOTYPE_SIMULATION',
  technicalDetails,
  onAuthorize
}: StandardIncidentCardProps) {
  const [techDetailsOpen, setTechDetailsOpen] = useState(false)

  // Severity color mappings
  const severityColors = {
    critical: {
      border: 'border-l-red-500 bg-red-950/10 hover:border-red-500/50',
      badge: 'bg-red-950/60 text-red-300 border-red-800/60',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.1)]'
    },
    high: {
      border: 'border-l-orange-500 bg-orange-950/10 hover:border-orange-500/50',
      badge: 'bg-orange-950/60 text-orange-300 border-orange-800/60',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.1)]'
    },
    medium: {
      border: 'border-l-amber-500 bg-amber-950/10 hover:border-amber-500/50',
      badge: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]'
    },
    low: {
      border: 'border-l-emerald-500 bg-emerald-950/10 hover:border-emerald-500/50',
      badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]'
    }
  }[severity]

  // Provenance tag styling
  const getProvenanceBadge = (type: ProvenanceType) => {
    switch (type) {
      case 'REAL_INGESTION':
        return 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 animate-pulse'
      case 'PROTOTYPE_SIMULATION':
        return 'bg-amber-950/60 border-amber-700/60 text-amber-300'
      case 'CACHED':
        return 'bg-slate-900 border-slate-800 text-slate-400'
      case 'REFERENCE':
        return 'bg-sky-950/60 border-sky-700/60 text-sky-300'
      default:
        return 'bg-slate-900 border-slate-800 text-slate-400'
    }
  }

  return (
    <div className={`glass-panel border-l-4 rounded-2xl p-5 flex flex-col space-y-4 transition-all duration-300 ${severityColors.border} ${severityColors.glow}`}>
      {/* 1. Situation Header & Status Badges */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-850/80 pb-3">
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
          <span className="text-xs font-black font-mono tracking-wider text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {ticketNumber}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {category}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md uppercase tracking-wider font-mono ${severityColors.badge}`}>
            {severity}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 border rounded uppercase tracking-wider ${getProvenanceBadge(provenance)}`}>
            {provenance}
          </span>
        </div>
      </div>

      {/* 2. Situation Title & Location */}
      <div className="space-y-1.5">
        <h4 className="text-base font-bold text-white tracking-tight leading-snug">
          {title}
        </h4>
        <div className="flex items-center space-x-4 text-xs text-slate-400 flex-wrap gap-y-1">
          <div className="flex items-center space-x-1 text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{timestamp}</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 py-1">
        {waterDepthCm !== undefined && (
          <div className="rounded-xl border border-slate-900 bg-[#050816]/70 p-2.5 flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-sky-950/60 border border-sky-800/40 text-sky-400">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Water Level</p>
              <p className="text-sm font-black font-mono text-white">{waterDepthCm} cm</p>
            </div>
          </div>
        )}

        {peopleAtRisk !== undefined && (
          <div className="rounded-xl border border-slate-900 bg-[#050816]/70 p-2.5 flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/40 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Population at Risk</p>
              <p className="text-sm font-black font-mono text-white">~{peopleAtRisk} Pax</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-900 bg-[#050816]/70 p-2.5 flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Assigned Units</p>
            <p className="text-xs font-bold font-mono text-cyan-300">
              {assignedUnits.length > 0 ? assignedUnits.join(', ') : 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Recommended Action & Human Sign-Off Gate */}
      {aiRecommendation && (
        <div className="rounded-xl border border-blue-900/40 bg-blue-950/15 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider font-mono">
                AI Operational Recommendation
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              {confidence}% Confidence
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            {aiRecommendation}
          </p>

          {/* Human-in-the-Loop Approval Action */}
          <div className="pt-1 flex items-center justify-between gap-3 border-t border-blue-900/30">
            {humanSignOff ? (
              <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Authorized by {signedBy || 'Duty Commander'}</span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-amber-400 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  Awaiting Operator Authorization
                </span>
                {onAuthorize && (
                  <button
                    onClick={onAuthorize}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center space-x-1.5 transition-all active:scale-95 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AUTHORIZE DISPATCH</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Collapsible Technical Details / AI Trace */}
      <div className="border-t border-slate-900 pt-2">
        <button
          onClick={() => setTechDetailsOpen(!techDetailsOpen)}
          className="flex items-center justify-between w-full text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors py-1"
        >
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Technical Details & AI Trace</span>
          </span>
          {techDetailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {techDetailsOpen && (
          <div className="mt-2.5 p-3 rounded-xl bg-[#030612] border border-slate-900 space-y-2.5 text-[11px] font-mono">
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              <div>
                <span className="text-slate-600 uppercase text-[9px] block">Inference Engine</span>
                <span className="text-slate-300 font-semibold">{technicalDetails?.modelUsed || 'Gemini 2.5 Flash + LangGraph'}</span>
              </div>
              <div>
                <span className="text-slate-600 uppercase text-[9px] block">Execution Latency</span>
                <span className="text-slate-300 font-semibold">{technicalDetails?.latencyMs || 142} ms</span>
              </div>
            </div>

            {technicalDetails?.langGraphNodes && (
              <div>
                <span className="text-slate-600 uppercase text-[9px] block mb-1">Graph Execution Path</span>
                <div className="flex flex-wrap gap-1.5">
                  {technicalDetails.langGraphNodes.map((node, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-purple-300">
                      {node}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-slate-600 uppercase text-[9px] block mb-0.5">Data Provenance Source</span>
              <p className="text-[10px] text-slate-400">
                Aggregated from GVMC Outfall Sensor #01 (ESP32 Live IoT), IMD Doppler Radar (Visakhapatnam), and AP State GIS Cadastral Layer.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
