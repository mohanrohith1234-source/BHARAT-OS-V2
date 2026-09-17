'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  AlertTriangle,
  Bot,
  Shield,
  Clock,
  PhoneCall,
  LifeBuoy,
  Flame,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Navigation,
  Droplets,
  Building2,
  HelpCircle,
  Radio,
  ExternalLink
} from 'lucide-react'
import { useCitizenStore } from '../../store/useCitizenStore'
import { useVizagDataStore } from '../../store/useVizagDataStore'
import { AppLanguage, CitizenAlert, CitizenIncident } from '../../types/citizen'

export default function CitizenHome() {
  const { profile, activeLocation, myIncidents } = useCitizenStore()
  const { demoStage, simulationTime, incident, sensors, trafficCorridors } = useVizagDataStore()
  const lang: AppLanguage = profile.language || 'en'

  // Dynamic Citizen Safety Status based on shared Vizag simulation state
  const getSafetyStatus = () => {
    switch (demoStage) {
      case 'T00_NORMAL':
      case 'T70_RISK_NORMALIZED':
      case 'IDLE':
      case 'RESOLVED':
        return {
          badge: 'SAFE',
          indicator: '🟢',
          title: 'YOU ARE SAFE',
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-950/40 border-emerald-800/60',
          explanation: 'Normal weather and drainage flow in your sector. All major roadways and underpasses are clear.'
        }
      case 'T05_WEATHER_SIGNAL':
      case 'T10_AI_NOWCAST':
      case 'HEAVY_RAIN':
        return {
          badge: 'CAUTION',
          indicator: '🟡',
          title: 'WEATHER CAUTION',
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-950/40 border-yellow-800/60',
          explanation: 'Precipitation spike (28-64 mm/hr) recorded in coastal catchment. Watch for localized water accumulation in low-lying spots.'
        }
      case 'T15_WARD_RISK':
      case 'T20_EARLY_WARNING':
      case 'T25_TRAFFIC_IMPACT':
      case 'T30_OFFICER_APPROVAL':
      case 'INCIDENT_DETECTED':
      case 'AI_TRIAGE':
        return {
          badge: 'HIGH RISK',
          indicator: '🟠',
          title: 'HIGH FLOOD RISK',
          textColor: 'text-orange-400',
          bgColor: 'bg-orange-950/50 border-orange-800/60',
          explanation: `Beach Road culvert water level reached ${incident.waterDepthCm} cm. Avoid driving through Sector 4 and coastline bypass corridors.`
        }
      case 'T35_WATER_RISING':
      case 'WATER_RISING':
      case 'OFFICER_APPROVED':
        return {
          badge: 'EVACUATE NOW',
          indicator: '🔴',
          title: 'CRITICAL INUNDATION ALERT',
          textColor: 'text-red-400',
          bgColor: 'bg-red-950/60 border-red-700/80 shadow-[0_0_30px_rgba(239,68,68,0.3)]',
          explanation: 'Severe waterlogging at Beach Road Sector 4. Non-emergency traffic is being diverted to NH16. Move to upper floors or designated shelter.'
        }
      case 'T40_RESPONSE_DEPLOYED':
      case 'T50_DIGITAL_TWIN':
      case 'T60_WATER_FALLING':
      case 'UNITS_DISPATCHED':
      case 'WATER_DRAINED':
        return {
          badge: 'CAUTION',
          indicator: '🟡',
          title: 'RESPONSE & DEWATERING ACTIVE',
          textColor: 'text-cyan-400',
          bgColor: 'bg-cyan-950/40 border-cyan-800/60',
          explanation: 'Emergency vehicles and high-capacity dewatering pump DP-04 are operating on scene. Water depth is actively receding.'
        }
      default:
        return {
          badge: 'SAFE',
          indicator: '🟢',
          title: 'YOU ARE SAFE',
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-950/40 border-emerald-800/60',
          explanation: 'Normal weather and drainage flow in your sector.'
        }
    }
  }

  const safety = getSafetyStatus()

  // Dynamic Safety Advisor strictly bound to 4 risk tiers
  const getSafetyAdvice = () => {
    if (safety.badge === 'EVACUATE NOW') {
      return [
        'CRITICAL: Immediate evacuation advised for Beach Road Sector 4 low-lying ground.',
        'Proceed immediately to nearest designated relief center: MVP High School Relief Shelter (600m).',
        'Do not drive through floodwater — water depths exceed 55 cm with submerged debris.',
        'Keep mobile devices charged, take essential medications and emergency go-bag.'
      ]
    }
    if (safety.badge === 'HIGH RISK') {
      return [
        'High flood risk detected. Avoid Sector 4 shoreline road and low-lying coastal underpasses.',
        'Move valuable items, electronics, and vehicles to elevated ground immediately.',
        'Ensure family members and neighbors are alerted; keep line of communication open with Ward 12 coordinator.',
        'Monitor BharatOS early warning notifications for rapid shelter evacuation orders.'
      ]
    }
    if (safety.badge === 'CAUTION') {
      return [
        'Precipitation spike active. Watch for localized stormwater ponding near basement ramps.',
        'Municipal emergency crews and dewatering pumps are deployed across Beach Road.',
        'Follow designated traffic diversions towards NH16 bypass.',
        'Avoid contact with open stormwater gutters and fallen electric cables.'
      ]
    }
    return [
      'Normal weather and urban drainage conditions in Visakhapatnam MVP Colony.',
      'Familiarize yourself with your nearest shelter: MVP High School Relief Shelter (600m away).',
      'Emergency numbers 112 (Police), 108 (Medical), and 101 (Fire) are active 24/7.',
      'Maintain basic emergency go-bag and check drinking water supply.'
    ]
  }

  const safetyAdviceList = getSafetyAdvice()
  const closedRoadsCount = Object.values(trafficCorridors).filter(c => c.status === 'CLOSED_FLOOD').length

  return (
    <div className="space-y-6 pb-12 font-sans max-w-5xl mx-auto">

      {/* 1. TOP SECTION: SAFETY STATUS BANNER */}
      <div className={`rounded-3xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-300 backdrop-blur-md ${safety.bgColor}`}>
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl leading-none">{safety.indicator}</span>
            <span className="text-xs font-mono font-black uppercase tracking-widest text-slate-400">SAFETY STATUS</span>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${safety.textColor} border-current/30`}>
              {safety.badge}
            </span>
          </div>

          <h2 className={`text-2xl md:text-3xl font-black font-mono tracking-tight ${safety.textColor}`}>
            {safety.title}
          </h2>

          <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>MVP Colony, Visakhapatnam (Ward 12)</span>
          </div>

          <p className="text-xs md:text-sm text-slate-200/90 leading-relaxed pt-1 max-w-2xl font-normal">
            {safety.explanation}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
          <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-slate-800/80">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>Scenario Clock: <strong className="text-white">{simulationTime}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800/60 text-sky-300">
              SENSOR FEED: SIMULATION
            </span>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300">
              VERIFIED CATCHMENT
            </span>
          </div>
        </div>
      </div>

      {/* 2. TWO DOMINANT ACTIONS: SOS & REPORT FLOOD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* DOMINANT ACTION 1: SOS GET HELP */}
        <Link
          href="/citizen/sos"
          className="group relative overflow-hidden rounded-3xl border-2 border-red-600/80 bg-gradient-to-r from-red-950 via-[#2a080c] to-[#1a0407] p-6 shadow-[0_0_40px_rgba(239,68,68,0.35)] hover:shadow-[0_0_50px_rgba(239,68,68,0.55)] transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
        >
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-red-400 block">
              1-TAP IMMEDIATE DISPATCH
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white font-mono uppercase tracking-tight">
              🚨 SOS — GET HELP
            </h3>
            <p className="text-xs text-red-200/80 font-medium">
              Request Medical, Fire, Police, or Flood Rescue immediately
            </p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-red-950/80 shrink-0 ml-3">
            <ShieldAlert className="w-8 h-8 group-hover:animate-ping" />
          </div>
        </Link>

        {/* DOMINANT ACTION 2: REPORT FLOOD / EMERGENCY */}
        <Link
          href="/citizen/report"
          className="group relative overflow-hidden rounded-3xl border-2 border-sky-600/80 bg-gradient-to-r from-sky-950 via-[#051c2e] to-[#041320] p-6 shadow-[0_0_40px_rgba(56,189,248,0.25)] hover:shadow-[0_0_50px_rgba(56,189,248,0.45)] transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
        >
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400 block">
              COMMUNITY REPORTING
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white font-mono uppercase tracking-tight">
              🌊 REPORT FLOOD
            </h3>
            <p className="text-xs text-sky-200/80 font-medium">
              Report rising water, blocked drains, or stranded citizens
            </p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-sky-950/80 shrink-0 ml-3">
            <Droplets className="w-8 h-8 group-hover:animate-bounce" />
          </div>
        </Link>
      </div>

      {/* 3. NEARBY ALERT & FLOOD STATUS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* NEARBY ALERT CARD */}
        <div className="rounded-3xl border border-slate-850 bg-[#070B14]/90 p-5 space-y-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">NEARBY ALERT</h3>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-300">
              SIMULATION
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                {demoStage === 'IDLE' 
                  ? 'Coastal Marine Weather Normal' 
                  : 'Beach Road Culvert Inundation Warning'}
              </span>
              <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                demoStage === 'AI_TRIAGE' || demoStage === 'OFFICER_APPROVED' || demoStage === 'INCIDENT_DETECTED'
                  ? 'bg-red-950/80 border border-red-800 text-red-300'
                  : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              }`}>
                {demoStage === 'IDLE' ? 'MONITORING' : 'ACTIVE WARNING'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {demoStage === 'IDLE'
                ? 'No active hazard alerts for Visakhapatnam urban catchment. Routine drainage telemetry active.'
                : 'Heavy rainfall runoff has overwhelmed the Beach Road Sector 4 outfall sump. Avoid driving near shoreline underpasses.'}
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Source: <strong className="text-slate-200">IMD Radar / GVMC Sump Telemetry</strong></span>
              <Link href="/citizen/alerts" className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold">
                <span>View All Alerts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* FLOOD STATUS TELEMETRY CARD */}
        <div className="rounded-3xl border border-slate-850 bg-[#070B14]/90 p-5 space-y-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">FLOOD STATUS — LOCAL TELEMETRY</h3>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
              SENSOR FEED: SIMULATION (VIZAG IOT TWIN)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#040813] border border-slate-900 space-y-1">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase block">Water Level</span>
              <span className="text-lg font-black font-mono text-white">{incident.waterDepthCm} cm</span>
              <span className="text-[8.5px] font-mono text-slate-500 block">Sensor #1 Sump</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#040813] border border-slate-900 space-y-1">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase block">Rainfall Rate</span>
              <span className="text-lg font-black font-mono text-sky-400">
                {demoStage === 'IDLE' ? '0 mm/h' : '64 mm/h'}
              </span>
              <span className="text-[8.5px] font-mono text-slate-500 block">Doppler Radar</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#040813] border border-slate-900 space-y-1">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase block">Risk Level</span>
              <span className={`text-sm font-black font-mono uppercase ${safety.textColor}`}>
                {safety.badge}
              </span>
              <span className="text-[8.5px] font-mono text-slate-500 block">Zone Status</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#040813] border border-slate-900 space-y-1">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase block">Road Closures</span>
              <span className="text-sm font-bold font-mono text-amber-300 truncate block">
                {closedRoadsCount > 0 ? `${closedRoadsCount} Road Closed` : '0 Closed (All Open)'}
              </span>
              <span className="text-[8.5px] font-mono text-slate-500 block">
                {closedRoadsCount > 0 ? 'Beach Rd Diversion' : 'Normal Flow'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Last Updated: <strong className="text-slate-200">{simulationTime}</strong></span>
            <Link href="/citizen/safe-exit" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Find Safe Exit Route</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* 4. NEARBY HELP QUICK DIRECTORY */}
      <div className="rounded-3xl border border-slate-850 bg-[#070B14]/90 p-5 space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              NEARBY HELP — EMERGENCY DIRECTORY
            </h3>
          </div>
          <span className="text-[9.5px] font-mono font-bold text-slate-400">
            VERIFIED INFRASTRUCTURE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Hospital */}
          <div className="p-4 rounded-2xl bg-[#040813] border border-slate-900 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-base">🏥</span>
                <span className="text-[9.5px] font-mono text-slate-400 font-bold">1.8 km</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">NTR General Hospital</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Level 1 Apex Trauma Center</p>
            </div>
            <div className="flex items-center space-x-1.5 pt-1">
              <a
                href="tel:108"
                className="flex-1 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-700/40 text-emerald-300 text-[10px] font-mono font-bold text-center transition-colors"
              >
                CALL 108
              </a>
              <Link
                href="/citizen/safe-exit"
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold text-center transition-colors"
              >
                DIRECTIONS
              </Link>
            </div>
          </div>

          {/* Police Station */}
          <div className="p-4 rounded-2xl bg-[#040813] border border-slate-900 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-base">🚓</span>
                <span className="text-[9.5px] font-mono text-slate-400 font-bold">0.9 km</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">MVP Colony Police Station</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sector Law Enforcement Base</p>
            </div>
            <div className="flex items-center space-x-1.5 pt-1">
              <a
                href="tel:112"
                className="flex-1 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-700/40 text-blue-300 text-[10px] font-mono font-bold text-center transition-colors"
              >
                CALL 112
              </a>
              <Link
                href="/citizen/safe-exit"
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold text-center transition-colors"
              >
                DIRECTIONS
              </Link>
            </div>
          </div>

          {/* Fire Station */}
          <div className="p-4 rounded-2xl bg-[#040813] border border-slate-900 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-base">🚒</span>
                <span className="text-[9.5px] font-mono text-slate-400 font-bold">2.4 km</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">Suryabagh Fire Station</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Hazmat & Water Rescue Tender</p>
            </div>
            <div className="flex items-center space-x-1.5 pt-1">
              <a
                href="tel:101"
                className="flex-1 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-700/40 text-red-300 text-[10px] font-mono font-bold text-center transition-colors"
              >
                CALL 101
              </a>
              <Link
                href="/citizen/safe-exit"
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold text-center transition-colors"
              >
                DIRECTIONS
              </Link>
            </div>
          </div>

          {/* Emergency Shelter */}
          <div className="p-4 rounded-2xl bg-[#040813] border border-slate-900 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-base">🏫</span>
                <span className="text-[9.5px] font-mono text-emerald-400 font-bold">0.6 km (Nearest)</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">MVP High School Shelter</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Food, Drinking Water, Medical Aid</p>
            </div>
            <div className="flex items-center space-x-1.5 pt-1">
              <Link
                href="/citizen/safe-exit"
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold text-center transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-950"
              >
                <Navigation className="w-3 h-3" />
                <span>SAFE EVACUATION ROUTE</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BHARATOS SAFETY ADVISOR: "WHAT SHOULD I DO?" */}
      <div className="rounded-3xl border border-indigo-900/40 bg-indigo-950/15 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
              BHARATOS SAFETY ADVISOR — WHAT SHOULD I DO?
            </h3>
          </div>
          <span className="text-[9.5px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded">
            AI-DERIVED PRECAUTIONS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {safetyAdviceList.map((advice, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-[#040813]/80 border border-indigo-950/60 flex items-start space-x-2.5">
              <div className="p-1 rounded bg-indigo-950 border border-indigo-800/50 text-indigo-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                {advice}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
