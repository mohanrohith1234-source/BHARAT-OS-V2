'use client'

import { create } from 'zustand'

export type ProvenanceType = 
  | 'LIVE' 
  | 'REAL_IOT' 
  | 'VERIFIED' 
  | 'HISTORICAL' 
  | 'SIMULATION' 
  | 'AI_DERIVED' 
  | 'CACHED'

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

export type SimulationTime = 
  | 'T+00'
  | 'T+05'
  | 'T+10'
  | 'T+15'
  | 'T+20'
  | 'T+25'
  | 'T+30'
  | 'T+35'
  | 'T+45'
  | 'T+60'

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
  status: 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'operating' | 'resolved'
  location: string
  coords: [number, number]
  eta: string
  batteryFuel: string
  speed: string
  currentAssignment?: string
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
  drainLevelPct: number
  flowRateLps: number
  sensorHealth: 'OPTIMAL' | 'DEGRADED' | 'WARNING' | 'CRITICAL'
  batteryPct: number
  connectivity: string
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
  simulationTime: SimulationTime
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
  updateResourceStatus: (id: string, status: OperationalResource['status'], location?: string, coords?: [number, number]) => void
  updateCorridorStatus: (id: string, status: TrafficCorridor['status']) => void
}

const INITIAL_INCIDENT: OperationalIncident = {
  id: 'inc-1042',
  ticketNumber: 'INC-1042',
  title: 'Beach Road Waterlogging & Culvert Outfall Choke',
  location: 'Beach Road Sector 4 / MVP Outfall',
  severity: 'critical',
  status: 'active',
  waterDepthCm: 18,
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
    status: 'available',
    location: 'MVP Colony Sector 2',
    coords: [17.7200, 83.3150],
    eta: '3 mins',
    batteryFuel: '82% EV',
    speed: '32 km/h',
    currentAssignment: 'Zone Sector Routine Patrol',
    provenance: 'LIVE'
  },
  'P-305': {
    id: 'P-305',
    callSign: 'ALPHA-2',
    type: 'police',
    department: 'Police',
    personnel: 'Inspector S. Lakshmi (3 Officers)',
    status: 'available',
    location: 'Beach Road Bypass Junction',
    coords: [17.7050, 83.2850],
    eta: 'Standby',
    batteryFuel: '74% EV',
    speed: '0 km/h',
    currentAssignment: 'Standby for Traffic Diversion',
    provenance: 'LIVE'
  },
  'FT-12': {
    id: 'FT-12',
    callSign: 'HAZMAT-12',
    type: 'fire',
    department: 'Fire & Hazmat',
    personnel: 'Station Officer V. Naidu (6 Crew)',
    status: 'available',
    location: 'Suryabagh Fire Station',
    coords: [17.6850, 83.2200],
    eta: 'Standby',
    batteryFuel: '90% Diesel',
    speed: '0 km/h',
    currentAssignment: 'Staging High-Volume Pump DP-04',
    provenance: 'VERIFIED'
  },
  'A-21': {
    id: 'A-21',
    callSign: 'MEDIC-21',
    type: 'ambulance',
    department: 'EMS Ambulance',
    personnel: 'Driver R. Rao / Paramedic G. Swetha',
    status: 'available',
    location: 'Siripuram Station Base',
    coords: [17.7120, 83.3050],
    eta: 'Standby',
    batteryFuel: '84% EV',
    speed: '0 km/h',
    currentAssignment: 'Standby for Medical Evacuation',
    provenance: 'LIVE'
  },
  'DP-04': {
    id: 'DP-04',
    callSign: 'PUMP-04',
    type: 'pump',
    department: 'GVMC Stormwater',
    personnel: '2 Municipal Operators',
    status: 'available',
    location: 'Beach Road Sector 4 Sump',
    coords: [17.7210, 83.3180],
    eta: 'Ready',
    batteryFuel: '95% Generator',
    speed: '0 km/h',
    currentAssignment: 'Stormwater Outfall Dewatering',
    provenance: 'VERIFIED'
  }
}

const INITIAL_CORRIDORS: Record<string, TrafficCorridor> = {
  'beach-road': {
    id: 'beach-road',
    name: 'Beach Road Corridor (RK Beach to MVP)',
    status: 'OPEN',
    speedKmH: 42,
    travelTimeMins: 12,
    provenance: 'LIVE'
  },
  'nh16-bypass': {
    id: 'nh16-bypass',
    name: 'NH16 North Bypass (Recommended Detour)',
    status: 'OPEN',
    speedKmH: 60,
    travelTimeMins: 11,
    provenance: 'VERIFIED'
  },
  'vip-road': {
    id: 'vip-road',
    name: 'VIP Road -> Siripuram Junction',
    status: 'OPEN',
    speedKmH: 38,
    travelTimeMins: 14,
    provenance: 'LIVE'
  },
  'ram-nagar': {
    id: 'ram-nagar',
    name: 'Ram Nagar Hospital Green Corridor',
    status: 'OPEN',
    speedKmH: 45,
    travelTimeMins: 7,
    provenance: 'VERIFIED'
  }
}

