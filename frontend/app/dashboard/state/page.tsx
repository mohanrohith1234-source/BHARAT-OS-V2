'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import ChartCard from '../../../components/ui/ChartCard'
import BarChart from '../../../components/ui/BarChart'
import MetricBadge from '../../../components/ui/MetricBadge'
import { andhraPradeshStateData } from '../../../lib/mock/states'
import { apDistrictsData } from '../../../lib/mock/districts'
import { 
  Building2, 
  MapPin, 
  Radio, 
  Shield, 
  Cpu, 
  CloudRain, 
  Waves, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react'
import { apiService, DashboardOverview } from '../../../services/api'

const STATES_LIST = [
  { id: 'ap', name: 'Andhra Pradesh (AP)', status: 'active', tag: 'ACTIVE LIVE PILOT' },
  { id: 'tg', name: 'Telangana', status: 'ready', tag: 'INTEGRATION READY' },
  { id: 'od', name: 'Odisha', status: 'ready', tag: 'INTEGRATION READY' },
  { id: 'tn', name: 'Tamil Nadu', status: 'ready', tag: 'INTEGRATION READY' },
  { id: 'ka', name: 'Karnataka', status: 'ready', tag: 'INTEGRATION READY' },
  { id: 'mh', name: 'Maharashtra', status: 'ready', tag: 'INTEGRATION READY' }
]

export default function StateDashboardPage() {
  const [selectedStateId, setSelectedStateId] = useState<string>('ap')
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [liveIncidentsCount, setLiveIncidentsCount] = useState<number>(0)
  const [liveHospitalsCount, setLiveHospitalsCount] = useState<number>(0)
  const [activeEmergencyTeams, setActiveEmergencyTeams] = useState<number>(andhraPradeshStateData.activeEmergencyTeams)

  useEffect(() => {
    let isMounted = true
    Promise.all([
      apiService.getDashboardOverview(),
      apiService.getFacilities({ facility_type: 'HOSPITAL' })
    ]).then(([overviewRes, facilitiesRes]) => {
      if (!isMounted) return
      setOverview(overviewRes)
      setLiveIncidentsCount(overviewRes.active_incidents_count)
      setLiveHospitalsCount(facilitiesRes.total)
      if (overviewRes.resources?.allocated !== undefined) {
        setActiveEmergencyTeams(overviewRes.resources.allocated)
      }
    }).catch(err => {
      console.warn("Offline state dashboard overview loading fallback", err)
    })
    return () => { isMounted = false }
  }, [])

  // Dynamic District Merge (Visakhapatnam District pulls real database coordinates and counts)
  const districts = apDistrictsData.map(d => {
    if (d.name === 'Visakhapatnam') {
      return {
        ...d,
        activeIncidents: liveIncidentsCount || d.activeIncidents,
        hospitalsCount: liveHospitalsCount || d.hospitalsCount
      }
    }
    return d
  })

  const chartData = districts.map(d => ({
    name: d.name,
    incidents: d.activeIncidents,
    hospitals: d.hospitalsCount
  }))

  const currentState = STATES_LIST.find(s => s.id === selectedStateId)

  return (
    <DashboardLayout userRole="dept_head">
      <div className="space-y-6">
        
        {/* 1. STATE SELECTOR BAR */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800 bg-[#060a13]/70">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">JURISDICTION</span>
              <span className="text-xs font-bold text-white">Select State Operations Center:</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {STATES_LIST.map((state) => {
              const isSelected = selectedStateId === state.id
              return (
                <button
                  key={state.id}
                  onClick={() => setSelectedStateId(state.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                      : 'bg-slate-950/60 border border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                  }`}
                >
                  <span>{state.name}</span>
                  {state.status === 'active' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ) : (
                    <span className="text-[8px] px-1 py-0.2 rounded bg-slate-900 text-slate-500 border border-slate-800">READY</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* If another state is selected that is integration-ready */}
        {selectedStateId !== 'ap' ? (
          <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center mx-auto text-indigo-400">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">
                {currentState?.tag}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">{currentState?.name} State Operations</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                State telemetry schema and spatial adapters are integration-ready. 
                Visakhapatnam District in Andhra Pradesh is currently the active operational pilot.
              </p>
            </div>
            <button
              onClick={() => setSelectedStateId('ap')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Switch to Andhra Pradesh (Active Pilot)
            </button>
          </div>
        ) : (
          /* ANDHRA PRADESH STATE COMMAND CENTER DASHBOARD */
          <div className="space-y-6">
            <PageHeader
              title="Andhra Pradesh State Command Center"
              description="State-wide emergency operations. Visakhapatnam District is the active live pilot with real IoT sensors & rural intelligence."
              breadcrumbs={[
                { label: 'Home', path: '/dashboard/city' },
                { label: 'National', path: '/dashboard/national' },
                { label: 'Andhra Pradesh' }
              ]}
            />

            {/* State KPI Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Districts Monitored"
                value="26 Districts"
                description="Visakhapatnam Live Pilot • 25 Integration Ready"
                icon={<Building2 className="h-5 w-5 text-indigo-400" />}
              />
              <StatCard
                title="Active State Alerts"
                value={overview?.active_alerts_count !== undefined ? `${overview.active_alerts_count} Active` : "4 Active"}
                description="Coastal Storm Surge & Inundation Warning"
                icon={<Waves className="h-5 w-5 text-red-400" />}
                glow={true}
              />
              <StatCard
                title="Emergency Resources"
                value={activeEmergencyTeams}
                description="Active field response units deployed"
                icon={<Shield className="h-5 w-5 text-emerald-400" />}
              />
              <StatCard
                title="Telemetry & AI Status"
                value="100% Operational"
                description="LangGraph Multi-Agent Cluster Online"
                icon={<Sparkles className="h-5 w-5 text-purple-400" />}
              />
            </div>

            {/* State River, Weather & Risk Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel rounded-xl p-4 space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Urban Flood Risk</span>
                  <MetricBadge value="High (Coastal)" type="high" />
                </div>
                <p className="text-xs text-slate-300">
                  Visakhapatnam GVMC drainage basin: high-tide sea backflow and storm culvert saturation.
                </p>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ESP32 Physical IoT Online</span>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-4 space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Rural Hydrological Risk</span>
                  <MetricBadge value="Moderate (Riverine)" type="medium" />
                </div>
                <p className="text-xs text-slate-300">
                  NRSC VIC hydrological model baseline indicates localized agricultural field waterlogging risk.
                </p>
                <div className="text-[10px] font-mono text-purple-400 flex items-center space-x-1 pt-1">
                  <Database className="w-3 h-3" />
                  <span>2,275 Clean Historical Observations</span>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-4 space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">River / Basin Status</span>
                  <MetricBadge value="Normal Flow" type="low" />
                </div>
                <p className="text-xs text-slate-300">
                  Godavari, Krishna, and Nagavali river basin gauges reporting stable discharge levels.
                </p>
                <div className="text-[10px] font-mono text-sky-400 flex items-center space-x-1 pt-1">
                  <CloudRain className="w-3 h-3" />
                  <span>Open-Meteo Synced</span>
                </div>
              </div>
            </div>

            {/* DISTRICT OPERATIONS SECTION */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">District Operations Directory</h3>
                  <p className="text-xs text-slate-400">Launch urban or rural flood intelligence for operational districts</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded border border-slate-900 self-start sm:self-auto">
                  ANDHRA PRADESH • 26 JURISDICTIONS
                </span>
              </div>

              {/* Visakhapatnam District Feature Card */}
              <div className="p-5 rounded-xl border-2 border-sky-500/40 bg-gradient-to-r from-sky-950/30 via-slate-950/60 to-purple-950/20 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-black text-white">Visakhapatnam District</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        ACTIVE LIVE PILOT
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Headquarters: Visakhapatnam • Complete Urban Real IoT & Rural Hydrological Intelligence Deployed
                    </p>
                  </div>

                  {/* Direct Launch Buttons for Visakhapatnam */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      href="/dashboard/city"
                      className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md shadow-sky-900/30"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Urban Flood</span>
                    </Link>
                    <Link
                      href="/dashboard/rural"
                      className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md shadow-purple-900/30"
                    >
                      <CloudRain className="w-3.5 h-3.5" />
                      <span>Rural Flood</span>
                    </Link>
                    <Link
                      href="/dashboard/district"
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5"
                    >
                      <span>View District</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Other Districts Table with Honest Provenance */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                    <tr>
                      <th className="py-2.5 px-3">District</th>
                      <th className="py-2.5 px-3">Headquarters</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Urban Module</th>
                      <th className="py-2.5 px-3">Rural Module</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {districts.map((d) => {
                      const isPilot = d.name === 'Visakhapatnam'
                      return (
                        <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-white">
                            {d.name}
                            {isPilot && (
                              <span className="text-[8px] text-emerald-400 ml-1.5 border border-emerald-800 px-1 py-0.2 rounded bg-emerald-950/30 font-mono">
                                LIVE PILOT
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{d.headquarters}</td>
                          <td className="py-2.5 px-3">
                            {isPilot ? (
                              <span className="text-[9px] font-mono font-bold text-emerald-400">OPERATIONAL</span>
                            ) : (
                              <span className="text-[9px] font-mono text-slate-500">INTEGRATION READY</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {isPilot ? (
                              <span className="text-[9px] font-mono text-sky-400 font-bold">PROTOTYPE_SIMULATION</span>
                            ) : (
                              <span className="text-[9px] font-mono text-slate-600">DATA PENDING</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {isPilot ? (
                              <span className="text-[9px] font-mono text-purple-400 font-bold">NRSC VIC BASELINE</span>
                            ) : (
                              <span className="text-[9px] font-mono text-slate-600">DATA PENDING</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isPilot ? (
                              <Link
                                href="/dashboard/district"
                                className="text-xs font-bold text-sky-400 hover:text-sky-300 font-mono"
                              >
                                Open Console →
                              </Link>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">Integration Ready</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Analytics Comparison Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="District Incidents vs Hospital Facilities" description="Active load across AP districts (Visakhapatnam live data vs coverage pending)">
                <BarChart
                  data={chartData}
                  xAxisKey="name"
                  series={[
                    { key: 'incidents', color: '#ef4444', name: 'Incidents' },
                    { key: 'hospitals', color: '#10b981', name: 'Hospitals' }
                  ]}
                />
              </ChartCard>

              <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div className="border-b border-slate-900 pb-3">
                  <h4 className="text-base font-bold text-white tracking-wide">State Flood Response Architecture</h4>
                  <p className="text-xs text-slate-400">Standard operating procedure for tiered disaster escalation</p>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex items-start space-x-3">
                    <span className="text-indigo-400 font-mono font-bold text-sm">01</span>
                    <div>
                      <span className="font-bold text-white block">District Telemetry Ingestion</span>
                      <p className="text-slate-400 text-[11px]">Real-time drainage gauges stream telemetry to district node clusters.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex items-start space-x-3">
                    <span className="text-purple-400 font-mono font-bold text-sm">02</span>
                    <div>
                      <span className="font-bold text-white block">State Resource Coordination</span>
                      <p className="text-slate-400 text-[11px]">State command monitors inter-district emergency unit availability.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex items-start space-x-3">
                    <span className="text-amber-400 font-mono font-bold text-sm">03</span>
                    <div>
                      <span className="font-bold text-white block">Human Command Approval Gate</span>
                      <p className="text-slate-400 text-[11px]">No automated deployment without authenticated officer authorization.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
