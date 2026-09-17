'use client'

import React from 'react'

export default function StatusBar() {
  return (
    <div className="h-7 bg-[#030712] border-t border-slate-900 px-4 flex items-center justify-between text-[10px] text-slate-400 font-mono select-none z-[50] relative shrink-0 overflow-hidden">
      <div className="flex items-center space-x-3.5">
        <span className="flex items-center space-x-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-400 font-bold tracking-wider">SYSTEM ONLINE</span>
        </span>
        <span className="text-slate-700">•</span>
        <span className="flex items-center space-x-1">
          <span className="text-slate-500">PROVENANCE:</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 font-bold text-[9px]">
            PROTOTYPE_SIMULATION
          </span>
        </span>
        <span className="text-slate-700">•</span>
        <span>Telemetry: <span className="text-sky-400 font-semibold">Vizag Smart IoT & Edge Nodes</span></span>
        <span className="text-slate-700">•</span>
        <span>Vision Perception: <span className="text-purple-400 font-semibold">YOLO Multi-Object Tracker</span></span>
      </div>

      <div className="flex items-center space-x-3.5">
        <span>Decision Engine: <span className="text-indigo-400 font-semibold">Multi-Agent Planning OS</span></span>
        <span className="text-slate-700">•</span>
        <span>Safety Protocol: <span className="text-amber-400 font-semibold uppercase">HUMAN APPROVAL REQUIRED (HITL)</span></span>
      </div>
    </div>
  )
}
