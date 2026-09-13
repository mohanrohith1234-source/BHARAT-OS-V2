'use client'

import { create } from 'zustand'

export type ProvenanceType = 'LIVE' | 'VERIFIED' | 'SIMULATION' | 'HISTORICAL'

export type DemoStage = 
  | 'IDLE'
  | 'HEAVY_RAIN'
  | 'WATER_RISING'
  | 'INCIDENT_DETECTED'
  | 'AI_TRIAGE'
  | 'OFFICER_APPROVED'
  | 'UNITS_DISPATCHED'
  | 'WATER_DRAINED'
  | 'RESOLVED'

export interface OperationalIncident {
  id: string
  ticketNumber: string
  title: string
  location: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'assigned' | 'in_progress' | 'resolved'
  waterDepthCm: number
  peopleAtRisk: number
  assignedUnits: string[]
  aiRecommendation: string
  humanSignOff: boolean
  signedBy?: string
  provenance: ProvenanceType
}

export interface OperationalResource {
  id: string
  callSign: string
  type: 'police' | 'ambulance' | 'fire' | 'pump' | 'traffic'
  department: string
  personnel: string
  status: 'available' | 'en_route' | 'on_scene' | 'operating'
  location: string
  eta: string
  batteryFuel: string
  speed: string
  provenance: ProvenanceType
}

export interface TrafficCorridor {
  id: string
  name: string
  status: 'OPEN' | 'CONGESTED' | 'CLOSED_FLOOD' | 'EMERGENCY_CORRIDOR'
  speedKmH: number
  travelTimeMins: number
  provenance: ProvenanceType
}

export interface SensorReading {
  id: string
  name: string
  location: string
  levelCm: number
  thresholdCm: number
  flowRateLps: number
  status: 'NORMAL' | 'WARNING' | 'CRITICAL'
  provenance: ProvenanceType
}

export interface HospitalFacility {
  id: string
  name: string
  erLoad: string
  icuAvailable: number
  traumaLevel: string
  status: 'OPTIMAL' | 'BUSY' | 'OVERLOAD'
  provenance: ProvenanceType
}

interface VizagDataStore {
  demoStage: DemoStage
  demoRunning: boolean
  demoIntervalId: any

  incident: OperationalIncident
  resources: Record<string, OperationalResource>
  trafficCorridors: Record<string, TrafficCorridor>
  sensors: Record<string, SensorReading>
  hospitals: Record<string, HospitalFacility>

  setDemoStage: (stage: DemoStage) => void
  startDemo: () => void
  pauseDemo: () => void
  stepForward: () => void
  resetDemo: () => void
  approveIncidentAction: (officerName: string) => void
  updateResourceStatus: (id: string, status: OperationalResource['status'], location?: string) => void
  updateCorridorStatus: (id: string, status: TrafficCorridor['status']) => void
}

const INITIAL_INCIDENT: OperationalIncident = {
  id: 'inc-1042',
  ticketNumber: 'INC-1042',
  title: 'Beach Road Waterlogging & Culvert Outfall Choke',
  location: 'Beach Road Sector 4 / MVP Outfall',
  severity: 'critical',
  status: 'active',
  waterDepthCm: 48,
  peopleAtRisk: 140,
  assignedUnits: ['P-305', 'FT-12', 'A-21'],
  aiRecommendation: 'Deploy High-Volume Dewatering Pump DP-04, divert non-emergency transit via NH16 bypass, escort A-21 through Ram Nagar.',
  humanSignOff: false,
  provenance: 'SIMULATION'
}

const INITIAL_RESOURCES: Record<string, OperationalResource> = {
  'P-101': {
    id: 'P-101',
    callSign: 'CHARLIE-1',
    type: 'police',
    department: 'Police',
    personnel: 'Inspector K. Raju (3 Officers)',
    status: 'en_route',
    location: 'MVP Colony Double Road',
    eta: '3 mins',
    batteryFuel: '82% EV',
    speed: '36 km/h',
    provenance: 'LIVE'
  },
  'P-305': {
    id: 'P-305',
    callSign: 'ALPHA-2',
    type: 'police',
    department: 'Police',
    personnel: 'Inspector S. Lakshmi (3 Officers)',
    status: 'on_scene',
    location: 'Beach Road Bypass Junction',
    eta: 'On Scene',
    batteryFuel: '74% EV',
    speed: '0 km/h',
    provenance: 'LIVE'
  },
  'FT-12': {
    id: 'FT-12',
    callSign: 'HAZMAT-12',
    type: 'fire',
    department: 'Fire & Hazmat',
    personnel: 'Station Officer V. Naidu (6 Crew)',
    status: 'on_scene',
    location: 'Beach Road Sector 4 Culvert',
    eta: 'Operating',
    batteryFuel: '90% Diesel',
    speed: '0 km/h',
    provenance: 'VERIFIED'
  },
  'A-21': {
    id: 'A-21',
    callSign: 'MEDIC-21',
    type: 'ambulance',
    department: 'EMS Ambulance',
    personnel: 'Driver R. Rao / Paramedic G. Swetha',
    status: 'en_route',
    location: 'Siripuram Road -> Beach Road',
    eta: '4 mins',
    batteryFuel: '84% EV',
    speed: '42 km/h',
    provenance: 'LIVE'
  },
  'DP-04': {
    id: 'DP-04',
    callSign: 'PUMP-04',
    type: 'pump',
    department: 'GVMC Stormwater',
    personnel: '2 Municipal Operators',
    status: 'operating',
    location: 'Beach Road Sector 4 Sump',
    eta: 'Active 2200 L/min',
    batteryFuel: '95% Generator',
    speed: '0 km/h',
    provenance: 'VERIFIED'
  }
}

