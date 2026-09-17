'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Shield, 
  Flame, 
  HeartPulse, 
  Activity, 
  CloudRain, 
  Database, 
  Map, 
  Cpu, 
  Building, 
  Network, 
  ArrowRight, 
  Lock, 
  User, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Radio, 
  FileText, 
  ExternalLink, 
  Check, 
  Building2, 
  AlertTriangle, 
  Compass, 
  Sparkles, 
  Waves, 
  Truck, 
  Car, 
  Navigation, 
  PhoneCall, 
  Sliders, 
  MapPin, 
  AlertCircle, 
  Clock, 
  Wheat, 
  Bell, 
  BookOpen, 
  HelpCircle, 
  CheckSquare 
} from 'lucide-react'

import BrandLogo from '../components/ui/BrandLogo'
import IndiaDigitalTwin from '../components/landing/IndiaDigitalTwin'
import LiveMapLayers from '../components/landing/LiveMapLayers'

export default function HomeLandingPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>('flood')
  const [hitlDecision, setHitlDecision] = useState<'pending' | 'approved' | 'modified' | 'rejected'>('pending')

  const scenarios = [
    {
      id: 'flood',
      title: 'Urban Flood Response',
      badge: 'PRIMARY SIH DEMONSTRATION',
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50',
      inputs: 'Open-Meteo Weather + Connected IoT Gauge + Flood AI + Simulated Traffic Cameras',
      outputs: 'Inundation forecast, storm culvert breach alert, emergency pump allocation, AI-recommended green corridor',
      actionUrl: '/dashboard/city?scenario=flood',
      actionText: 'RUN VIZAG FLOOD SCENARIO'
    },
    {
      id: 'rural',
      title: 'Rural Flood & Evacuation',
      badge: 'HYDROLOGICAL & AGRI',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50',
      inputs: 'Precipitation Telemetry + NRSC VIC Historical Hydrology Baseline + Agricultural Risk Model',
      outputs: 'Village inundation index, crop waterlogging damage projection, safe-exit evacuation paths, multilingual alerts',
      actionUrl: '/dashboard/rural',
      actionText: 'EXPLORE RURAL MODEL'
    },
    {
      id: 'fire',
      title: 'Fire & Hazmat Response',
      badge: 'EMERGENCY SERVICES',
      badgeColor: 'text-red-400 bg-red-950/60 border-red-800/50',
      inputs: 'Thermal Sensor / Incident Call + Fire Intelligence + Hydrant Geospatial Mesh + Traffic',
      outputs: 'Hydrant proximity routing, hazmat vapor isolation perimeter, burn-unit hospital staging, evacuation corridor',
      actionUrl: '/dashboard/city?scenario=fire',
      actionText: 'VIEW FIRE DISPATCH'
    },
    {
      id: 'medical',
      title: 'Medical Emergency & Surge',
      badge: 'PUBLIC HEALTH',
      badgeColor: 'text-teal-400 bg-teal-950/60 border-teal-800/50',
      inputs: 'ERSS 112 SOS / Citizen Beacon + 108 Ambulance Fleet GPS + Hospital Bed Reserves',
      outputs: 'Fastest transit corridor, King George Hospital ICU reserve lock, paramedic route dispatch',
      actionUrl: '/dashboard/healthcare',
      actionText: 'VIEW HEALTHCARE GRID'
    },
    {
      id: 'traffic',
      title: 'Traffic Emergency & Diversion',
      badge: 'MOBILITY INTELLIGENCE',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/50',
      inputs: 'Simulated CCTV Feed + Vehicle Detection AI + Intersection Signal Telemetry',
      outputs: 'Congestion heatmap, simulated green-wave signal operation, AI-recommended green corridor',
      actionUrl: '/dashboard/digital-twin',
      actionText: 'VIEW TRAFFIC MESH'
    }
  ]

  const activeScenarioData = scenarios.find(s => s.id === selectedScenario) || scenarios[0]

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans relative overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
      
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-sky-500/5 rounded-full filter blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-10 w-[450px] h-[450px] bg-cyan-500/3 rounded-full filter blur-[100px] pointer-events-none z-0" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.12)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900/80 bg-[#030712]/90 backdrop-blur-xl select-none">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
          
          {/* Left Branding */}
          <div className="flex items-center space-x-3">
            <BrandLogo size="md" />
            <span className="hidden sm:inline-block text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
              PROTOTYPE • SIMULATION MODE
            </span>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-[11px] font-semibold tracking-[0.12em] text-slate-400 font-mono antialiased">
            <Link href="/" className="text-sky-400 border-b-2 border-sky-500 pb-1 px-0.5">HOME</Link>
            <Link href="/dashboard/district" className="hover:text-white transition-colors py-1">COMMAND CENTER</Link>
            <Link href="/dashboard/digital-twin" className="hover:text-white transition-colors py-1">DIGITAL TWIN</Link>
            <Link href="/dashboard/ai-ops" className="hover:text-white transition-colors py-1">AI OPERATIONS</Link>
            <Link href="/citizen" className="hover:text-white transition-colors py-1">CITIZEN PORTAL</Link>
            <Link href="/dashboard/administration" className="hover:text-white transition-colors py-1">DATA ADAPTERS</Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            <Link 
              href="/dashboard/district" 
              className="hidden sm:inline-flex items-center justify-center space-x-1.5 px-3.5 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-bold font-mono transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>COMMAND DECK</span>
            </Link>

            <Link 
              href="/citizen" 
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 h-9 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold font-mono shadow-[0_2px_10px_rgba(14,165,233,0.3)] transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>CITIZEN PORTAL</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-24 relative z-10">

        {/* ========================================================================= */}
        {/* SECTION 1 — HERO & ARCHITECTURAL SCOPE */}
        {/* ========================================================================= */}
        <section id="national-network" className="space-y-6 scroll-mt-24">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
            
            {/* LEFT PANEL: BharatOS Positioning & Dual Entry CTA */}
            <div className="lg:col-span-4 flex flex-col justify-start space-y-5 min-w-0">
              
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold tracking-wider font-mono uppercase w-fit">
                <Shield className="w-3 h-3" />
                <span>PROTOTYPE • SIMULATION MODE</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl xl:text-[2.5rem] font-black tracking-tight leading-[1.12] text-white">
                  BHARATOS<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">
                    AI-POWERED EMERGENCY OPERATIONS & COORDINATION
                  </span>
                </h1>
                <p className="text-xs sm:text-sm font-bold font-mono text-cyan-400 tracking-wider">
                  Predict locally. Warn early. Prepare intelligently. Respond effectively.
                </p>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal">
                From emergency signals to coordinated response — BharatOS helps command centers understand incidents, coordinate departments, allocate resources, and execute response plans with human-in-the-loop oversight.
              </p>

              {/* Core Feature Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Citizen Signal Triage</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Multi-Agent Planning</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Resource Matching</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Officer Sign-Off (HITL)</span>
                </div>
              </div>

              {/* Access Portal Dual Entry CTA Block */}
              <div className="pt-2 space-y-3 w-full">
                <div className="flex items-center space-x-2 text-[9.5px] font-mono uppercase tracking-widest text-slate-400 font-bold select-none">
                  <span className="text-sky-400">PROTOTYPE ACCESS CONTROLS</span>
                  <div className="h-px flex-1 bg-slate-800" />
                </div>

                <div className="grid grid-cols-1 gap-2.5 w-full">
                  {/* PRIMARY CTA: OPEN COMMAND CENTER */}
                  <Link
                    href="/dashboard/district"
                    className="w-full group flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/60 via-blue-950/40 to-slate-900/90 border border-sky-500/40 hover:border-sky-400 text-left shadow-lg hover:shadow-sky-900/30 transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 text-lg shrink-0">
                        🏛
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs sm:text-[13px] font-black tracking-wide text-white font-mono uppercase truncate">
                          OPEN COMMAND CENTER
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          Incident Command • Resource Matching • Multi-Agency Dispatch
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 group-hover:bg-sky-500/25 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 ml-2 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* SECONDARY CTA: RUN VISAKHAPATNAM SIMULATION */}
                  <Link
                    href="/dashboard/district?action=simulate"
                    className="w-full group flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900/80 to-slate-900/90 border border-purple-500/40 hover:border-purple-400 text-left shadow-lg hover:shadow-purple-900/30 transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg shrink-0">
                        ⚡
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs sm:text-[13px] font-black tracking-wide text-white font-mono uppercase truncate">
                          RUN VISAKHAPATNAM SIMULATION
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          Launch Vizag Urban Flood Scenario & Decision Flow
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/25 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 ml-2 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* CITIZEN PORTAL BUTTON */}
                  <Link
                    href="/citizen"
                    className="w-full group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <User className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="text-[11px] font-mono font-bold text-slate-300 group-hover:text-white uppercase">
                        CITIZEN SAFETY LAYER (SOS & REPORT)
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-1 pt-1 select-none">
                  <Link href="/login" className="hover:text-sky-400 transition-colors flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Demo Officer Login</span>
                  </Link>
                  <Link href="/citizen/sos" className="text-red-400 hover:text-red-300 font-bold transition-colors flex items-center space-x-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Emergency 1-Tap SOS</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* CENTER PANEL: UNCLIPPED COMPLETE INDIA MAP */}
            <div className="lg:col-span-5 flex flex-col space-y-3 min-w-0 w-full">
              <IndiaDigitalTwin />
              
              {/* Architecture Facts Strip */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-950/80 backdrop-blur-md text-[9px] font-mono text-slate-300">
                <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> 28 States Mesh</span>
                <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> 8 UT Geometries</span>
                <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> 5-Tier Command Stack</span>
                <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-purple-400" /> Multi-Agent AI</span>
              </div>
            </div>

            {/* RIGHT PANEL: NATIONAL GIS LAYERS & OPS FEED */}
            <div className="lg:col-span-3 flex flex-col min-w-0 w-full">
              <LiveMapLayers />
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2 — HOW BHARATOS WORKS (9-STEP OPERATIONAL CHAIN) */}
        {/* ========================================================================= */}
        <section id="workflow" className="space-y-8 border-t border-slate-900/80 pt-16 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              HOW BHARATOS WORKS
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              The complete operational pipeline from initial signal ingestion to verified incident resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 font-mono">
            {[
              { step: '01', title: 'SIGNALS', desc: 'IoT, Weather, CCTV & Citizen SOS', color: 'text-cyan-400 border-cyan-800' },
              { step: '02', title: 'DETECTION', desc: 'Threshold breach & anomaly trigger', color: 'text-sky-400 border-sky-800' },
              { step: '03', title: 'INTELLIGENCE', desc: 'Spatial-temporal evidence graph', color: 'text-blue-400 border-blue-800' },
              { step: '04', title: 'RISK & IMPACT', desc: 'Population & road exposure index', color: 'text-indigo-400 border-indigo-800' },
              { step: '05', title: 'AI RECOMMEND', desc: 'Resource & green corridor plan', color: 'text-purple-400 border-purple-800' },
              { step: '06', title: 'HUMAN APPROVAL', desc: 'Officer sign-off (APPROVE/REJECT)', color: 'text-amber-400 border-amber-800' },
              { step: '07', title: 'RESPONSE', desc: 'Multi-department fleet dispatch', color: 'text-emerald-400 border-emerald-800' },
              { step: '08', title: 'MONITOR', desc: 'Telemetry change & reassessment', color: 'text-teal-400 border-teal-800' },
              { step: '09', title: 'RESOLVE', desc: 'Incident closed & audit recorded', color: 'text-slate-300 border-slate-700' }
            ].map((item) => (
              <div key={item.step} className={`p-3 rounded-xl border bg-[#0B0F19]/80 space-y-1 text-center flex flex-col justify-between ${item.color}`}>
                <div>
                  <span className="text-[9px] font-bold block opacity-75">STEP {item.step}</span>
                  <h4 className="text-xs font-black text-white uppercase mt-0.5">{item.title}</h4>
                </div>
                <p className="text-[9.5px] text-slate-400 leading-tight mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3 — VISAKHAPATNAM WORKING DEMONSTRATION */}
        {/* ========================================================================= */}
        <section id="vizag-proof" className="space-y-8 border-t border-slate-900/80 pt-16 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono uppercase">
              <MapPin className="w-3 h-3" />
              <span>WORKING PROTOTYPE • VISAKHAPATNAM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              VISAKHAPATNAM — WORKING DEMONSTRATION
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Weather + IoT + Traffic + AI Decision Pipeline + Digital Twin
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
              A working Visakhapatnam prototype demonstrates how live data, simulated IoT, traffic intelligence, AI reasoning and operational workflows can work together in a unified emergency command environment.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { title: 'Flood Intelligence', desc: 'Beach Road storm drain telemetry & culvert outfalls', icon: Waves, badge: 'CONNECTED SENSOR' },
              { title: 'Weather Intelligence', desc: 'Live Open-Meteo precipitation & storm tracking', icon: CloudRain, badge: 'LIVE API' },
              { title: 'Traffic Intelligence', desc: 'Simulated CCTV vehicle counts & congestion prediction', icon: Car, badge: 'PROTOTYPE SIMULATION' },
              { title: 'IoT Monitoring', desc: 'ESP32 + ultrasonic water-level sensor telemetry', icon: Activity, badge: 'CONNECTED SENSOR' },
              { title: 'Emergency Response', desc: 'Ambulance, Fire tender, and Police cordon dispatch', icon: Truck, badge: 'HUMAN APPROVAL' },
              { title: 'Digital Twin', desc: '2D/3D spatial map of GVMC wards, facilities & assets', icon: Map, badge: 'REFERENCE GIS' }
            ].map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="p-4 rounded-2xl border border-slate-800/80 bg-[#0B0F19]/60 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Icon className="w-5 h-5 text-cyan-400" />
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-bold">
                        {card.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold font-mono text-white uppercase">{card.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-snug">{card.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Vizag Action Callouts */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard/city?scenario=flood"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-mono shadow-lg transition-all"
            >
              <Waves className="w-4 h-4" />
              <span>RUN VIZAG FLOOD RESPONSE</span>
            </Link>
            <Link
              href="/dashboard/city"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold font-mono transition-all"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>OPEN VIZAG COMMAND CENTER</span>
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4 — AI COMMAND LAYER */}
        {/* ========================================================================= */}
        <section id="ai-layer" className="space-y-8 border-t border-slate-900/80 pt-16 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold font-mono uppercase">
              <Cpu className="w-3 h-3" />
              <span>SPECIALIST AGENTS ➔ COORDINATOR ➔ OPERATIONAL RECOMMENDATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI COMMAND LAYER
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Specialized domain capability agents orchestrating decision support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Flood Intelligence', desc: 'Detects water-level changes, culvert backflow, and predicts flood inundation risk.', icon: Waves, color: 'text-cyan-400' },
              { name: 'Weather Intelligence', desc: 'Analyzes real-time Open-Meteo precipitation, storm trajectory, and cloud cover.', icon: CloudRain, color: 'text-blue-400' },
              { name: 'Traffic Intelligence', desc: 'Analyzes vehicle detection, queue density, congestion hotspots, and road impact.', icon: Car, color: 'text-amber-400' },
              { name: 'Fire & Rescue Intelligence', desc: 'Evaluates structural hazard parameters, hydrant proximity, and rescue staging.', icon: Flame, color: 'text-red-400' },
              { name: 'Healthcare Intelligence', desc: 'Coordinates hospital surge capacity, ICU bed reserves, and ambulance handoffs.', icon: HeartPulse, color: 'text-emerald-400' },
              { name: 'Routing Intelligence', desc: 'Calculates emergency response corridors, obstacle bypasses, and evacuation paths.', icon: Navigation, color: 'text-purple-400' },
              { name: 'Coordinator Agent', desc: 'Combines specialist agent intelligence into a unified emergency response recommendation.', icon: Sparkles, color: 'text-pink-400' }
            ].map((agent) => {
              const Icon = agent.icon
              return (
                <div key={agent.name} className="p-4 rounded-xl border border-slate-800/80 bg-[#0B0F19]/70 space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${agent.color}`} />
                    <h4 className="text-xs font-bold font-mono text-white uppercase">{agent.name}</h4>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-snug">{agent.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5 — HUMAN-IN-THE-LOOP SAFETY GATE */}
        {/* ========================================================================= */}
        <section id="human-in-the-loop" className="space-y-8 border-t border-slate-900/80 pt-16 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold font-mono uppercase">
              <Shield className="w-3 h-3" />
              <span>NON-BYPASSABLE OPERATIONAL GOVERNANCE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              HUMAN-IN-THE-LOOP SAFETY GATE
            </h2>
            <p className="text-base sm:text-lg font-bold font-mono text-amber-400">
              AI recommends. Human approves. BharatOS executes.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Autonomous dispatch is strictly prohibited in BharatOS. Multi-agent AI performs high-speed synthesis and risk calculation, but the authority to deploy personnel, redirect traffic, and commit emergency resources remains exclusively with the human commander.
            </p>
          </div>

          {/* Interactive Recommendation Simulation Card */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-amber-800/40 bg-[#0c0f1d] p-6 lg:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 font-bold">
                    CRITICAL ALERT INC-2026-8942
                  </span>
                  <span className="text-xs font-mono text-slate-400">Ward 12 • Sector 4 Beach Road Culvert</span>
                </div>
                <h3 className="text-base font-bold text-white">Culvert Surcharge & Impassable Corridor</h3>
              </div>
              <div className="flex items-center space-x-2 font-mono text-[10px]">
                <span className="text-slate-400">AI Confidence:</span>
                <span className="text-cyan-400 font-bold">96.4%</span>
              </div>
            </div>

            {/* Assessment Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[9px] font-mono text-slate-500 uppercase">FLOOD SEVERITY</span>
                <div className="text-sm font-bold text-red-400 font-mono">HIGH (Depth 48cm)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[9px] font-mono text-slate-500 uppercase">TRAFFIC IMPACT</span>
                <div className="text-sm font-bold text-amber-400 font-mono">HIGH CONGESTION</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[9px] font-mono text-slate-500 uppercase">EMERGENCY CORRIDOR</span>
                <div className="text-sm font-bold text-red-400 font-mono">AMBULANCE BLOCKED</div>
              </div>
            </div>

            {/* AI Proposed Actions */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold font-mono text-slate-300 uppercase">AI RECOMMENDED ACTION PLAN:</h4>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">1.</span>
                  <span>Divert westbound traffic onto MVP Double Road via AI-recommended green corridor.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">2.</span>
                  <span>Dispatch High-Volume Dewatering Pump DP-04 to sector 4 outfall.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">3.</span>
                  <span>Reserve emergency corridor for 108 Ambulances heading to King George Hospital.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">4.</span>
                  <span>Broadcast localized evacuation warning in Telugu and English to Ward 12 citizens.</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-mono text-slate-400">
                Operator Action Status: <span className={`font-bold ${hitlDecision === 'approved' ? 'text-emerald-400' : hitlDecision === 'rejected' ? 'text-red-400' : 'text-amber-400'}`}>{hitlDecision.toUpperCase()}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setHitlDecision('rejected')}
                  className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 font-mono text-xs font-bold transition-all"
                >
                  ✕ REJECT
                </button>
                <button
                  onClick={() => setHitlDecision('modified')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition-all"
                >
                  ✎ MODIFY
                </button>
                <button
                  onClick={() => setHitlDecision('approved')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg transition-all"
                >
                  ✓ APPROVE & DISPATCH
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6 — SPATIAL TWIN & MULTI-DEPARTMENT RESPONSE */}
        {/* ========================================================================= */}
        <section id="digital-twin" className="space-y-8 border-t border-slate-900/80 pt-16 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold font-mono uppercase">
              <Map className="w-3 h-3" />
              <span>SPATIAL MUNICIPAL TWIN & COORDINATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              MULTI-DEPARTMENT RESPONSE
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Coordinate the departments and resources required for each incident.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="p-6 rounded-2xl border border-slate-800 bg-[#0B0F19]/80 space-y-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                REFERENCE GIS & INFRASTRUCTURE
              </span>
              <h4 className="text-base font-bold text-white">Physical Topography</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rendered with reference OpenStreetMap geometries for Visakhapatnam, mapping King George Hospital, Care Hospital, Fire HQ, Police Stations, and Beach Road culvert sluice gates.
              </p>
              <div className="text-[10px] font-mono text-slate-400 space-y-1">
                <div>• Reference GVMC municipal boundaries</div>
                <div>• Healthcare & emergency facilities</div>
                <div>• Beach Road culvert sensor location</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-[#0B0F19]/80 space-y-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400 font-bold">
                PROTOTYPE SIMULATION FEEDS
              </span>
              <h4 className="text-base font-bold text-white">Controlled Telemetry</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Emergency vehicle patrol vectors, traffic camera vehicle density heatmaps, and secondary drainage node water depths run on synchronized simulation algorithms.
              </p>
              <div className="text-[10px] font-mono text-slate-400 space-y-1">
                <div>• Dynamic GPS patrol simulation</div>
                <div>• Intersection camera density maps</div>
                <div>• Sluice gate backflow vectors</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-cyan-800/60 bg-gradient-to-br from-[#051128] to-[#040815] space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
                  INTERACTIVE PLATFORM
                </span>
                <h4 className="text-base font-bold text-white">Launch Spatial Cockpit</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Open the full 2D/3D spatial map view with live node popups, resource allocation drawers, and timeline playback.
                </p>
              </div>

              <Link
                href="/dashboard/digital-twin"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-lg"
              >
                <span>OPEN DIGITAL TWIN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7 — DATA & PROVENANCE */}
        {/* ========================================================================= */}
        <section id="data-layer" className="space-y-8 border-t border-slate-900/80 pt-16 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              DATA & PROVENANCE LAYER
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Transparent separation between live public feeds, reference data, and prototype simulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: LIVE / CONNECTED INPUTS */}
            <div className="p-5 rounded-2xl border border-emerald-900/50 bg-[#05111b] space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">[ LIVE / CONNECTED INPUTS ]</h3>
              </div>
              <p className="text-[11px] text-slate-400">Connected external public and hardware feeds:</p>
              <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Open-Meteo Global Weather Telemetry</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Central CPCB Air Quality Index (AQI)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>OpenStreetMap Dynamic Overpass API</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Connected ESP32 IoT Water Level Gauge</span>
                </li>
              </ul>
            </div>

            {/* Column 2: REFERENCE DATA */}
            <div className="p-5 rounded-2xl border border-cyan-900/50 bg-[#051124] space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">[ REFERENCE DATA ]</h3>
              </div>
              <p className="text-[11px] text-slate-400">Authentic reference geographic and facility baselines:</p>
              <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Visakhapatnam Ward & Road Geometries</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Reference Hospitals (KGH, Care, Apollo)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Police Stations & Fire Station Locations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>NRSC VIC Hydrological Historical Records</span>
                </li>
              </ul>
            </div>

            {/* Column 3: PROTOTYPE SIMULATION */}
            <div className="p-5 rounded-2xl border border-amber-900/50 bg-[#160f08] space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <h3 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">[ PROTOTYPE SIMULATION ]</h3>
              </div>
              <p className="text-[11px] text-slate-400">Controlled demonstration scenarios and mock vectors:</p>
              <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Simulated CCTV Traffic Computer Vision</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Emergency Vehicle GPS & Patrol Vectors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Drainage Sluice Gate Actuator Simulation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Simulated Resource Pool Availability</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8 — SCENARIO PLAYBOOK SIMULATOR */}
        {/* ========================================================================= */}
        <section id="simulator" className="space-y-8 border-t border-slate-900/80 pt-16 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              SCENARIO PLAYBOOK SIMULATOR
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Simulate operational response flows across 5 primary disaster playbooks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-2.5 transition-all ${
                  selectedScenario === sc.id
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'border-slate-850 bg-[#080d19] hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border font-bold uppercase ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  <h4 className="text-xs font-bold font-mono text-white">{sc.title}</h4>
                </div>
                <div className="text-[9px] font-mono text-slate-500">Click to load playbook</div>
              </button>
            ))}
          </div>

          {/* Active Scenario Details Box */}
          <div className="rounded-2xl border border-slate-800 bg-[#070d1a] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-850 pb-3">
              <div>
                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">ACTIVE PLAYBOOK SPECIFICATION</span>
                <h3 className="text-sm sm:text-base font-bold font-mono text-white">{activeScenarioData.title}</h3>
              </div>
              <Link
                href={activeScenarioData.actionUrl}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md"
              >
                <span>{activeScenarioData.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase">PRIMARY INPUT FEEDS</span>
                <p className="text-slate-200">{activeScenarioData.inputs}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase">OPERATIONAL OUTPUTS</span>
                <p className="text-slate-200">{activeScenarioData.outputs}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9 — RURAL INTELLIGENCE (EXTENDED CAPABILITY) */}
        {/* ========================================================================= */}
        <section id="rural-flood" className="space-y-8 border-t border-slate-900/80 pt-16 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono uppercase">
              <Wheat className="w-3 h-3" />
              <span>EXTENDED DISASTER RESILIENCE CAPABILITY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              RURAL FLOOD INTELLIGENCE & EVACUATION
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Extending disaster resilience to rural agricultural basins through data-driven historical baseline modeling.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#070e1a] p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800 text-purple-300 text-[10px] font-mono font-bold">
                  <span>HISTORICAL DATASET — NRSC VIC MODEL</span>
                </div>
                <h3 className="text-lg font-bold text-white">Data-Derived Agricultural Risk Analysis</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Rural Visakhapatnam is modeled using 2,275 verified observations from the NRSC VIC hydrological model. The system dynamically computes Z-score precipitation anomalies, percentile risk breaches ($P_{75}, P_{90}, P_{99}$), and crop-specific waterlogging advisories for Paddy, Maize, and Sugarcane.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-emerald-900/40 bg-emerald-950/10 space-y-3">
                <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase">RURAL FLOOD RESPONSE FLOW</h4>
                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">1</span>
                    <span>Rainfall anomaly exceeds 90th percentile threshold.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">2</span>
                    <span>AI predicts agricultural inundation across 4 vulnerable habitations.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">3</span>
                    <span>Command Center reviews village evacuation & safe shelter route.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">4</span>
                    <span>Commander approves broadcast: Telugu SMS alerts sent to farmers.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/dashboard/rural"
                    className="w-full inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-md"
                  >
                    <span>OPEN RURAL INTELLIGENCE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10 — INDIA-SCALE ARCHITECTURE */}
        {/* ========================================================================= */}
        <section id="built-for-india" className="space-y-8 border-t border-slate-900/80 pt-16 scroll-mt-20">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-[#081122] to-[#040813] p-8 lg:p-12 text-center space-y-6">
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/50 text-sky-400 font-bold uppercase">
              INDIA-SCALE ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              BUILT FOR INDIA. DEMONSTRATED IN VISAKHAPATNAM.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              BharatOS establishes an enterprise architectural hierarchy spanning 28 States, 8 Union Territories, and multi-tier command layers, demonstrated through our Visakhapatnam operational prototype environment.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 font-mono text-center">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                <div className="text-2xl font-black text-sky-400">28</div>
                <div className="text-[10px] text-slate-400 uppercase mt-1">States Modeled</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                <div className="text-2xl font-black text-cyan-400">8</div>
                <div className="text-[10px] text-slate-400 uppercase mt-1">UT Geometries</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                <div className="text-2xl font-black text-emerald-400">5-Tier</div>
                <div className="text-[10px] text-slate-400 uppercase mt-1">Command Stack</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900">
                <div className="text-2xl font-black text-purple-400">100%</div>
                <div className="text-[10px] text-slate-400 uppercase mt-1">Human-in-the-Loop</div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard/district"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-mono text-xs font-bold transition-all shadow-lg"
              >
                OPEN COMMAND CENTER
              </Link>
              <Link
                href="/citizen"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-bold transition-all"
              >
                OPEN CITIZEN PORTAL
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* SECTION 11 — FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-900/80 bg-[#040711] mt-24 py-12 relative z-10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Branding */}
            <div className="md:col-span-4 space-y-3">
              <BrandLogo size="md" />
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
                BharatOS is an AI-powered emergency command and spatial Digital Twin operating system designed for disaster resilience and human-approved multi-agency response.
              </p>
              <div className="text-[10px] font-mono text-cyan-400 font-bold">
                Predict locally. Warn early. Prepare intelligently. Respond effectively.
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-2">
                <h5 className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">COMMAND DECK</h5>
                <Link href="/dashboard/national" className="block text-slate-400 hover:text-white transition-colors">National Command</Link>
                <Link href="/dashboard/state" className="block text-slate-400 hover:text-white transition-colors">State Command</Link>
                <Link href="/dashboard/district" className="block text-slate-400 hover:text-white transition-colors">District Command</Link>
                <Link href="/dashboard/city" className="block text-slate-400 hover:text-white transition-colors">City Operations</Link>
                <Link href="/dashboard/digital-twin" className="block text-slate-400 hover:text-white transition-colors">Digital Twin</Link>
              </div>
              <div className="space-y-2">
                <h5 className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">CITIZEN SAFETY LAYER</h5>
                <Link href="/citizen" className="block text-slate-400 hover:text-white transition-colors">Citizen Home</Link>
                <Link href="/citizen/report" className="block text-slate-400 hover:text-white transition-colors">Report Hazard</Link>
                <Link href="/citizen/safe-exit" className="block text-slate-400 hover:text-white transition-colors">Safe-Exit Routing</Link>
                <Link href="/citizen/alerts" className="block text-slate-400 hover:text-white transition-colors">Public Alerts</Link>
                <Link href="/citizen/sos" className="block text-red-400 hover:text-red-300 font-bold transition-colors">1-Tap SOS Beacon</Link>
              </div>
            </div>

            {/* SIH Note */}
            <div className="md:col-span-4 space-y-2 text-xs text-slate-400 font-mono">
              <h5 className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">HACKATHON DEMO PROTOTYPE</h5>
              <p className="text-[11px] leading-relaxed">
                BharatOS is engineered for prototype demonstration at Smart India Hackathon (SIH 2026). Incorporates connected ESP32 IoT sensing, NRSC VIC hydrological modeling, and LangGraph multi-agent orchestration.
              </p>
              <div className="text-[10px] text-slate-500 pt-1">
                AI-assisted emergency decision support • Prototype / Simulation
              </div>
            </div>

          </div>

          <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[9.5px] font-mono text-slate-500">
            <div>BHARATOS © 2026 • AI-POWERED EMERGENCY COMMAND & DIGITAL TWIN OS</div>
            <div className="mt-2 sm:mt-0 uppercase">ALL OPERATIONAL DISPATCHES REQUIRE EXPLICIT OPERATOR CONFIRMATION</div>
          </div>
        </div>
      </footer>

    </div>
  )
}
