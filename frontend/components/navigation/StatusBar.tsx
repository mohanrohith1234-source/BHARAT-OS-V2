'use client'

import React from 'react'

export default function StatusBar() {
  return (
    <div className="h-6 bg-[#030712] border-t border-slate-900 px-4 flex items-center justify-between text-[10px] text-slate-400 font-mono-data select-none z-[50] relative shrink-0">
      <div className="flex items-center space-x-4">
        <span className="flex items-center space-x-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-bold">BHARATOS ENGINE: ACTIVE</span>
        </span>
        <span>•</span>
        <span>Telemetry Feeds: <span className="text-sky-400 font-semibold">GVMC IoT & IMD Radar</span></span>
        <span>•</span>
        <span>Dataset: <span className="text-purple-400 font-semibold">NRSC VIC Baseline (2,275 Records)</span></span>
      </div>

      <div className="flex items-center space-x-4">
        <span>Channel: <span className="text-emerald-400 font-semibold">WebSocket SSL</span></span>
        <span>•</span>
        <span>Safety Protocol: <span className="text-sky-400 font-semibold">HUMAN-IN-THE-LOOP ACTIVE</span></span>
      </div>
    </div>
  )
}
