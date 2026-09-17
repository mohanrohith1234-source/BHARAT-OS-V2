'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Activity, Play, RotateCcw, AlertTriangle, ArrowRight, Shield, Zap } from 'lucide-react'
import { useVizagDataStore, DemoStage } from '../../store/useVizagDataStore'

export type ScenarioType = 'Heavy Rain' | 'Cyclone' | 'Chemical Fire' | 'Road Accident' | 'Flood'

interface ScenarioSimulatorWidgetProps {
  onScenarioChange?: (scenario: ScenarioType) => void
}

export default function ScenarioSimulatorWidget({ onScenarioChange }: ScenarioSimulatorWidgetProps) {
  const { demoStage, simulationTime, setDemoStage, resetDemo } = useVizagDataStore()
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('Flood')
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSelect = (sc: ScenarioType) => {
    setActiveScenario(sc)
    if (onScenarioChange) onScenarioChange(sc)
  }

  const handleRunSimulation = () => {
    setIsSimulating(true)
    // Advance simulation sequence in global store
    setDemoStage('T15_WARD_RISK')
    setTimeout(() => {
      setIsSimulating(false)
    }, 800)
  }

  const getScenarioDetails = (sc: ScenarioType) => {
    switch (sc) {
      case 'Cyclone':
        return {
          intensity: 'Category 3 Coastal Cyclone Alert',
          impact: 'Predicted wind gusts 110 km/h, 95mm precipitation over coastal wards.',
          recommendation: 'Initiate evacuation of 1,200 ground-floor coastal residents to Sector 3 shelters.',
          targetWard: 'Ward 14 (Gangavaram Coastal Belt)'
        }
      case 'Chemical Fire':
        return {
          intensity: 'Hazmat Level 2 Industrial Alarm',
          impact: 'Toxic vapor cloud threat near Gajuwaka Industrial Zone Ward 45.',
          recommendation: 'Deploy 4 Hazmat Fire Tenders and issue air quality stay-indoors order.',
          targetWard: 'Ward 45 (Gajuwaka Industrial)'
        }
      case 'Road Accident':
        return {
          intensity: 'NH16 Multi-Vehicle Collision',
          impact: 'Highway traffic gridlock extended over 4.5 km corridor near Maddilapalem.',
          recommendation: 'Dispatch 3 heavy tow cranes and route traffic via Inner Ring Road bypass.',
          targetWard: 'Ward 08 (Maddilapalem Highway)'
        }
      case 'Heavy Rain':
        return {
          intensity: 'Monsoonal Downpour (55mm/h)',
          impact: 'Flash urban surface water accumulation across low-lying zones.',
          recommendation: 'Activate municipal storm pumps across all 6 zones.',
          targetWard: 'Ward 12 & Ward 16 Low-Lying'
        }
      case 'Flood': default:
        return {
          intensity: 'Coastal Inundation & Culvert Choke (SIH Hero)',
          impact: 'Ward 12 storm drain depth breached 35cm safety threshold. 140 residents at risk.',
          recommendation: 'Deploy Pump DP-04, Hazmat Tender FT-12, and redirect traffic via NH16 bypass.',
          targetWard: 'Ward 12 (MVP Colony & RK Beach Outfall)'
        }
    }
  }

  const details = getScenarioDetails(activeScenario)

  return (
    <div className="rounded-2xl border border-purple-900/50 bg-[#070b16] p-5 space-y-4 shadow-2xl font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-950 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-purple-400 animate-pulse" />
          <h4 className="text-xs font-black uppercase tracking-wider text-white">
            EMERGENCY SCENARIO SIMULATOR (CONTROLLED DEMO)
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-purple-400 bg-purple-950/80 border border-purple-800/60 px-2.5 py-0.5 rounded font-bold uppercase">
            SIMULATION MODE ACTIVE
          </span>
        </div>
      </div>

      {/* Scenario Selection Buttons */}
      <div className="flex flex-wrap gap-2 text-xs">
        {(['Flood', 'Heavy Rain', 'Cyclone', 'Chemical Fire', 'Road Accident'] as const).map((sc) => (
          <button
            key={sc}
            onClick={() => handleSelect(sc)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all text-xs uppercase cursor-pointer ${
              activeScenario === sc
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                : 'bg-black/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {sc === 'Flood' ? '🌊 Urban Flood (SIH)' : sc}
          </button>
        ))}
      </div>

      {/* Dynamic Simulation Output Box */}
      <div className="rounded-xl border border-slate-800 bg-black/50 p-4 space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="font-bold text-white uppercase tracking-wider">{details.intensity}</span>
          <span className="text-[10px] text-purple-400 font-mono font-bold">📍 {details.targetWard}</span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{details.impact}</p>

        <div className="pt-2 border-t border-slate-900 text-[11px] text-emerald-400 font-semibold flex items-start space-x-2">
          <Shield className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <span className="font-sans">Action Directives: {details.recommendation}</span>
        </div>
      </div>

      {/* Actions Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase transition-all shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'SIMULATING...' : 'EXECUTE SCENARIO'}</span>
          </button>

          <button
            onClick={resetDemo}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>

        <Link
          href="/dashboard/district"
          className="text-sky-400 hover:text-sky-300 text-xs font-bold flex items-center gap-1.5 self-end sm:self-auto"
        >
          <span>Open Incident Command</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