const INITIAL_CORRIDORS: Record<string, TrafficCorridor> = {
  'beach-road': {
    id: 'beach-road',
    name: 'Beach Road Corridor (RK Beach to MVP)',
    status: 'CLOSED_FLOOD',
    speedKmH: 0,
    travelTimeMins: 45,
    provenance: 'LIVE'
  },
  'nh16-bypass': {
    id: 'nh16-bypass',
    name: 'NH16 North Bypass (Recommended Detour)',
    status: 'EMERGENCY_CORRIDOR',
    speedKmH: 52,
    travelTimeMins: 14,
    provenance: 'VERIFIED'
  },
  'vip-road': {
    id: 'vip-road',
    name: 'VIP Road -> Siripuram Junction',
    status: 'CONGESTED',
    speedKmH: 22,
    travelTimeMins: 24,
    provenance: 'LIVE'
  },
  'ram-nagar': {
    id: 'ram-nagar',
    name: 'Ram Nagar Hospital Green Corridor',
    status: 'EMERGENCY_CORRIDOR',
    speedKmH: 48,
    travelTimeMins: 6,
    provenance: 'VERIFIED'
  }
}

const INITIAL_SENSORS: Record<string, SensorReading> = {
  'beach-node-1': {
    id: 'beach-node-1',
    name: 'Beach Road Sump Sensor #1',
    location: 'Beach Road Sector 4',
    levelCm: 48,
    thresholdCm: 35,
    flowRateLps: 420,
    status: 'CRITICAL',
    provenance: 'LIVE'
  },
  'mudasarlova-2': {
    id: 'mudasarlova-2',
    name: 'Mudasarlova Reservoir Spillway',
    location: 'Mudasarlova Catchment',
    levelCm: 22,
    thresholdCm: 30,
    flowRateLps: 180,
    status: 'NORMAL',
    provenance: 'VERIFIED'
  },
  'gajuwaka-3': {
    id: 'gajuwaka-3',
    name: 'Gajuwaka Industrial Drain',
    location: 'Gajuwaka Industrial Hub',
    levelCm: 29,
    thresholdCm: 32,
    flowRateLps: 260,
    status: 'WARNING',
    provenance: 'LIVE'
  }
}

const INITIAL_HOSPITALS: Record<string, HospitalFacility> = {
  'ntr-general': {
    id: 'ntr-general',
    name: 'NTR General Hospital',
    erLoad: '72% ER Capacity',
    icuAvailable: 6,
    traumaLevel: 'Level 1 Trauma',
    status: 'OPTIMAL',
    provenance: 'VERIFIED'
  },
  'seven-hills': {
    id: 'seven-hills',
    name: 'Seven Hills Clinic',
    erLoad: '54% ER Capacity',
    icuAvailable: 12,
    traumaLevel: 'Level 2 Trauma',
    status: 'OPTIMAL',
    provenance: 'VERIFIED'
  }
}

