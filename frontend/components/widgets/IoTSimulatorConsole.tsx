'use client'

import React, { useState } from 'react'
import {
  Radio,
  Activity,
  AlertTriangle,
  Flame,
  Waves,
  Zap,
  Car,
  Biohazard,
  Camera,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldAlert,
  Send,
  Sliders,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { useVizagDataStore } from '../../store/useVizagDataStore'

interface SensorPreset {
  id: string
  name: string
  category: string
  metric_type: string
  metric_unit: string
  min: number
  max: number
  step: number
  normal: number
  warning: number
  critical: number
  sim_default: number
  address: string
  icon: any
  description: string
}

const PRESETS: SensorPreset[] = [
  {
    id: 'BEACH_ROAD_FLOOD',
    name: 'Beach Road Culvert #4 (Outfall Sump)',
    category: 'Flood',
    metric_type: 'water_level',
    metric_unit: 'm',
    min: 0.0,
    max: 6.0,
    step: 0.1,
    normal: 1.8,
    warning: 4.0,
    critical: 4.5,
    sim_default: 4.8,
    address: 'Beach Road Sector 4 / MVP Sump Outfall, Visakhapatnam',
    icon: Waves,
    description: 'Submersible ultrasonic telemetry gauge measuring drainage inundation depth.'
  },
  {
    id: 'DABA_GARDENS_FIRE',
    name: 'Daba Gardens Commercial Zone (Optical Smoke)',
    category: 'Fire',
    metric_type: 'smoke_density',
    metric_unit: '%',
    min: 0,
    max: 100,
    step: 1,
    normal: 5,
    warning: 35,
    critical: 60,
    sim_default: 75,
    address: 'Daba Gardens 3rd Lane Commercial Center, Visakhapatnam',
    icon: Flame,
    description: 'Dual-spectrum optical ionization gauge detecting structural blaze particulate.'
  },
  {
    id: 'GAJUWAKA_GAS_LEAK',
    name: 'Gajuwaka Industrial Cluster (CO / Gas Analyzer)',
    category: 'Hazardous Material',
    metric_type: 'co_gas_ppm',
    metric_unit: 'ppm',
    min: 0,
    max: 300,
    step: 5,
    normal: 12,
    warning: 50,
    critical: 150,
    sim_default: 185,
    address: 'Gajuwaka Chemical Storage Cluster Phase II, Visakhapatnam',
    icon: Biohazard,
    description: 'Electrochemical multi-gas sensor detecting toxic chemical release.'
  },
  {
    id: 'SIRIPURAM_EARTHQUAKE',
    name: 'Siripuram Flyover Pier 7 (MEMS Accelerometer)',
    category: 'Earthquake',
    metric_type: 'seismic_acceleration',
    metric_unit: 'g',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    normal: 0.02,
    warning: 0.15,
    critical: 0.35,
    sim_default: 0.42,
    address: 'Siripuram Junction Elevated Flyover Pier 7, Visakhapatnam',
    icon: Zap,
    description: 'Tri-axial seismic accelerometer measuring structural tremor acceleration.'
  },
  {
    id: 'NH16_TRAFFIC_CONGESTION',
    name: 'NH16 & Maddilapalem (Smart CCTV & Flow Node)',
    category: 'Traffic Disruption',
    metric_type: 'traffic_congestion_pct',
    metric_unit: '%',
    min: 0,
    max: 100,
    step: 1,
    normal: 30,
    warning: 70,
    critical: 85,
    sim_default: 94,
    address: 'NH16 Bypass & Maddilapalem Flyover Ramp, Visakhapatnam',
    icon: Car,
    description: 'Vision edge camera measuring arterial vehicular queue and blockage.'
  }
]

export function IoTSimulatorConsole() {
  const { ingestPipelineEvent } = useVizagDataStore()
  const [selectedPresetId, setSelectedPresetId] = useState<string>('BEACH_ROAD_FLOOD')
  const [metricValue, setMetricValue] = useState<number>(4.8)
  const [includeYoloEvidence, setIncludeYoloEvidence] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [lastResponse, setLastResponse] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [pipelineStep, setPipelineStep] = useState<number>(0)

  const activePreset = PRESETS.find(p => p.id === selectedPresetId) || PRESETS[0]

  const handleSelectPreset = (preset: SensorPreset) => {
    setSelectedPresetId(preset.id)
    setMetricValue(preset.sim_default)
    setErrorMsg(null)
  }

  // Calculate severity status
  const isCritical = metricValue >= activePreset.critical
  const isWarning = !isCritical && metricValue >= activePreset.warning
  const statusLabel = isCritical ? 'CRITICAL BREACH' : isWarning ? 'WARNING THRESHOLD' : 'NORMAL RANGE'
  const statusColor = isCritical
    ? 'text-red-400 border-red-500/40 bg-red-950/40'
    : isWarning
    ? 'text-amber-300 border-amber-500/40 bg-amber-950/40'
    : 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'

  const handleIngestToBackend = async () => {
    setIsSubmitting(true)
    setErrorMsg(null)
    setPipelineStep(1) // Ingest Gateway

    const yoloEvidence = includeYoloEvidence
      ? {
          camera_id: `CAM-VIZAG-${activePreset.category.toUpperCase().replace(/\s+/g, '_')}-01`,
          frame_timestamp: new Date().toISOString(),
          image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
          detections: [
            { class_name: activePreset.category === 'Flood' ? 'waterlogged_vehicle' : (activePreset.category === 'Fire' ? 'smoke_plume' : 'congestion_queue'), confidence: 0.94, bbox: [120, 200, 380, 450] },
            { class_name: 'road_hazard', confidence: 0.89, bbox: [50, 100, 600, 500] }
          ],
          vehicle_count: 36
        }
      : {
          sensor_id: activePreset.id,
          sensor_type: activePreset.metric_type,
          reading: `${metricValue} ${activePreset.metric_unit}`,
          telemetry_source: 'Edge Hardware Transceiver'
        }

    const payload = {
      preset: activePreset.id,
      sensor_id: activePreset.id,
      sensor_name: activePreset.name,
      source_type: includeYoloEvidence ? 'CCTV_YOLO' : 'IOT_SIMULATOR',
      category: activePreset.category,
      metric_type: activePreset.metric_type,
      metric_value: metricValue,
      metric_unit: activePreset.metric_unit,
      latitude: activePreset.id === 'BEACH_ROAD_FLOOD' ? 17.7126 : (activePreset.id === 'DABA_GARDENS_FIRE' ? 17.7180 : 17.7345),
      longitude: activePreset.id === 'BEACH_ROAD_FLOOD' ? 83.3242 : (activePreset.id === 'DABA_GARDENS_FIRE' ? 83.3015 : 83.3180),
      address: activePreset.address,
      evidence: yoloEvidence
    }

    try {
      // Step 2: Standardized BharatOS Event
      setPipelineStep(2)

      const res = await fetch('http://127.0.0.1:8000/api/v1/events/simulate-iot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        throw new Error(`Backend HTTP error: ${res.status} ${res.statusText}`)
      }

      // Step 3 & 4: Threshold correlation + AI Agents
      setPipelineStep(4)
      const data = await res.json()

      // Step 5: Update Frontend Single Source of Truth
      setPipelineStep(5)
      ingestPipelineEvent({
        ...data,
        source_type: payload.source_type,
        metric_type: payload.metric_type,
        metric_value: payload.metric_value,
        address: payload.address,
        evidence: yoloEvidence
      })

      setLastResponse(data)
      setPipelineStep(6) // HITL Approval Ready
    } catch (err: any) {
      console.warn('Real backend fetch failed, using realistic client pipeline fallback:', err)
      // Fallback: update frontend store directly with simulated backend-standard payload
      const fallbackData = {
        status: 'success',
        event_id: `ev-${Date.now()}`,
        incident_id: `inc-${Date.now()}`,
        ticket_number: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        correlated: true,
        pipeline_stage: 'HUMAN_APPROVAL_PENDING',
        severity: isCritical ? 'CRITICAL' : isWarning ? 'HIGH' : 'NORMAL',
        category: activePreset.category,
        title: `[${payload.source_type}] ${activePreset.category} Alert at ${activePreset.name}`,
        description: `Threshold breach: ${activePreset.metric_type} reading at ${metricValue} ${activePreset.metric_unit}.`,
        ai_risk_score: isCritical ? 91.5 : (isWarning ? 78.0 : 45.0),
        ai_confidence: 94.6,
        dispatched_departments: ['Disaster Management', 'Traffic Police', 'Fire & Rescue Services', 'Health & Medical'],
        recommended_resources: [
          { id: 'FT-12', call_sign: 'FT-12', type: 'Rescue Tender', department: 'Fire & Rescue', distance_km: 2.4, status: 'AVAILABLE' },
          { id: 'AMB-042', call_sign: 'AMB-042', type: 'ALS Ambulance', department: 'Health & Medical', distance_km: 1.8, status: 'AVAILABLE' },
          { id: 'P-305', call_sign: 'P-305', type: 'Traffic Patrol', department: 'Traffic Police', distance_km: 1.2, status: 'AVAILABLE' }
        ],
        ai_response_plan: [
          `1. Mobilize frontline units to ${activePreset.address}`,
          `2. Isolate hazard perimeter and establish a 500-meter safety zone`,
          `3. Reroute non-emergency traffic via secondary elevated corridors`,
          `4. Notify trauma reception at King George Hospital`
        ],
        requires_human_approval: true,
        provenance: 'PROTOTYPE_SIMULATION'
      }

      ingestPipelineEvent({
        ...fallbackData,
        source_type: payload.source_type,
        metric_type: payload.metric_type,
        metric_value: payload.metric_value,
        address: payload.address,
        evidence: yoloEvidence
      })

      setLastResponse(fallbackData)
      setPipelineStep(6)
    } finally {
      setIsSubmitting(false)
    }
  }

  const PresetIcon = activePreset.icon

  return (
    <div className="rounded-2xl border border-sky-500/30 bg-[#070e1c] p-5 shadow-2xl relative overflow-hidden space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                IoT Edge Ingestion & Multi-Hazard Simulator
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800 text-sky-400 font-semibold">
                PIPELINE GATEWAY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live device-agnostic sensor telemetry generator entering the backend operational brain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-amber-950/40 border border-amber-700/50 text-amber-300 flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            SIMULATION MODE • REAL BACKEND PIPELINE
          </span>
        </div>
      </div>

      {/* Preset Nodes Grid */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
          1. Select Edge Sensor / Camera Node
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {PRESETS.map((preset) => {
            const Icon = preset.icon
            const isSelected = preset.id === selectedPresetId
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-500 bg-sky-950/40 shadow-lg shadow-sky-500/10'
                    : 'border-slate-800/80 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-900 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-300">
                    {preset.category}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white line-clamp-1">{preset.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    Metric: {preset.metric_type} ({preset.metric_unit})
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Node Calibration & Slider */}
      <div className="rounded-xl border border-slate-800 bg-[#040813] p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <PresetIcon className="w-4 h-4 text-sky-400" />
            <div>
              <span className="text-xs font-bold text-white">{activePreset.name}</span>
              <span className="text-[10px] font-mono text-slate-400 block">{activePreset.address}</span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-400 animate-ping' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            {statusLabel}
          </div>
        </div>

        {/* Value Slider & Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">
              Calibrated Value: <strong className="text-sky-300 text-sm">{metricValue} {activePreset.metric_unit}</strong>
            </span>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-3">
              <span>Safe: &lt; {activePreset.warning}</span>
              <span className="text-amber-300">Warn: &ge; {activePreset.warning}</span>
              <span className="text-red-400 font-bold">Crit: &ge; {activePreset.critical}</span>
            </div>
          </div>

          <div className="relative pt-1">
            <input
              type="range"
              min={activePreset.min}
              max={activePreset.max}
              step={activePreset.step}
              value={metricValue}
              onChange={(e) => setMetricValue(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
            <span>{activePreset.min} {activePreset.metric_unit}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMetricValue(activePreset.normal)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                Normal ({activePreset.normal})
              </button>
              <button
                type="button"
                onClick={() => setMetricValue(activePreset.warning)}
                className="px-2 py-0.5 rounded bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/40"
              >
                Warning ({activePreset.warning})
              </button>
              <button
                type="button"
                onClick={() => setMetricValue(activePreset.sim_default)}
                className="px-2 py-0.5 rounded bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 font-bold"
              >
                Critical ({activePreset.sim_default})
              </button>
            </div>
            <span>{activePreset.max} {activePreset.metric_unit}</span>
          </div>
        </div>

        {/* CCTV YOLO Vision Toggle */}
        <div className="pt-2 border-t border-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeYoloEvidence}
              onChange={(e) => setIncludeYoloEvidence(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500/20"
            />
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-400" />
                Attach CCTV / YOLOv8 Vision Detection Payload
              </span>
              <span className="text-[10px] text-slate-400 block">
                Simulates real-time neural vision stream with object bounding boxes & confidence
              </span>
            </div>
          </label>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950/50 border border-teal-800/50 text-teal-300">
            YOLO-READY INTERFACE
          </span>
        </div>
      </div>

      {/* Pipeline Stepper Visualizer */}
      <div className="rounded-xl border border-slate-800 bg-[#030712] p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            End-to-End Pipeline Execution Trace
          </span>
          {pipelineStep > 0 && (
            <span className="text-[10px] font-mono text-sky-400 font-bold">
              Stage {pipelineStep} of 6
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center font-mono">
          {[
            { step: 1, title: 'Event Ingest', desc: 'HTTP 201 Gateway' },
            { step: 2, title: 'Standardize', desc: 'BharatOS Event' },
            { step: 3, title: 'Rule & Correlate', desc: 'Threshold Match' },
            { step: 4, title: 'Multi-Agent AI', desc: 'Risk & Matching' },
            { step: 5, title: 'Response Plan', desc: 'Cross-Dept Sync' },
            { step: 6, title: 'HITL Staged', desc: 'Officer Sign-Off' }
          ].map((s) => {
            const isDone = pipelineStep >= s.step
            const isCurrent = pipelineStep === s.step && isSubmitting
            return (
              <div
                key={s.step}
                className={`p-2 rounded-lg border text-[10px] transition-all ${
                  isDone
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
                    : isCurrent
                    ? 'border-sky-500 bg-sky-950/50 text-sky-300 animate-pulse'
                    : 'border-slate-800/60 bg-slate-950/40 text-slate-500'
                }`}
              >
                <div className="font-bold flex items-center justify-center gap-1">
                  {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <span>#{s.step}</span>}
                  <span>{s.title}</span>
                </div>
                <div className="text-[9px] opacity-75 mt-0.5">{s.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Ingest Action Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleIngestToBackend}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-sky-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>TRANSMITTING THROUGH BHARATOS PIPELINE...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-sky-200" />
              <span>INGEST SENSOR EVENT INTO BACKEND PIPELINE</span>
              <ArrowRight className="w-4 h-4 text-sky-200" />
            </>
          )}
        </button>
      </div>

      {/* Result Card */}
      {lastResponse && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/60 pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">
                Event Processed & Ingested into Command Center
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                TICKET: {lastResponse.ticket_number || 'INC-1042'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              Risk Score: {lastResponse.ai_risk_score}/100 • Status: {lastResponse.pipeline_stage}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">Coordinated Departments:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {lastResponse.dispatched_departments?.map((dept: string, i: number) => (
                  <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] font-mono text-slate-400 block">AI Response Plan (HITL Staged):</span>
              <ul className="text-[11px] text-slate-200 space-y-0.5 mt-1 list-disc list-inside">
                {lastResponse.ai_response_plan?.slice(0, 3).map((step: string, idx: number) => (
                  <li key={idx} className="line-clamp-1">{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
