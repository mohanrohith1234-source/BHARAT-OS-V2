'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Flame, Landmark, Activity, CloudRain, ShieldAlert, Radio, Network, Wifi, ShieldCheck, MapPin } from 'lucide-react'

interface MapLayer {
  name: string
  active: boolean
  icon: React.ReactNode
  color: string
}

interface FeedItem {
  id: string
  time: string
  dept: string
  message: string
  priority: 'CRITICAL' | 'WARN' | 'INFO'
  icon: React.ReactNode
  badgeColor: string
}

export default function LiveMapLayers() {
  const [layers, setLayers] = useState<MapLayer[]>([
    { name: 'Police Stations', active: true, icon: <Shield className="w-3.5 h-3.5" />, color: 'text-sky-500' },
    { name: 'Fire Stations', active: true, icon: <Flame className="w-3.5 h-3.5" />, color: 'text-red-500' },
    { name: 'Hospitals', active: true, icon: <Landmark className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
    { name: 'Traffic Cameras', active: false, icon: <Activity className="w-3.5 h-3.5" />, color: 'text-cyan-500' },
    { name: 'Weather Radar', active: true, icon: <CloudRain className="w-3.5 h-3.5" />, color: 'text-blue-500' },
    { name: 'Flood Risk Areas', active: false, icon: <ShieldAlert className="w-3.5 h-3.5" />, color: 'text-amber-500' },
    { name: 'Railways', active: false, icon: <Network className="w-3.5 h-3.5" />, color: 'text-purple-500' },
    { name: 'Airports', active: false, icon: <Wifi className="w-3.5 h-3.5" />, color: 'text-indigo-500' }
  ])

  const [feed, setFeed] = useState<FeedItem[]>([
    {
      id: '1',
      time: 'Just Now',
      dept: 'IMD',
      message: 'Heavy Rain Warning: Coastal districts alert level raised to Amber.',
      priority: 'WARN',
      icon: <CloudRain className="w-3.5 h-3.5 text-amber-500" />,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: '2',
      time: '3m ago',
      dept: 'NDMA',
      message: 'Relief Team Mobilized: 4 NDRF battalions deployed to low-lying zones.',
      priority: 'CRITICAL',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-500" />,
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20'
    },
    {
      id: '3',
      time: '8m ago',
      dept: 'Traffic Police',
      message: 'NH16 Congestion: Traffic diversion active at mile 124 due to water logging.',
      priority: 'WARN',
      icon: <Activity className="w-3.5 h-3.5 text-amber-500" />,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: '4',
      time: '12m ago',
      dept: 'Health Dept',
      message: 'ICU Beds Updated: Regional Government General Hospital capacity synched.',
      priority: 'INFO',
      icon: <Landmark className="w-3.5 h-3.5 text-emerald-500" />,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: '5',
      time: '18m ago',
      dept: 'Power Grid',
      message: 'Substation Restored: Grid link 4B operational after telemetry override.',
      priority: 'INFO',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: '6',
      time: '24m ago',
      dept: 'ERSS 112',
      message: 'Emergency Call Received: Medical dispatch routed to Sector 8 ward.',
      priority: 'CRITICAL',
      icon: <Radio className="w-3.5 h-3.5 text-red-500" />,
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20'
    }
  ])

  const toggleLayer = (index: number) => {
    setLayers(
      layers.map((layer, idx) =>
        idx === index ? { ...layer, active: !layer.active } : layer
      )
    )
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const depts = ['IMD', 'NDMA', 'ERSS 112', 'Traffic Police', 'Health Dept']
      const messages = [
        'Lightning alert active for northern grid sectors.',
        'Emergency shelter dispatch updated with resource counts.',
        '112 hotline: Ambulance units dispatch complete for sector 4.',
        'National highway bypass route confirmed fully clear.',
        'Weather radar calibration sweep completed successfully.'
      ]
      const priorities: ('CRITICAL' | 'WARN' | 'INFO')[] = ['INFO', 'WARN', 'CRITICAL']
      const colors = {
        CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
        WARN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        INFO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      }
      const icons = {
        CRITICAL: <ShieldAlert className="w-3.5 h-3.5 text-red-500" />,
        WARN: <CloudRain className="w-3.5 h-3.5 text-amber-500" />,
        INFO: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
      }

      const randomIdx = Math.floor(Math.random() * depts.length)
      const selectedPriority = priorities[Math.floor(Math.random() * priorities.length)]

      const newItem: FeedItem = {
        id: Math.random().toString(),
        time: 'Just Now',
        dept: depts[randomIdx],
        message: messages[randomIdx],
        priority: selectedPriority,
        icon: icons[selectedPriority],
        badgeColor: colors[selectedPriority]
      }

      setFeed(prev => [newItem, ...prev.slice(0, 6)])
    }, 12000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full space-y-6 flex flex-col justify-between h-full select-none">
      
      {/* 1. National Map Layers Selection Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B0F19]/65 backdrop-blur-xl p-4 sm:p-5 shadow-xl space-y-3 flex-1 flex flex-col justify-between min-h-[340px]">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>NATIONAL GIS LAYERS</span>
            </h4>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/40 text-sky-300 font-bold">
              VERIFIED MESH
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            India-scale multi-tier spatial and infrastructure layers.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 flex-1 pt-1">
          {layers.map((layer, index) => (
            <button
              key={layer.name}
              onClick={() => toggleLayer(index)}
              className={`flex items-center justify-between px-2.5 h-10 rounded-xl border text-[10.5px] font-bold tracking-wide transition-all select-none duration-200 ${
                layer.active
                  ? 'bg-slate-950/60 border-sky-500/40 text-slate-100 shadow-[0_0_10px_rgba(6,182,212,0.12)]'
                  : 'bg-transparent border-slate-900/50 text-slate-500 opacity-50 hover:opacity-100 hover:border-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-1.5 truncate">
                <span className={layer.active ? layer.color : 'text-slate-600'}>
                  {layer.icon}
                </span>
                <span className="truncate">{layer.name}</span>
              </div>
              <div 
                className={`w-3 h-3 rounded-full border flex items-center justify-center p-[2px] shrink-0 ml-1 transition-all ${
                  layer.active 
                    ? 'border-sky-500 bg-sky-500' 
                    : 'border-slate-800 bg-transparent'
                }`}
              >
                {layer.active && <div className="w-1 h-1 rounded-full bg-slate-950" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Operations Telemetry Feed (Labeled Honestly as Simulation / Live API) */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B0F19]/65 backdrop-blur-xl p-4 sm:p-5 shadow-xl space-y-3 flex-1 flex flex-col justify-between min-h-[340px]">
        <div className="flex items-center justify-between border-b border-slate-900/60 pb-2.5">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono">
              OPERATIONS TELEMETRY
            </h4>
          </div>
          <span className="text-[8.5px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 font-bold">
            SIMULATION
          </span>
        </div>

        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent flex-1 pt-1">
          {feed.map((item, index) => {
            const isLatest = index === 0
            
            const barColors = {
              CRITICAL: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.55)]',
              WARN: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.55)]',
              INFO: item.dept.includes('Health') 
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]' 
                : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.55)]'
            }

            return (
              <div 
                key={item.id} 
                className={`relative overflow-hidden flex items-start space-x-2.5 pl-4 pr-2.5 py-2.5 rounded-xl border transition-all duration-200 ${
                  isLatest
                    ? 'border-cyan-500/35 bg-[#0b1329]/40 shadow-[0_0_10px_rgba(6,182,212,0.06)]'
                    : 'border-slate-900/60 bg-slate-950/20 hover:bg-slate-950/50 hover:border-slate-850/40'
                }`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColors[item.priority]}`} />

                <div className="shrink-0 p-1 rounded-lg bg-slate-950 border border-slate-900">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border leading-none tracking-wider uppercase font-mono ${item.badgeColor}`}>
                      {item.dept}
                    </span>
                    <span className="text-[8.5px] text-slate-500 font-mono font-medium">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-snug break-words font-medium">
                    {item.message}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Operations CTA */}
        <div className="pt-2 border-t border-slate-900/60 flex items-center gap-2">
          <a
            href="/dashboard/national"
            className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 text-[11px] font-mono font-bold transition-all"
          >
            <span>NATIONAL DECK</span>
            <Activity className="w-3 h-3 text-sky-400" />
          </a>
          <a
            href="/dashboard/district"
            className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl border border-emerald-800/60 bg-emerald-950/30 text-emerald-300 hover:text-emerald-200 text-[11px] font-mono font-bold transition-all"
          >
            <span>VIZAG PILOT</span>
            <MapPin className="w-3 h-3 text-emerald-400" />
          </a>
        </div>
      </div>

    </div>
  )
}