export const useVizagDataStore = create<VizagDataStore>((set, get) => ({
  demoStage: 'IDLE',
  demoRunning: false,
  demoIntervalId: null,

  incident: INITIAL_INCIDENT,
  resources: INITIAL_RESOURCES,
  trafficCorridors: INITIAL_CORRIDORS,
  sensors: INITIAL_SENSORS,
  hospitals: INITIAL_HOSPITALS,

  setDemoStage: (stage: DemoStage) => {
    set((state) => {
      let updatedIncident = { ...state.incident }
      let updatedSensors = { ...state.sensors }
      let updatedCorridors = { ...state.trafficCorridors }
      let updatedResources = { ...state.resources }

      if (stage === 'IDLE') {
        return {
          demoStage: 'IDLE',
          incident: INITIAL_INCIDENT,
          resources: INITIAL_RESOURCES,
          trafficCorridors: INITIAL_CORRIDORS,
          sensors: INITIAL_SENSORS,
          hospitals: INITIAL_HOSPITALS
        }
      }

      if (stage === 'HEAVY_RAIN') {
        updatedSensors['beach-node-1'].levelCm = 28
        updatedSensors['beach-node-1'].status = 'WARNING'
      } else if (stage === 'WATER_RISING') {
        updatedSensors['beach-node-1'].levelCm = 42
        updatedSensors['beach-node-1'].status = 'CRITICAL'
        updatedCorridors['beach-road'].status = 'CONGESTED'
      } else if (stage === 'INCIDENT_DETECTED') {
        updatedIncident.status = 'active'
        updatedIncident.waterDepthCm = 48
        updatedCorridors['beach-road'].status = 'CLOSED_FLOOD'
      } else if (stage === 'AI_TRIAGE') {
        updatedIncident.aiRecommendation = 'AI TRIAGE: Divert non-emergency traffic to NH16. Dispatch FT-12 with Pump DP-04. Clear Ram Nagar Green Corridor for A-21.'
      } else if (stage === 'OFFICER_APPROVED') {
        updatedIncident.humanSignOff = true
        updatedIncident.signedBy = 'Operations Chief K. Sharma (Badge #4092)'
        updatedIncident.status = 'assigned'
      } else if (stage === 'UNITS_DISPATCHED') {
        updatedIncident.status = 'in_progress'
        updatedResources['A-21'].status = 'on_scene'
        updatedResources['A-21'].location = 'Beach Road Sector 4'
        updatedResources['A-21'].eta = 'On Scene'
        updatedResources['FT-12'].status = 'operating'
        updatedResources['P-305'].status = 'on_scene'
      } else if (stage === 'WATER_DRAINED') {
        updatedSensors['beach-node-1'].levelCm = 18
        updatedSensors['beach-node-1'].status = 'NORMAL'
        updatedIncident.waterDepthCm = 12
        updatedCorridors['beach-road'].status = 'OPEN'
        updatedCorridors['beach-road'].speedKmH = 35
      } else if (stage === 'RESOLVED') {
        updatedIncident.status = 'resolved'
        updatedIncident.waterDepthCm = 4
        updatedResources['A-21'].status = 'available'
        updatedResources['FT-12'].status = 'available'
      }

      return {
        demoStage: stage,
        incident: updatedIncident,
        sensors: updatedSensors,
        trafficCorridors: updatedCorridors,
        resources: updatedResources
      }
    })
  },

  startDemo: () => {
    const { pauseDemo } = get()
    pauseDemo()
    set({ demoRunning: true })

    const stages: DemoStage[] = [
      'HEAVY_RAIN',
      'WATER_RISING',
      'INCIDENT_DETECTED',
      'AI_TRIAGE',
      'OFFICER_APPROVED',
      'UNITS_DISPATCHED',
      'WATER_DRAINED',
      'RESOLVED'
    ]

    const intervalId = setInterval(() => {
      const current = get().demoStage
      const currentIndex = stages.indexOf(current)
      if (currentIndex === -1 || currentIndex >= stages.length - 1) {
        get().setDemoStage(stages[0])
      } else {
        get().setDemoStage(stages[currentIndex + 1])
      }
    }, 4500)

    set({ demoIntervalId: intervalId })
  },

  pauseDemo: () => {
    const { demoIntervalId } = get()
    if (demoIntervalId) clearInterval(demoIntervalId)
    set({ demoRunning: false, demoIntervalId: null })
  },

  stepForward: () => {
    const stages: DemoStage[] = [
      'IDLE',
      'HEAVY_RAIN',
      'WATER_RISING',
      'INCIDENT_DETECTED',
      'AI_TRIAGE',
      'OFFICER_APPROVED',
      'UNITS_DISPATCHED',
      'WATER_DRAINED',
      'RESOLVED'
    ]
    const current = get().demoStage
    const idx = stages.indexOf(current)
    const nextIdx = (idx + 1) % stages.length
    get().setDemoStage(stages[nextIdx])
  },

  resetDemo: () => {
    get().pauseDemo()
    get().setDemoStage('IDLE')
  },

  approveIncidentAction: (officerName: string) => {
    set((state) => ({
      incident: {
        ...state.incident,
        humanSignOff: true,
        signedBy: officerName,
        status: 'in_progress'
      }
    }))
  },

  updateResourceStatus: (id, status, location) => {
    set((state) => {
      const res = state.resources[id]
      if (!res) return state
      return {
        resources: {
          ...state.resources,
          [id]: {
            ...res,
            status,
            ...(location ? { location } : {})
          }
        }
      }
    })
  },

  updateCorridorStatus: (id, status) => {
    set((state) => {
      const c = state.trafficCorridors[id]
      if (!c) return state
      return {
        trafficCorridors: {
          ...state.trafficCorridors,
          [id]: {
            ...c,
            status
          }
        }
      }
    })
  }
}))
