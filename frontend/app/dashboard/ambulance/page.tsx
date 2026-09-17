'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import MapContainer, { MapMarker } from '../../../components/ui/MapContainer'
import StandardIncidentCard from '../../../components/ui/StandardIncidentCard'
import { useVizagDataStore } from '../../../store/useVizagDataStore'
import { 
  Truck, 
  Clock, 
  CloudRain, 
  Zap, 
  MapPin, 
  Activity, 
  Phone, 
  BatteryCharging, 
  Navigation,
  Compass, 
  AlertTriangle,
  Building2,
  CheckCircle2,
  PhoneCall
} from 'lucide-react'

export default function AmbulanceOperationsPage() {
  const { resources, incident, approveIncidentAction, simulationTime, demoStage } = useVizagDataStore()
  const [selectedAmbId, setSelectedAmbId] = useState('A-21')
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setCurrentDate(now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase())
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const ambulances = [
    { 
      id: 'A-21', 
      driver: 'R. Koteswara Rao', 
      paramedic: 'G. Swetha', 
      phone: '+91 98480 22341', 
      status: resources['A-21']?.status === 'on_scene' ? 'On Scene' : resources['A-21']?.status === 'en_route' ? 'En Route' : resources['A-21']?.status === 'dispatched' ? 'Dispatched' : 'Available', 
      fuel: '84% (EV Battery)', 
      location: resources['A-21']?.location || 'Siripuram Station Base', 
      lastUpdate: 'Live telemetry', 
      routeProgress: resources['A-21']?.status === 'on_scene' ? 'On Scene at Beach Road' : resources['A-21']?.status === 'en_route' ? 'Ram Nagar Green Corridor -> Beach Road' : 'Standby for Medical Dispatch' 
    },
    { 
      id: 'A-08', 
      driver: 'P. Appa Rao', 
      paramedic: 'K. Prasad', 
      phone: '+91 98480 22308', 
      status: 'On Scene', 
      fuel: '72% (EV Battery)', 
      location: 'Dwaraka Nagar BRTS', 
      lastUpdate: '45s ago', 
      routeProgress: 'Patient Pickup' 
    },
    { 
      id: 'A-19', 
      driver: 'K. Rambabu', 
      paramedic: 'T. Suresh', 
      phone: '+91 98480 22319', 
      status: 'Transporting', 
      fuel: '60% (Diesel)', 
      location: 'NH16 Bypass North', 
      lastUpdate: '2m ago', 
      routeProgress: 'En Route to Hospital' 
    },
    { 
      id: 'A-14', 
      driver: 'M. Satyanarayana', 
      paramedic: 'V. Ramesh', 
      phone: '+91 98480 22314', 
      status: 'Available', 
      fuel: '92% (EV Battery)', 
      location: 'Vizag Central Station', 
      lastUpdate: '5m ago', 
      routeProgress: 'Standby' 
    }
  ]

  const selectedAmb = ambulances.find(a => a.id === selectedAmbId) || ambulances[0]

  const mapMarkers: MapMarker[] = [
    { 
      id: 'A-21', 
      position: resources['A-21']?.coords || [17.7120, 83.3050], 
      title: 'Ambulance A-21 (Medic-21)', 
      description: `Status: ${resources['A-21']?.status.toUpperCase()} | Speed: ${resources['A-21']?.speed} | Driver: R. Koteswara Rao`, 
      category: resources['A-21']?.status === 'on_scene' ? 'critical' : 'high' 
    },
    { id: 'A-08', position: [17.7120, 83.3050], title: 'Ambulance A-08', description: 'On Scene | Paramedic: K. Prasad', category: 'critical' },
    { id: 'A-19', position: [17.7050, 83.2850], title: 'Ambulance A-19', description: 'Transporting | Status: Active transport', category: 'high' },
    { 
      id: 'm-1', 
      position: [17.7210, 83.3180], 
      title: 'Beach Road Inundation & Medical Evacuation', 
      description: `INC-1042 | Water depth ${incident.waterDepthCm}cm | Dispatched A-21, FT-12, P-305`, 
      category: 'critical' 
    }
  ]

  // Vertical timeline state simulation
  const timelineStages = [
    { label: 'Incident Reported (INC-1042)', done: demoStage !== 'IDLE', time: 'T+15' },
    { label: 'AI Triage & Green Wave Route Plan', done: demoStage !== 'IDLE' && demoStage !== 'HEAVY_RAIN' && demoStage !== 'WATER_RISING', time: 'T+25' },
    { label: 'Officer Sign-Off Confirmed', done: incident.humanSignOff, time: 'T+30' },
    { label: 'Dispatched via Ram Nagar Green Wave', done: resources['A-21']?.status === 'en_route' || resources['A-21']?.status === 'on_scene' || resources['A-21']?.status === 'resolved', time: 'T+35' },
    { label: 'Arrived On Scene at Beach Road Sump', done: resources['A-21']?.status === 'on_scene' || resources['A-21']?.status === 'resolved', time: 'T+45' },
    { label: 'Patient Evacuated to NTR General Hospital', done: resources['A-21']?.status === 'resolved', time: 'T+60' }
  ]

  return (
    <DashboardLayout 
      userRole="officer"
      hideHeader={true}
      hideRightPanel={true}
      hideBreadcrumbs={true}
      hideStatusBar={true}
    >
      <div className="flex flex-col min-h-screen text-slate-100 font-sans bg-[#030712] p-4 space-y-4">
        
        {/* HEADER BAR */}
        <header className="flex items-center justify-between border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md rounded-2xl px-5 py-3 shrink-0 shadow-lg">
          <div className="flex items-center space-x-3.5">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="text-sm font-black tracking-wider uppercase text-white font-mono">BHARAT OS</h1>
            </div>
            <span className="text-slate-800 text-lg">|</span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-extrabold tracking-widest text-slate-200 uppercase font-mono">AMBULANCE OPERATIONS CENTER</h2>
                <span className="bg-emerald-600 text-white font-mono text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                  SCENARIO {simulationTime}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider mt-0.5">Real-time emergency medical dispatch, telemetry & green wave coordination</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-slate-400 bg-slate-950/60 border border-slate-900 rounded-lg px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>PROTOTYPE DISPATCH TELEMETRY • PROTOTYPE_SIMULATION</span>
            </div>
            <div className="hidden md:flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>29°C | OVERCAST</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-sky-400 font-mono font-bold">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{currentDate} {currentTime}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold border-l border-slate-800 pl-4">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white font-mono font-bold border border-slate-700">
                AC
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] leading-tight text-white font-bold font-mono">Ambulance Controller</p>
                <p className="text-[8.5px] leading-none text-slate-400">Fleet Operations Command</p>
              </div>
            </div>
          </div>
        </header>

        {/* 7 KPIstat Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 shrink-0">
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Total Ambulances</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">28 Units</h3>
            <span className="text-[8px] text-slate-500 font-mono">District registration roster</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Dispatched</span>
            <h3 className="text-lg font-black text-amber-400 font-mono leading-none mt-1">10 Units</h3>
            <span className="text-[8px] text-amber-500 font-mono">En route / on scene</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Available</span>
            <h3 className="text-lg font-black text-emerald-400 font-mono leading-none mt-1">14 Units</h3>
            <span className="text-[8px] text-emerald-500 font-mono">Station base standby</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Green Wave Corridors</span>
            <h3 className="text-lg font-black text-sky-400 font-mono leading-none mt-1">2 Active</h3>
            <span className="text-[8px] text-sky-400 font-mono">Ram Nagar & NH16 bypass</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Avg Response Time</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">5.1 mins</h3>
            <span className="text-[8px] text-slate-500 font-mono">District 108 average</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Trauma Centers</span>
            <h3 className="text-lg font-black text-white font-mono leading-none mt-1">4 Facilities</h3>
            <span className="text-[8px] text-slate-500 font-mono">Level 1 & 2 Available</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between h-[80px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">ICU Beds Standby</span>
            <h3 className="text-lg font-black text-emerald-400 font-mono leading-none mt-1">18 Beds</h3>
            <span className="text-[8px] text-emerald-500 font-mono">NTR & Seven Hills</span>
          </div>
        </section>

        {/* WORKSPACE Row */}
        <section className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch flex-1 min-h-[460px]">
          
          {/* COLUMN 1, 2 & 3: LIVE AMBULANCE TRACKING MAP */}
          <div className="xl:col-span-3 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 text-xs font-mono shrink-0">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h4 className="font-bold text-white uppercase tracking-wider">LIVE AMBULANCE FLEET TRACKING</h4>
              </div>
              <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse inline-block mr-1.5" />
                <span>GPS Feeds Synchronized ({simulationTime})</span>
              </div>
            </div>

            <div className="flex-1 relative rounded-xl border border-slate-950 overflow-hidden min-h-[300px] bg-slate-950">
              <MapContainer
                center={[17.7200, 83.3150]}
                zoom={13}
                markers={mapMarkers}
              />
              
              {/* Floating controls overlays */}
              <div className="absolute top-4 right-4 z-[999] p-3 rounded-xl border border-slate-900 bg-[#060a13]/85 backdrop-blur-md shadow-2xl space-y-1.5 text-[8.5px] font-mono text-slate-300">
                <h5 className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Ambulance Status</h5>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>On Scene Emergency</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>En Route Priority</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Available Standby</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 4: ACTIVE ASSIGNMENT & AMBULANCE DETAILS */}
          <div className="xl:col-span-1 rounded-2xl border border-slate-900 bg-[#0B0F19]/80 backdrop-blur-md p-4 flex flex-col justify-between min-w-0 max-h-[580px]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 shrink-0 font-mono">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Assignment</h4>
              </div>
              <span className="text-[8.5px] font-bold text-sky-400 bg-sky-950/20 border border-sky-900/30 px-1.5 py-0.5 rounded uppercase">{selectedAmb.id}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs scrollbar-thin">
              
              {/* Assignment logs */}
              <div className="space-y-1 border-b border-slate-900/60 pb-2.5">
                <h5 className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Incident</h5>
                <p className="font-extrabold text-white text-sm">Beach Road Flooding Trauma</p>
                <p className="text-[9.5px] text-slate-400 font-mono">Location: Beach Road Sector 4 / MVP</p>
              </div>

              {/* Ambulance specifications details */}
              <div className="space-y-1.5 text-[10px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="text-slate-200">{selectedAmb.driver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">EMT:</span>
                  <span className="text-slate-200">{selectedAmb.paramedic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Speed:</span>
                  <span className="text-sky-400 font-bold">{resources['A-21']?.speed || '0 km/h'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Battery Level:</span>
                  <span className="text-emerald-400 font-bold">{selectedAmb.fuel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source:</span>
                  <span className="text-amber-400 font-bold">SIMULATION</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-sky-400 font-bold uppercase">{selectedAmb.status}</span>
                </div>
              </div>

              {/* Vertical timeline steps */}
              <div className="space-y-2 pt-2 border-t border-slate-900/50">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Live Dispatch Route Progress</span>
                <div className="space-y-2 font-mono text-[9.5px]">
                  {timelineStages.map((st, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <div className="flex flex-col items-center mt-1 shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${st.done ? 'bg-emerald-500' : 'bg-slate-800 border border-slate-700'}`} />
                        {idx < timelineStages.length - 1 && <div className="w-0.5 h-6 bg-slate-900" />}
                      </div>
                      <div className="flex-1 flex justify-between">
                        <span className={st.done ? 'text-slate-300 font-bold' : 'text-slate-500'}>{st.label}</span>
                        <span className="text-[8.5px] text-slate-500">{st.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* LOWER WORKSPACE SECTION: STANDARD INCIDENT CARD INTEGRATION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0">
          
          {/* Synchronized Standard Incident Card INC-1042 */}
          <div className="lg:col-span-6">
            <StandardIncidentCard
              id={incident.id}
              ticketNumber={incident.ticketNumber}
              category="EMERGENCY MEDICAL & EVACUATION"
              severity={incident.severity}
              title={incident.title}
              location={incident.location}
              timestamp={`${simulationTime} Scenario`}
              status={incident.status}
              waterDepthCm={incident.waterDepthCm}
              peopleAtRisk={incident.peopleAtRisk}
              assignedUnits={incident.assignedUnits}
              aiRecommendation={incident.aiRecommendation}
              confidence={94}
              humanSignOff={incident.humanSignOff}
              signedBy={incident.signedBy}
              provenance={incident.provenance}
              technicalDetails={{
                modelUsed: 'Gemini 2.5 Flash + LangGraph EMS Coordinator',
                latencyMs: 138,
                langGraphNodes: ['triage_eval', 'green_wave_route', 'hospital_bed_sync'],
                rawTelemetrySnapshot: { waterDepthCm: incident.waterDepthCm, unitsAssigned: incident.assignedUnits }
              }}
              onAuthorize={() => approveIncidentAction('Duty Commander (Badge #104)')}
            />
          </div>

          {/* Active dispatches queue */}
          <div className="lg:col-span-3 p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Ambulances On Scene</span>
            <div className="overflow-x-auto mt-2 flex-1">
              <table className="w-full text-left text-[10px] font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-900 pb-1">
                    <th className="py-1">ID</th>
                    <th className="py-1">Incident</th>
                    <th className="py-1">Fuel</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-slate-300">
                  {ambulances.map((a) => (
                    <tr key={a.id} onClick={() => setSelectedAmbId(a.id)} className={`hover:bg-slate-900/45 cursor-pointer ${selectedAmbId === a.id ? 'bg-slate-900/80 border-l border-emerald-500 pl-1' : ''}`}>
                      <td className="py-1.5 font-bold text-white">{a.id}</td>
                      <td className="py-1.5 truncate max-w-[85px]">{a.routeProgress}</td>
                      <td className="py-1.5 text-slate-400">{a.fuel}</td>
                      <td className={`py-1.5 font-bold ${a.status === 'On Scene' ? 'text-red-400' : a.status === 'En Route' ? 'text-amber-500' : 'text-emerald-400'}`}>{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Destination Hospital Loads */}
          <div className="lg:col-span-3 p-4 rounded-xl border border-slate-900 bg-[#0B0F19]/60 flex flex-col justify-between min-w-0">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest font-mono border-b border-slate-900 pb-1.5 block">Top Destination Hospitals</span>
            <div className="space-y-2 mt-2 text-[10px] font-mono text-slate-300 flex-1 flex flex-col justify-center">
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>NTR General Hospital:</span>
                <span className="text-sky-400 font-bold">6 ICU Available (Optimal)</span>
              </div>
              <div className="flex justify-between border-b border-slate-900/50 pb-1">
                <span>Seven Hills Clinic:</span>
                <span className="text-sky-400 font-bold">12 ICU Available (Optimal)</span>
              </div>
              <div className="flex justify-between">
                <span>Ram Nagar Green Corridor:</span>
                <span className="text-emerald-400 font-bold">GREEN WAVE ENGAGED</span>
              </div>
            </div>
          </div>

        </section>

        {/* BOTTOM STATUS BAR */}
        <footer className="border border-slate-900 bg-[#0B0F19]/90 rounded-xl px-4 py-2 shrink-0 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500">FLEET:</span>
              <span className="text-emerald-400 font-bold uppercase">108 EMS ACTIVE</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500">VEHICLES:</span>
              <span className="text-slate-200">4 MONITORED</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500">CORRIDOR:</span>
              <span className="text-sky-400 font-semibold">GREEN WAVE CONNECTED</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500">TRAUMA ER:</span>
              <span className="text-emerald-400 font-semibold">NTR GENERAL / SEVEN HILLS</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-500">SAFETY:</span>
              <span className={incident.humanSignOff ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {incident.humanSignOff ? "AUTHORIZED" : "OPERATOR APPROVAL REQUIRED"}
              </span>
            </div>
          </div>
        </footer>

      </div>
    </DashboardLayout>
  )
}