const INITIAL_SENSORS: Record<string, SensorReading> = {
  'beach-node-1': {
    id: 'beach-node-1',
    name: 'Beach Road Sump Sensor #1',
    location: 'Beach Road Sector 4',
    levelCm: 18,
    thresholdCm: 35,
    drainLevelPct: 35,
    flowRateLps: 120,
    sensorHealth: 'OPTIMAL',
    batteryPct: 94,
    connectivity: 'ONLINE_5G',
    status: 'NORMAL',
    provenance: 'REAL_IOT'
  },
  'mvp-node-2': {
    id: 'mvp-node-2',
    name: 'MVP Colony Sector 2 Canal',
    location: 'MVP Double Road Inflow',
    levelCm: 16,
    thresholdCm: 30,
    drainLevelPct: 30,
    flowRateLps: 90,
    sensorHealth: 'OPTIMAL',
    batteryPct: 88,
    connectivity: 'LORA_WAN',
    status: 'NORMAL',
    provenance: 'REAL_IOT'
  },
  'mudasarlova-4': {
    id: 'mudasarlova-4',
    name: 'Mudasarlova Reservoir Spillway',
    location: 'Mudasarlova Catchment',
    levelCm: 20,
    thresholdCm: 30,
    drainLevelPct: 40,
    flowRateLps: 180,
    sensorHealth: 'OPTIMAL',
    batteryPct: 96,
    connectivity: 'CELLULAR_LTE',
    status: 'NORMAL',
    provenance: 'VERIFIED'
  },
  'gajuwaka-3': {
    id: 'gajuwaka-3',
    name: 'Gajuwaka Industrial Drain',
    location: 'Gajuwaka Industrial Hub',
    levelCm: 22,
    thresholdCm: 32,
    drainLevelPct: 42,
    flowRateLps: 160,
    sensorHealth: 'OPTIMAL',
    batteryPct: 91,
    connectivity: 'SIMULATED',
    status: 'NORMAL',
    provenance: 'SIMULATION'
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

const STAGE_TIME_MAP: Record<DemoStage, SimulationTime> = {
  IDLE: 'T+00',
  HEAVY_RAIN: 'T+05',
  WATER_RISING: 'T+15',
  INCIDENT_DETECTED: 'T+20',
  AI_TRIAGE: 'T+25',
  OFFICER_APPROVED: 'T+30',
  UNITS_DISPATCHED: 'T+35',
  WATER_DRAINED: 'T+45',
  RESOLVED: 'T+60'
}

export const useVizagDataStore = create<VizagDataStore>((set, get) => ({
  demoStage: 'IDLE',
  simulationTime: 'T+00',
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
      const simTime = STAGE_TIME_MAP[stage] || 'T+00'

      if (stage === 'IDLE') {
        return {
          demoStage: 'IDLE',
          simulationTime: 'T+00',
          incident: INITIAL_INCIDENT,
          resources: INITIAL_RESOURCES,
          trafficCorridors: INITIAL_CORRIDORS,
          sensors: INITIAL_SENSORS,
          hospitals: INITIAL_HOSPITALS
        }
      }

      if (stage === 'HEAVY_RAIN') {
        // T+05: Rain starts, sensors begin registering inflow
        updatedSensors['beach-node-1'].levelCm = 28
        updatedSensors['beach-node-1'].drainLevelPct = 58
        updatedSensors['beach-node-1'].flowRateLps = 240
        updatedSensors['beach-node-1'].status = 'WARNING'

        updatedSensors['mudasarlova-4'].levelCm = 24
        updatedSensors['mudasarlova-4'].drainLevelPct = 52
        updatedSensors['mudasarlova-4'].flowRateLps = 220

        updatedCorridors['beach-road'].speedKmH = 32
        updatedCorridors['beach-road'].status = 'OPEN'
      } else if (stage === 'WATER_RISING') {
        // T+15: Culvert threshold exceeded
        updatedSensors['beach-node-1'].levelCm = 42
        updatedSensors['beach-node-1'].drainLevelPct = 84
        updatedSensors['beach-node-1'].flowRateLps = 380
        updatedSensors['beach-node-1'].status = 'CRITICAL'

        updatedSensors['mvp-node-2'].levelCm = 29
        updatedSensors['mvp-node-2'].drainLevelPct = 72
        updatedSensors['mvp-node-2'].status = 'WARNING'

        updatedCorridors['beach-road'].status = 'CONGESTED'
        updatedCorridors['beach-road'].speedKmH = 15
        updatedCorridors['vip-road'].status = 'CONGESTED'
      } else if (stage === 'INCIDENT_DETECTED') {
        // T+20: Incident logged
        updatedIncident.status = 'active'
        updatedIncident.waterDepthCm = 48
        updatedSensors['beach-node-1'].levelCm = 48
        updatedSensors['beach-node-1'].drainLevelPct = 96
        updatedSensors['beach-node-1'].sensorHealth = 'CRITICAL'
        updatedCorridors['beach-road'].status = 'CLOSED_FLOOD'
        updatedCorridors['beach-road'].speedKmH = 0
      } else if (stage === 'AI_TRIAGE') {
        // T+25: AI recommendation generated
        updatedIncident.aiRecommendation = 'AI TRIAGE: Divert non-emergency traffic to NH16. Dispatch FT-12 with Pump DP-04. Clear Ram Nagar Green Corridor for A-21.'
        updatedIncident.waterDepthCm = 50
      } else if (stage === 'OFFICER_APPROVED') {
        // T+30: Human authorization confirmed
        updatedIncident.humanSignOff = true
        updatedIncident.signedBy = 'Operations Chief K. Sharma (Badge #4092)'
        updatedIncident.status = 'assigned'
        
        // Resources transition to dispatched
        updatedResources['P-305'].status = 'dispatched'
        updatedResources['P-305'].currentAssignment = 'En route to Beach Road Bypass closure'
        updatedResources['FT-12'].status = 'dispatched'
        updatedResources['FT-12'].currentAssignment = 'Deploying High-Volume Pump DP-04'
        updatedResources['A-21'].status = 'dispatched'
        updatedResources['A-21'].currentAssignment = 'Deploying via Ram Nagar Green Corridor'
      } else if (stage === 'UNITS_DISPATCHED') {
        // T+35: Vehicles en route / moving towards scene
        updatedIncident.status = 'in_progress'
        
        // Vehicle interpolated coordinates
        updatedResources['P-305'].status = 'en_route'
        updatedResources['P-305'].coords = [17.7140, 83.3020]
        updatedResources['P-305'].speed = '45 km/h'
        updatedResources['P-305'].eta = '1 min'

        updatedResources['FT-12'].status = 'en_route'
        updatedResources['FT-12'].coords = [17.7020, 83.2700]
        updatedResources['FT-12'].speed = '40 km/h'
        updatedResources['FT-12'].eta = '2 mins'

        updatedResources['A-21'].status = 'en_route'
        updatedResources['A-21'].coords = [17.7180, 83.3120]
        updatedResources['A-21'].speed = '55 km/h'
        updatedResources['A-21'].eta = '1 min'

        updatedCorridors['ram-nagar'].status = 'EMERGENCY_CORRIDOR'
        updatedCorridors['nh16-bypass'].status = 'EMERGENCY_CORRIDOR'
      } else if (stage === 'WATER_DRAINED') {
        // T+45: Pump operating, water receding, units on scene
        updatedResources['P-305'].status = 'on_scene'
        updatedResources['P-305'].coords = [17.7210, 83.3180]
        updatedResources['P-305'].speed = '0 km/h'
        updatedResources['P-305'].location = 'Beach Road Bypass Junction'

        updatedResources['FT-12'].status = 'operating'
        updatedResources['FT-12'].coords = [17.7210, 83.3180]
        updatedResources['FT-12'].speed = '0 km/h'
        updatedResources['FT-12'].location = 'Beach Road Sector 4 Culvert'

        updatedResources['A-21'].status = 'on_scene'
        updatedResources['A-21'].coords = [17.7210, 83.3180]
        updatedResources['A-21'].speed = '0 km/h'
        updatedResources['A-21'].location = 'Beach Road Sector 4'

        updatedResources['DP-04'].status = 'operating'

        updatedSensors['beach-node-1'].levelCm = 18
        updatedSensors['beach-node-1'].drainLevelPct = 38
        updatedSensors['beach-node-1'].status = 'NORMAL'
        updatedSensors['beach-node-1'].sensorHealth = 'OPTIMAL'
        
        updatedIncident.waterDepthCm = 12
        updatedCorridors['beach-road'].status = 'OPEN'
        updatedCorridors['beach-road'].speedKmH = 35
      } else if (stage === 'RESOLVED') {
        // T+60: Full resolution
        updatedIncident.status = 'resolved'
        updatedIncident.waterDepthCm = 4

        updatedResources['P-305'].status = 'available'
        updatedResources['FT-12'].status = 'available'
        updatedResources['A-21'].status = 'available'
        updatedResources['DP-04'].status = 'available'

        updatedCorridors['beach-road'].status = 'OPEN'
        updatedCorridors['beach-road'].speedKmH = 45
        updatedCorridors['ram-nagar'].status = 'OPEN'
        updatedCorridors['nh16-bypass'].status = 'OPEN'
      }

      return {
        demoStage: stage,
        simulationTime: simTime,
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

  updateResourceStatus: (id, status, location, coords) => {
    set((state) => {
      const res = state.resources[id]
      if (!res) return state
      return {
        resources: {
          ...state.resources,
          [id]: {
            ...res,
            status,
            ...(location ? { location } : {}),
            ...(coords ? { coords } : {})
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
