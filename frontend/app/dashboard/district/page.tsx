'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageHeader from '../../../components/ui/PageHeader'
import StatCard from '../../../components/ui/StatCard'
import MetricBadge from '../../../components/ui/MetricBadge'
import { apiService, DashboardOverview } from '../../../services/api'
import { 
  Building, 
  CloudRain, 
  Cpu, 
  Waves, 
  Activity, 
  Shield, 
  ArrowRight, 
  MapPin, 
  Radio, 
  Sparkles, 
  CheckCircle2,
  Database,
  ExternalLink,
  Layers,
  Thermometer
} from 'lucide-react'

export default function DistrictDashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    apiService.getDashboardOverview()
      .then((res) => {
        if (isMounted) {
          setOverview(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.warn('District overview offline fallback', err)
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  return (
    <DashboardLayout userRole="officer">
      <div className="space-y-6">
        <PageHeader
          title="Visakhapatnam District Command Center"
          description="Integrated District Operations — Bridging Urban Real-Time IoT Flood Control with Rural Agricultural Anomaly Intelligence."
          breadcrumbs={[
            { label: 'Home', path: '/dashboard/city' },
            { label: 'Andhra Pradesh', path: '/dashboard/state' },
            { label: 'Visakhapatnam District' }
          ]}
        />

        {/* 1. District Top-Level KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="District Jurisdiction"
            value="Visakhapatnam"
            description="GVMC Urban + Rural Lowland Blocks"
            icon={<MapPin className="h-5 w-5 text-sky-400" />}
          />
          <StatCard
            title="Urban IoT Monitoring"
            value={overview?.digital_twin_nodes_count ? `${overview.digital_twin_nodes_count} Sensors` : "6 Gauges"}
            description="Beach Road Sensor Node ACTIVE (REAL_IOT)"
            icon={<Cpu className="h-5 w-5 text-emerald-400" />}
          />
          <StatCard
            title="Rural Hydrological Dataset"
            value="2,275 Records"
            description="NRSC VIC Hydrological Baseline"
            icon={<Database className="h-5 w-5 text-purple-400" />}
          />
          <StatCard
            title="Emergency Response Fleet"
            value={overview?.resources?.total ? `${overview.resources.total} Units` : "148 Active"}
            description="Police, Fire, Ambulances, Pumps"
            icon={<Shield className="h-5 w-5 text-blue-400" />}
          />
        </div>

        {/* 2. Primary Operational Gateways: Urban vs Rural */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* GATEWAY 1: URBAN FLOOD INTELLIGENCE */}
          <div className="glass-panel border-2 border-sky-500/30 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/50 transition-all bg-gradient-to-b from-sky-950/20 to-slate-950/80 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase font-mono">PRIMARY REAL-TIME SYSTEM</span>
                    <h3 className="text-lg font-black text-white">Urban Flood Intelligence</h3>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-mono flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>REAL IoT ONLINE</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Real-time stormwater drain monitoring, ESP32 + HC-SR04 ultrasonic physical telemetry, 
                GIS Digital Twin node network, and LangGraph multi-agent emergency response with human-in-the-loop safety gating.
              </p>

              {/* Urban Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-slate-300 truncate">Beach Road Gauge (REAL_IOT)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center space-x-2">
                  <Waves className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-slate-300 truncate">Storm Drain SCADA Nodes</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-slate-300 truncate">LangGraph AI Triage</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-slate-300 truncate">Human Approval Gate</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-slate-900/80 mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/city"
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
              >
                <span>Launch City Command</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/digital-twin"
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Open Digital Twin</span>
              </Link>
            </div>
          </div>

          {/* GATEWAY 2: RURAL FLOOD INTELLIGENCE */}
          <div className="glass-panel border-2 border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/50 transition-all bg-gradient-to-b from-purple-950/20 to-slate-950/80 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <CloudRain className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase font-mono">DATA-DRIVEN EXTENSION</span>
                    <h3 className="text-lg font-black text-white">Rural Flood Intelligence</h3>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2.5 py-1 rounded bg-purple-950/80 border border-purple-700 text-purple-300 font-mono">
                  HISTORICAL DATASET
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Hydrological baseline analytics powered by the National Remote Sensing Centre (NRSC) VIC model.
                Evaluates precipitation anomalies, computes dynamic statistical Z-scores and percentiles, and delivers Gemini crop advisories.
              </p>

              {/* Rural Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-slate-300 truncate">NRSC VIC Model (2,275 Rows)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-slate-300 truncate">Z-Score & Percentile Engine</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-slate-300 truncate">Gemini Agricultural Advisory</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="text-slate-300 truncate">3×3 Origami Field Simulator</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6 border-t border-slate-900/80 mt-6 flex">
              <Link
                href="/dashboard/rural"
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                <span>Launch Rural Intelligence</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* 3. District Situation & Weather Feeds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Coastal Weather Stream</h4>
              <span className="text-[9px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-900">OPEN DATA</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Temperature / Humidity:</span>
                <span className="font-mono font-bold text-white">29.4°C · 92% RH</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Precipitation (24h):</span>
                <span className="font-mono font-bold text-sky-400">78.4 mm (Monsoon Storm)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>IMD Advisory Status:</span>
                <span className="font-mono font-bold text-amber-400">Orange Watch (Coastal AP)</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Outflow River Gauges</h4>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">SCADA LINK</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Beach Road Storm Culvert:</span>
                <span className="font-mono font-bold text-emerald-400">4.18m (Warning: 4.0m)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>MVP Outfall Canal:</span>
                <span className="font-mono font-bold text-red-400">4.62m (Critical: 4.5m)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Gajuwaka Spillway:</span>
                <span className="font-mono font-bold text-slate-300">2.10m (Normal)</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">District Safety Gate</h4>
              <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900">SAFETY PROTOCOL</span>
            </div>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Autonomous AI dispatch is permanently prohibited. All resource movements require explicit sign-off from the Visakhapatnam District Operations Desk.
            </p>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/30 p-1.5 rounded border border-emerald-900/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Safety Gate Protocol Active</span>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
