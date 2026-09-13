'use client'

import React from 'react'
import { 
  Shield, 
  Flame, 
  Ambulance, 
  Droplet, 
  LifeBuoy, 
  Navigation, 
  MapPin, 
  Clock, 
  Zap, 
  Activity,
  Gauge
} from 'lucide-react'
import { ProvenanceType } from '../../store/useVizagDataStore'

export interface StandardResourceCardProps {
  id: string
  callSign: string
  type: 'police' | 'ambulance' | 'fire' | 'pump' | 'traffic' | 'rescue'
  department: string
  personnel?: string
  status: 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'operating' | 'resolved'
  location: string
  eta?: string
  speed?: string
  batteryFuel?: string
  currentAssignment?: string
  provenance?: ProvenanceType
  isSelected?: boolean
  onClick?: () => void
}

export default function StandardResourceCard({
  id,
  callSign,
  type,
  department,
  personnel,
  status,
  location,
  eta,
  speed,
  batteryFuel,
  currentAssignment,
  provenance = 'SIMULATION',
  isSelected = false,
  onClick
}: StandardResourceCardProps) {
  // Icon and theme based on type
  const typeConfig = {
    police: {
      icon: Shield,
      color: 'text-blue-400',
      badgeBg: 'bg-blue-950/60 border-blue-800/50 text-blue-300',
      borderLeft: 'border-l-blue-500'
    },
    ambulance: {
      icon: Ambulance,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300',
      borderLeft: 'border-l-emerald-500'
    },
    fire: {
      icon: Flame,
      color: 'text-red-400',
      badgeBg: 'bg-red-950/60 border-red-800/50 text-red-300',
      borderLeft: 'border-l-red-500'
    },
    pump: {
      icon: Droplet,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-950/60 border-cyan-800/50 text-cyan-300',
      borderLeft: 'border-l-cyan-500'
    },
    traffic: {
      icon: Navigation,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/60 border-amber-800/50 text-amber-300',
      borderLeft: 'border-l-amber-500'
    },
    rescue: {
      icon: LifeBuoy,
      color: 'text-orange-400',
      badgeBg: 'bg-orange-950/60 border-orange-800/50 text-orange-300',
      borderLeft: 'border-l-orange-500'
    }
  }[type] || {
    icon: Activity,
    color: 'text-slate-400',
    badgeBg: 'bg-slate-900 border-slate-800 text-slate-300',
    borderLeft: 'border-l-slate-500'
  }

  const Icon = typeConfig.icon

  // Status badge config
  const statusConfig = {
    available: { label: 'AVAILABLE', bg: 'bg-slate-900 text-slate-300 border-slate-800' },
    dispatched: { label: 'DISPATCHED', bg: 'bg-amber-950/60 text-amber-300 border-amber-800/60' },
    en_route: { label: 'EN ROUTE', bg: 'bg-sky-950/60 text-sky-300 border-sky-800/60' },
    on_scene: { label: 'ON SCENE', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 animate-pulse' },
    operating: { label: 'OPERATING', bg: 'bg-teal-950/60 text-teal-300 border-teal-800/60' },
    resolved: { label: 'RESOLVED', bg: 'bg-slate-900 text-slate-400 border-slate-800' }
  }[status] || { label: status.toUpperCase(), bg: 'bg-slate-900 text-slate-400 border-slate-800' }

  return (
    <div 
      onClick={onClick}
      className={`glass-panel border-l-4 rounded-2xl p-4 flex flex-col space-y-3 cursor-pointer transition-all duration-200 ${
        typeConfig.borderLeft
      } ${
        isSelected 
          ? 'ring-2 ring-sky-400 bg-sky-950/20' 
          : 'hover:bg-slate-900/60'
      }`}
    >
      {/* Header with ID, Callsign, Status, and Provenance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${typeConfig.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black font-mono text-white">{id}</span>
              <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">[{callSign}]</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">{department}</p>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-1">
          <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 border rounded uppercase tracking-wider ${statusConfig.bg}`}>
            {statusConfig.label}
          </span>
          <span className="text-[8.5px] font-mono text-slate-500 font-bold uppercase">
            SOURCE: {provenance}
          </span>
        </div>
      </div>

      {/* Assignment / Location */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {currentAssignment && (
          <p className="text-[11px] text-slate-400 font-mono pl-5">
            Assignment: <span className="text-slate-200 font-medium">{currentAssignment}</span>
          </p>
        )}

        {personnel && (
          <p className="text-[10px] text-slate-500 font-mono pl-5">
            Crew: {personnel}
          </p>
        )}
      </div>

      {/* Metrics Row (ETA, Speed, Battery/Fuel) */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900/80 text-[10px] font-mono">
        <div className="flex items-center space-x-1 text-slate-400">
          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">ETA: <strong className="text-white">{eta || 'N/A'}</strong></span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400">
          <Gauge className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{speed || '0 km/h'}</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400">
          <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{batteryFuel || '100%'}</span>
        </div>
      </div>
    </div>
  )
}
