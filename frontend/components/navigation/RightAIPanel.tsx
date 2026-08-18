'use client'

import React, { useState } from 'react'
import { Sparkles, ChevronRight, ChevronLeft, Shield, CheckCircle2, Lock, Cpu, Bot } from 'lucide-react'
import MetricBadge from '../ui/MetricBadge'

interface AgentStatusItem {
  name: string
  status: 'active' | 'idle' | 'success'
  confidence: number
  latencyMs: number
  task: string
  reasoning: string
  sopUsed: string
  toolCall: string
}

export default function RightAIPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string | null>('Coordinator Agent')

  const agents: AgentStatusItem[] = [
    { 
      name: 'Coordinator Agent', 
      status: 'active', 
      confidence: 95.4, 
      latencyMs: 18.2, 
      task: 'Orchestrating Gemini 2.5 Pro LangGraph pipeline',
      reasoning: 'Synthesizing input telemetry feeds from Weather and CWC River Gauge sensors.',
      sopUsed: 'NDMA Hydro-Meteorological Disaster protocol v2.4',
      toolCall: 'event_bus.publish()'
    },
    { 
      name: 'Citizen Agent', 
      status: 'success', 
      confidence: 96.0, 
      latencyMs: 12.4, 
      task: 'Categorized Beach Road waterlogging report',
      reasoning: 'NLP parsing extracted high severity from report: "Beach road is flooded to knee level."',
      sopUsed: 'Citizen Distress Categorization Guideline',
      toolCall: 'incident_repository.insert()'
    },
    { 
      name: 'Weather Agent', 
      status: 'success', 
      confidence: 92.0, 
      latencyMs: 15.1, 
      task: 'IMD Telemetry: 78mm monsoonal precipitation',
      reasoning: 'Precipitation exceeded local soil infiltration threshold of 25mm/hr.',
      sopUsed: 'IMD Coastal Warning System Guide',
      toolCall: 'get_weather()'
    },
    { 
      name: 'Traffic Agent', 
      status: 'success', 
      confidence: 91.0, 
      latencyMs: 14.8, 
      task: 'Calculated Inner Ring Road bypass detour',
      reasoning: 'Submersion depth at Beach Road MVP Sector 4 prevents safe sedan/SUV passage.',
      sopUsed: 'NHAI Urban Traffic Diversion Protocol',
      toolCall: 'calculate_route()'
    },
    { 
      name: 'Healthcare Agent', 
      status: 'success', 
      confidence: 95.0, 
      latencyMs: 11.2, 
      task: 'KGH Emergency Bed Capacity: 142 free (8 ICU)',
      reasoning: 'Visakhapatnam hospital occupancy indices check indicates optimal bed reserve levels.',
      sopUsed: 'Emergency Hospital Bed Pre-reservation SOP',
      toolCall: 'get_hospitals()'
    },
    { 
      name: 'Emergency Agent', 
      status: 'success', 
      confidence: 94.0, 
      latencyMs: 10.5, 
      task: 'Dewatering pump unit M-12 staged',
      reasoning: 'Command center dikes require active pumping to lower low-lying basin levels.',
      sopUsed: 'Municipal Dewatering Pump Deployment SOP v1',
      toolCall: 'get_fire()'
    },
    { 
      name: 'Police Agent', 
      status: 'success', 
      confidence: 93.5, 
      latencyMs: 9.8, 
      task: 'MVP Sector 4 traffic cordon deployed',
      reasoning: 'Securing the area to prevent heavy trucks entering flooded corridors.',
      sopUsed: 'Police Disaster Traffic Cordon Code 12',
      toolCall: 'get_police()'
    },
    { 
      name: 'Fire Agent', 
      status: 'success', 
      confidence: 96.2, 
      latencyMs: 8.9, 
      task: 'Beach Fire Station tenders on standby',
      reasoning: 'Prepared for hazardous chemical ignition or evacuation tasks.',
      sopUsed: 'Hazmat Fire Readiness Guide',
      toolCall: 'get_fire()'
    },
    { 
      name: 'Analytics Agent', 
      status: 'success', 
      confidence: 89.0, 
      latencyMs: 16.2, 
      task: '88% pattern match against July 2024 flood',
      reasoning: 'Comparing current precipitation rate and tide timeline with historical logs.',
      sopUsed: 'Disaster Trend Recurrence Analysis SOP',
      toolCall: 'search_knowledge_base()'
    },
    { 
      name: 'Infrastructure Agent', 
      status: 'success', 
      confidence: 92.1, 
      latencyMs: 13.0, 
      task: 'Culvert SCADA structural strain normal',
      reasoning: 'Vibrational sensors report load parameters within elastic safety limits.',
      sopUsed: 'GVMC Bridge Structural Safety Manual',
      toolCall: 'get_sensor_data()'
    },
    { 
      name: 'Water Resources Agent', 
      status: 'success', 
      confidence: 94.5, 
      latencyMs: 14.1, 
      task: 'CWC River Gauge: Ward 12 depth 4.18m',
      reasoning: 'Storm drain outflow basin indicates elevated high-tide sea backflow.',
      sopUsed: 'CWC Estuary Sluice Gate Operations Code',
      toolCall: 'get_sensor_data()'
    },
    { 
      name: 'Power Grid Agent', 
      status: 'success', 
      confidence: 97.0, 
      latencyMs: 11.8, 
      task: 'Isolated submerged light pole line L-12',
      reasoning: 'Preventing electrical conduction risk in standing pool water.',
      sopUsed: 'APTRANSCO Electrical Emergency Isolation SOP',
      toolCall: 'get_sensor_data()'
    },
    { 
      name: 'Cyber Security Agent', 
      status: 'success', 
      confidence: 99.1, 
      latencyMs: 6.4, 
      task: 'SCADA TLS 1.3 encrypted tunnel active',
      reasoning: 'Enforcing cryptographic security across municipal SCADA gateways.',
      sopUsed: 'National Critical SCADA Cyber Security Policy',
      toolCall: 'get_sensor_data()'
    }
  ]

  const activeAgent = agents.find(a => a.name === selectedAgent)

  return (
    <aside
      className={`bg-[#0b0f19]/95 border-l border-slate-800/80 flex flex-col justify-between transition-all duration-300 relative z-[30] backdrop-blur-xl shadow-2xl shrink-0 h-full ${
        collapsed ? 'w-14' : 'w-80 xl:w-92'
      }`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h3 className="text-xs font-extrabold text-white tracking-wider uppercase font-mono truncate">AI Advisory Engine</h3>
              <p className="text-[10px] text-purple-400 font-mono truncate">LangGraph • AI-DERIVED</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand AI Panel" : "Collapse AI Panel"}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-[#050816] text-slate-400 hover:text-white transition-all shrink-0 cursor-pointer"
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {collapsed ? (
        /* Collapsed Vertical Quick Strip */
        <div className="flex-1 flex flex-col items-center py-4 space-y-4">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-400 hover:text-white transition-all"
            title="Expand Multi-Agent Cluster"
          >
            <Bot className="w-4 h-4" />
          </button>
          <div className="writing-mode-vertical text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest rotate-180 select-none">
            AI DECISION SUPPORT
          </div>
        </div>
      ) : (
        /* Expanded Full Agent Telemetry Panel */
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
          
          {/* Mandatory Human Approval Banner */}
          <div className="rounded-xl border border-amber-800/50 bg-amber-950/30 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px] font-mono flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5" />
                <span>SAFETY PROTOCOL</span>
              </span>
              <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-700 text-amber-300">
                HUMAN-IN-THE-LOOP
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-300 flex items-center justify-between pt-1 border-t border-amber-900/30">
              <span className="text-purple-300">AI RECOMMENDS</span>
              <span className="text-slate-500">➔</span>
              <span className="text-amber-300">HUMAN APPROVES</span>
              <span className="text-slate-500">➔</span>
              <span className="text-emerald-400">DISPATCH</span>
            </div>
            <p className="text-[10px] text-amber-200/70 leading-normal">
              Autonomous dispatch is blocked. Operator sign-off is mandatory.
            </p>
          </div>

          {/* Active Agent Cluster Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                Active Agents ({agents.length})
              </h4>
              <span className="text-[9px] font-mono text-purple-400">Gemini 2.5 Pro</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {agents.map((ag) => (
                <button
                  key={ag.name}
                  onClick={() => setSelectedAgent(ag.name)}
                  className={`px-2 py-1.5 rounded-lg border text-left truncate transition-all flex items-center min-w-0 ${
                    selectedAgent === ag.name
                      ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-sm'
                      : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="truncate w-full block font-semibold">{ag.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Agent Detailed Reasoning Card */}
          {activeAgent && (
            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/15 space-y-2.5">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                <h5 className="text-xs font-bold text-white truncate max-w-[170px]">{activeAgent.name}</h5>
                <span className="text-[9px] font-mono text-purple-400 font-bold bg-purple-950 border border-purple-900/40 px-1.5 py-0.5 rounded shrink-0">
                  {activeAgent.confidence}% Conf
                </span>
              </div>

              <div className="space-y-2.5 text-[11px] leading-relaxed">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block font-mono">Assigned Task</span>
                  <p className="text-slate-300 font-mono text-[10.5px] leading-normal">{activeAgent.task}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block font-mono">Explainable Reasoning</span>
                  <p className="text-slate-300 text-[10.5px] leading-normal">{activeAgent.reasoning}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block font-mono">Government SOP Reference</span>
                  <p className="text-emerald-400 font-mono text-[10px] leading-normal">{activeAgent.sopUsed}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block font-mono">Tool / Execution Hook</span>
                  <code className="text-sky-400 font-mono text-[9.5px] block bg-slate-950 p-1.5 rounded border border-slate-900 break-all">{activeAgent.toolCall}</code>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </aside>
  )
}
