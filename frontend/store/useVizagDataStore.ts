'use client'

import { create } from 'zustand'

export type ProvenanceType = 
  | 'REAL_INGESTION' 
  | 'PROTOTYPE_SIMULATION' 
  | 'CACHED'
  | 'REFERENCE'
  | 'LIVE'
  | 'REAL_IOT'
  | 'VERIFIED'
  | 'HISTORICAL'
  | 'SIMULATION'
  | 'AI_DERIVED'

export type DemoStage = 
  // Official SIH 2026 Severe Weather Nowcasting 12-Step Timeline
  | 'T00_NORMAL'
  | 'T05_WEATHER_SIGNAL'
  | 'T10_AI_NOWCAST'
  | 'T15_WARD_RISK'
  | 'T20_EARLY_WARNING'
  | 'T25_TRAFFIC_IMPACT'
  | 'T30_OFFICER_APPROVAL'
  | 'T35_WATER_RISING'
  | 'T40_RESPONSE_DEPLOYED'
  | 'T50_DIGITAL_TWIN'
  | 'T60_WATER_FALLING'
  | 'T70_RISK_NORMALIZED'
  // Backward-compatibility aliases
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
  | 'T+40'
  | 'T+50'
  | 'T+60'
  | 'T+70'

export type RiskLevel = 'SAFE' | 'CAUTION' | 'HIGH' | 'VERY HIGH' | 'CRITICAL'

export interface NowcastHorizonStep {
  offset: 'NOW' | '+15 MIN' | '+30 MIN' | '+60 MIN'
  minutes: number
  rainfallRateMmHr: number
  waterLevelCm: number
  riskLevel: RiskLevel
  riskScore: number
  drainageCapacityPct: number
  predictedImpact: string
  recommendedAction: string
  modelScore: number
  provenance: ProvenanceType
}

export interface NowcastState {
  wardId: string
  wardName: string
  district: string
  currentRisk: RiskLevel
  riskScore: number
  rainfallMmHr: number
  rainfallTrend: 'STABLE' | 'INCREASING' | 'RAPIDLY_INCREASING' | 'DECREASING'
  radarDbz: number
  waterDepthCm: number
  drainageLoadPct: number
  steps: NowcastHorizonStep[]
  whyRiskIncreasing: string[]
  predictedImpacts: {
    inundationProbability: string
    affectedRoads: string[]
    trafficCongestionIndex: string
    criticalThreat: string
    estimatedCitizensAtRisk: number
  }
  provenance: ProvenanceType
  updatedAt: string
}

export interface EarlyWarningItem {
  id: string
  title: string
  wardId: string
  wardName: string
  severity: RiskLevel
  timeHorizon: string
  expectedImpact: string
  targetAudiences: string[]
  recommendedPreparedness: string[]
  requiresHumanApproval: boolean
  acknowledged: boolean
  approvedBy?: string
  provenance: ProvenanceType
  createdAt: string
}

export interface PreparednessRecommendation {
  id: string
  actionType: 'PREPOSITION_PUMP' | 'TRAFFIC_DIVERSION' | 'AMBULANCE_CORRIDOR' | 'CITIZEN_ALERT' | 'SHELTER_STANDBY'
  title: string
  description: string
  resourceId: string
  targetZone: string
  status: 'RECOMMENDED' | 'APPROVED' | 'EXECUTED'
  humanSignedBy?: string
  signedAt?: string
  provenance: ProvenanceType
}

export interface CitizenReportItem {
  id: string
  source: 'CITIZEN_SOS' | 'CITIZEN_PHOTO' | 'CITIZEN_VOICE' | 'CITIZEN_TEXT'
  citizenName: string
  phone: string
  location: string
  category: string
  severity: 'critical' | 'high' | 'medium'
  evidenceSummary: string
  aiTriageStatus: 'TRIAGE_PENDING' | 'AI_TRIAGED' | 'OFFICER_VERIFIED' | 'DISPATCHED' | 'RESOLVED'
  aiConfidence: string
  recommendedAction: string
  officerSignedBy?: string
  timestamp: string
  provenance: ProvenanceType
}

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
  category?: string
  sourceType?: string
  aiRiskScore?: number
  aiConfidence?: number
  dispatchedDepartments?: string[]
  aiResponsePlan?: string[]
  evidence?: any
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

  // SIH 2026 Core Nowcast & Severe Weather State
  nowcast: NowcastState
  earlyWarnings: EarlyWarningItem[]
  preparednessActions: PreparednessRecommendation[]
  citizenReports: CitizenReportItem[]

  // Operations State
  incident: OperationalIncident
  resources: Record<string, OperationalResource>
  trafficCorridors: Record<string, TrafficCorridor>
  sensors: Record<string, SensorReading>
  hospitals: Record<string, HospitalFacility>

  // Actions
  setDemoStage: (stage: DemoStage) => void
  startDemo: () => void
  pauseDemo: () => void
  stepForward: () => void
  resetDemo: () => void
  approveIncidentAction: (officerName: string) => void
  approvePreparednessAction: (actionId: string, officerName: string) => void
  approveCitizenReport: (reportId: string, officerName: string) => void
  addCitizenReport: (report: CitizenReportItem) => void
  ingestPipelineEvent: (eventData: any) => void
  updateResourceStatus: (id: string, status: OperationalResource['status'], location?: string, coords?: [number, number]) => void
  updateCorridorStatus: (id: string, status: TrafficCorridor['status']) => void
}

// Initial Baseline Nowcast State
const INITIAL_NOWCAST: NowcastState = {
  wardId: 'WARD-12',
  wardName: 'Ward 12 (MVP Colony & RK Beach Outfall)',
  district: 'Visakhapatnam',
  currentRisk: 'SAFE',
  riskScore: 18.0,
  rainfallMmHr: 4.0,
  rainfallTrend: 'STABLE',
  radarDbz: 22.0,
  waterDepthCm: 14.0,
  drainageLoadPct: 32.0,
  steps: [
    {
      offset: 'NOW',
      minutes: 0,
      rainfallRateMmHr: 4.0,
      waterLevelCm: 14.0,
      riskLevel: 'SAFE',
      riskScore: 18.0,
      drainageCapacityPct: 32.0,
      predictedImpact: 'Hydrological parameters baseline. Gravity outfall discharging smoothly.',
      recommendedAction: 'Routine Doppler radar and culvert gauge telemetry monitoring.',
      modelScore: 86.0,
      provenance: 'AI_DERIVED'
    },
    {
      offset: '+15 MIN',
      minutes: 15,
      rainfallRateMmHr: 12.0,
      waterLevelCm: 16.0,
      riskLevel: 'SAFE',
      riskScore: 22.0,
      drainageCapacityPct: 38.0,
      predictedImpact: 'Minor surface runoff. All outfalls operating with >60% spare capacity.',
      recommendedAction: 'Verify stormwater outfall trash screens.',
      modelScore: 87.0,
      provenance: 'AI_DERIVED'
    },
    {
      offset: '+30 MIN',
      minutes: 30,
      rainfallRateMmHr: 18.0,
      waterLevelCm: 18.0,
      riskLevel: 'SAFE',
      riskScore: 24.0,
      drainageCapacityPct: 44.0,
      predictedImpact: 'Inflow within design tolerance. Roadways fully clear.',
      recommendedAction: 'Maintain baseline command status.',
      modelScore: 88.0,
      provenance: 'AI_DERIVED'
    },
    {
      offset: '+60 MIN',
      minutes: 60,
      rainfallRateMmHr: 22.0,
      waterLevelCm: 20.0,
      riskLevel: 'CAUTION',
      riskScore: 28.0,
      drainageCapacityPct: 48.0,
      predictedImpact: 'Rainfall cell approaching coast. Normal drainage anticipated.',
      recommendedAction: 'Standby telemetry polling at 1-minute intervals.',
      modelScore: 87.5,
      provenance: 'AI_DERIVED'
    }
  ],
  whyRiskIncreasing: [
    'Baseline meteorological observation: marine cloud cell drifting inland at 18 km/h.',
    'Beach Road Sector 4 culvert water level: 14 cm (threshold 35 cm).',
    'Historical catchment storage capacity sufficient for current precipitation rate.'
  ],
  predictedImpacts: {
    inundationProbability: 'LOW (12%)',
    affectedRoads: [],
    trafficCongestionIndex: 'NORMAL (Speed 42 km/h)',
    criticalThreat: 'None — Outfall #01 Clear',
    estimatedCitizensAtRisk: 0
  },
  provenance: 'VERIFIED',
  updatedAt: new Date().toISOString()
}

const INITIAL_WARNINGS: EarlyWarningItem[] = [
  {
    id: 'WARN-VIZAG-101',
    title: 'Severe Inundation Nowcast — Beach Road Sector 4 Corridor',
    wardId: 'WARD-12',
    wardName: 'Ward 12 (MVP Colony & RK Beach Outfall)',
    severity: 'HIGH',
    timeHorizon: 'Within 30–60 minutes',
    expectedImpact: 'Culvert outfall overtopping; waterlogging depth > 45 cm along Beach Road Sector 4; arterial traffic disruption.',
    targetAudiences: [
      'Citizens (Ward 12 / MVP Colony)',
      'Ward Officer (MVP Colony Base)',
      'District Disaster Management Authority (DDMA)',
      'Traffic Police (Suryabagh Precinct)',
      'GVMC Dewatering Unit',
      'Emergency Medical Services (108 Dispatch)'
    ],
    recommendedPreparedness: [
      'Pre-position High-Volume Dewatering Pump DP-04 at Beach Road Culvert',
      'Activate traffic detour signage towards NH16 bypass',
      'Keep emergency corridor Ram Nagar -> King George Hospital clear',
      'Issue BharatOS citizen safety notifications for low-lying residents'
    ],
    requiresHumanApproval: true,
    acknowledged: false,
    provenance: 'AI_DERIVED',
    createdAt: new Date().toISOString()
  }
]

const INITIAL_PREPAREDNESS: PreparednessRecommendation[] = [
  {
    id: 'ACT-PUMP-04',
    actionType: 'PREPOSITION_PUMP',
    title: 'Pre-position Dewatering Pump DP-04',
    description: 'Stage high-volume municipal pump DP-04 at Beach Road Sector 4 outfall prior to water level reaching 45cm.',
    resourceId: 'DP-04',
    targetZone: 'RK Beach Outfall Sump',
    status: 'RECOMMENDED',
    provenance: 'AI_DERIVED'
  },
  {
    id: 'ACT-TRAFFIC-NH16',
    actionType: 'TRAFFIC_DIVERSION',
    title: 'Deploy Traffic Detour via NH16',
    description: 'Police Patrol P-305 to illuminate electronic signs and divert westbound transit away from Beach Road.',
    resourceId: 'P-305',
    targetZone: 'Siripuram Junction to NH16',
    status: 'RECOMMENDED',
    provenance: 'AI_DERIVED'
  },
  {
    id: 'ACT-AMB-A21',
    actionType: 'AMBULANCE_CORRIDOR',
    title: 'Prepare Emergency Medical Corridor',
    description: 'Engage Smart Green Wave along Ram Nagar route for Ambulance A-21 transit to King George Hospital.',
    resourceId: 'A-21',
    targetZone: 'Ram Nagar Medical Corridor',
    status: 'RECOMMENDED',
    provenance: 'AI_DERIVED'
  }
]

const INITIAL_CITIZEN_REPORTS: CitizenReportItem[] = [
  {
    id: 'CIT-SOS-1567',
    source: 'CITIZEN_SOS',
    citizenName: 'R. Kameswari (Senior Resident)',
    phone: '+91 98480 23145',
    location: 'Beach Road Sector 4, Near RK Beach (Ward 12)',
    category: 'Stranded Citizen / Water Inrush',
    severity: 'critical',
    evidenceSummary: '1-Tap Emergency SOS Activated. GPS location confirmed at low-lying coastal tenement.',
    aiTriageStatus: 'TRIAGE_PENDING',
    aiConfidence: '94% AI Confidence (Sensor Corroborated)',
    recommendedAction: 'Deploy Water Rescue Tender FT-12 & Ambulance A-21 for immediate evacuation.',
    timestamp: 'Just now',
    provenance: 'LIVE'
  },
  {
    id: 'CIT-RPT-8042',
    source: 'CITIZEN_PHOTO',
    citizenName: 'V. Naresh (Commuter)',
    phone: '+91 94401 88321',
    location: 'Beach Road Sector 4 Outfall Sump',
    category: 'Urban Waterlogging',
    severity: 'high',
    evidenceSummary: 'Photo uploaded showing standing stormwater at ~45cm depth; car tires submerged.',
    aiTriageStatus: 'AI_TRIAGED',
    aiConfidence: '91% Model Score (Visual Depth Analysis)',
    recommendedAction: 'Confirm road barrier placement; assign GVMC Dewatering Pump DP-04.',
    timestamp: '2 mins ago',
    provenance: 'AI_DERIVED'
  },
  {
    id: 'CIT-RPT-7910',
    source: 'CITIZEN_VOICE',
    citizenName: 'S. Appa Rao (Shopkeeper)',
    phone: '+91 99890 12543',
    location: 'MVP Double Road Canal Inflow',
    category: 'Drain Blockage',
    severity: 'medium',
    evidenceSummary: 'Audio note: "Storm drain choked with fallen tree branches, water backing onto road."',
    aiTriageStatus: 'AI_TRIAGED',
    aiConfidence: '88% Speech-to-Text NLP Score',
    recommendedAction: 'Dispatch municipal clearing squad to clear stormwater canal entrance.',
    timestamp: '5 mins ago',
    provenance: 'AI_DERIVED'
  }
]

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
    provenance: 'PROTOTYPE_SIMULATION'
  },
  'ram-nagar': {
    id: 'ram-nagar',
    name: 'Ram Nagar Hospital Green Corridor',
    status: 'OPEN',
    speedKmH: 45,
    travelTimeMins: 7,
    provenance: 'PROTOTYPE_SIMULATION'
  }
}

const INITIAL_SENSORS: Record<string, SensorReading> = {
  'beach-node-1': {
    id: 'beach-node-1',
    name: 'Beach Road Sump Sensor #1',
    location: 'Beach Road Sector 4',
    levelCm: 14,
    thresholdCm: 35,
    drainLevelPct: 35,
    flowRateLps: 120,
    sensorHealth: 'OPTIMAL',
    batteryPct: 94,
    connectivity: 'ONLINE_5G',
    status: 'NORMAL',
    provenance: 'PROTOTYPE_SIMULATION'
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
    provenance: 'PROTOTYPE_SIMULATION'
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
    provenance: 'REFERENCE'
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
    provenance: 'PROTOTYPE_SIMULATION'
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
    provenance: 'REFERENCE'
  },
  'seven-hills': {
    id: 'seven-hills',
    name: 'Seven Hills Clinic',
    erLoad: '54% ER Capacity',
    icuAvailable: 12,
    traumaLevel: 'Level 2 Trauma',
    status: 'OPTIMAL',
    provenance: 'REFERENCE'
  }
}

// Stage to Simulation Time Mapping
const STAGE_TIME_MAP: Record<DemoStage, SimulationTime> = {
  T00_NORMAL: 'T+00',
  T05_WEATHER_SIGNAL: 'T+05',
  T10_AI_NOWCAST: 'T+10',
  T15_WARD_RISK: 'T+15',
  T20_EARLY_WARNING: 'T+20',
  T25_TRAFFIC_IMPACT: 'T+25',
  T30_OFFICER_APPROVAL: 'T+30',
  T35_WATER_RISING: 'T+35',
  T40_RESPONSE_DEPLOYED: 'T+40',
  T50_DIGITAL_TWIN: 'T+50',
  T60_WATER_FALLING: 'T+60',
  T70_RISK_NORMALIZED: 'T+70',
  // Backward compatibility aliases
  IDLE: 'T+00',
  HEAVY_RAIN: 'T+05',
  WATER_RISING: 'T+35',
  INCIDENT_DETECTED: 'T+15',
  AI_TRIAGE: 'T+20',
  OFFICER_APPROVED: 'T+30',
  UNITS_DISPATCHED: 'T+40',
  WATER_DRAINED: 'T+60',
  RESOLVED: 'T+70'
}

export const useVizagDataStore = create<VizagDataStore>((set, get) => ({
  demoStage: 'T00_NORMAL',
  simulationTime: 'T+00',
  demoRunning: false,
  demoIntervalId: null,

  nowcast: INITIAL_NOWCAST,
  earlyWarnings: INITIAL_WARNINGS,
  preparednessActions: INITIAL_PREPAREDNESS,
  citizenReports: INITIAL_CITIZEN_REPORTS,

  incident: INITIAL_INCIDENT,
  resources: INITIAL_RESOURCES,
  trafficCorridors: INITIAL_CORRIDORS,
  sensors: INITIAL_SENSORS,
  hospitals: INITIAL_HOSPITALS,

  setDemoStage: (stage: DemoStage) => {
    set((state) => {
      const simTime = STAGE_TIME_MAP[stage] || 'T+00'
      let updatedNowcast = { ...state.nowcast }
      let updatedWarnings = [...state.earlyWarnings]
      let updatedPreparedness = [...state.preparednessActions]
      let updatedReports = [...state.citizenReports]
      let updatedIncident = { ...state.incident }
      let updatedSensors = { ...state.sensors }
      let updatedCorridors = { ...state.trafficCorridors }
      let updatedResources = { ...state.resources }

      // Map alias stages to canonical stage
      let canonicalStage = stage
      if (stage === 'IDLE') canonicalStage = 'T00_NORMAL'
      else if (stage === 'HEAVY_RAIN') canonicalStage = 'T05_WEATHER_SIGNAL'
      else if (stage === 'INCIDENT_DETECTED') canonicalStage = 'T15_WARD_RISK'
      else if (stage === 'AI_TRIAGE') canonicalStage = 'T20_EARLY_WARNING'
      else if (stage === 'OFFICER_APPROVED') canonicalStage = 'T30_OFFICER_APPROVAL'
      else if (stage === 'UNITS_DISPATCHED') canonicalStage = 'T40_RESPONSE_DEPLOYED'
      else if (stage === 'WATER_DRAINED') canonicalStage = 'T60_WATER_FALLING'
      else if (stage === 'RESOLVED') canonicalStage = 'T70_RISK_NORMALIZED'

      switch (canonicalStage) {
        case 'T00_NORMAL':
          return {
            demoStage: 'T00_NORMAL',
            simulationTime: 'T+00',
            nowcast: INITIAL_NOWCAST,
            earlyWarnings: INITIAL_WARNINGS,
            preparednessActions: INITIAL_PREPAREDNESS,
            citizenReports: INITIAL_CITIZEN_REPORTS,
            incident: INITIAL_INCIDENT,
            resources: INITIAL_RESOURCES,
            trafficCorridors: INITIAL_CORRIDORS,
            sensors: INITIAL_SENSORS,
            hospitals: INITIAL_HOSPITALS
          }

        case 'T05_WEATHER_SIGNAL':
          // T+05: Radar detects coastal rain cell intensifying
          updatedNowcast.rainfallMmHr = 28.0
          updatedNowcast.rainfallTrend = 'INCREASING'
          updatedNowcast.radarDbz = 38.0
          updatedNowcast.currentRisk = 'CAUTION'
          updatedNowcast.riskScore = 32.0
          updatedNowcast.whyRiskIncreasing = [
            'IMD Doppler Radar detected convective rain band intensifying offshore.',
            'Precipitation intensity increased from 4 → 28 mm/hr.',
            'Culvert sump sensor #1 registering accelerating runoff inflow.'
          ]
          updatedSensors['beach-node-1'].levelCm = 24
          updatedSensors['beach-node-1'].drainLevelPct = 48
          updatedSensors['beach-node-1'].flowRateLps = 210
          break

        case 'T10_AI_NOWCAST':
          // T+10: AI Nowcast Engine generates multi-horizon trajectory
          updatedNowcast.rainfallMmHr = 42.0
          updatedNowcast.radarDbz = 46.0
          updatedNowcast.currentRisk = 'CAUTION'
          updatedNowcast.riskScore = 44.0
          updatedNowcast.steps = [
            {
              offset: 'NOW',
              minutes: 0,
              rainfallRateMmHr: 42.0,
              waterLevelCm: 28.0,
              riskLevel: 'CAUTION',
              riskScore: 44.0,
              drainageCapacityPct: 62.0,
              predictedImpact: 'Precipitation accelerating. Low-lying curb ponding beginning.',
              recommendedAction: 'Alert Ward 12 coordinator; verify pump DP-04 readiness.',
              modelScore: 89.0,
              provenance: 'AI_DERIVED'
            },
            {
              offset: '+15 MIN',
              minutes: 15,
              rainfallRateMmHr: 54.0,
              waterLevelCm: 36.0,
              riskLevel: 'HIGH',
              riskScore: 62.0,
              drainageCapacityPct: 78.0,
              predictedImpact: 'Culvert sump reaches 35cm threshold. Water overflowing curb.',
              recommendedAction: 'Stage traffic detour via NH16; issue early warning to Ward 12.',
              modelScore: 90.5,
              provenance: 'AI_DERIVED'
            },
            {
              offset: '+30 MIN',
              minutes: 30,
              rainfallRateMmHr: 64.0,
              waterLevelCm: 45.0,
              riskLevel: 'VERY HIGH',
              riskScore: 76.0,
              drainageCapacityPct: 92.0,
              predictedImpact: 'Beach Road Sector 4 waterlogged (45cm). Impassable for light vehicles.',
              recommendedAction: 'Execute pump deployment DP-04; close Beach Rd low-lying segment.',
              modelScore: 91.8,
              provenance: 'AI_DERIVED'
            },
            {
              offset: '+60 MIN',
              minutes: 60,
              rainfallRateMmHr: 68.0,
              waterLevelCm: 52.0,
              riskLevel: 'CRITICAL',
              riskScore: 86.0,
              drainageCapacityPct: 98.0,
              predictedImpact: 'Extensive roadway waterlogging; threat to ground-floor tenements.',
              recommendedAction: 'Evacuation of vulnerable shoreline citizens to MVP High School Shelter.',
              modelScore: 92.6,
              provenance: 'AI_DERIVED'
            }
          ]
          updatedSensors['beach-node-1'].levelCm = 30
          updatedSensors['beach-node-1'].status = 'WARNING'
          break

        case 'T15_WARD_RISK':
          // T+15: Ward 12 Risk escalates to HIGH
          updatedNowcast.rainfallMmHr = 58.0
          updatedNowcast.rainfallTrend = 'RAPIDLY_INCREASING'
          updatedNowcast.waterDepthCm = 36.0
          updatedNowcast.currentRisk = 'HIGH'
          updatedNowcast.riskScore = 65.0
          updatedNowcast.predictedImpacts.inundationProbability = 'HIGH (84%)'
          updatedNowcast.predictedImpacts.affectedRoads = ['Beach Road Sector 4', 'MVP Double Road Inflow']
          updatedNowcast.predictedImpacts.trafficCongestionIndex = 'MODERATE (Delay +12m)'
          updatedNowcast.predictedImpacts.estimatedCitizensAtRisk = 180
          updatedSensors['beach-node-1'].levelCm = 36
          updatedSensors['beach-node-1'].status = 'CRITICAL'
          updatedIncident.status = 'active'
          updatedIncident.waterDepthCm = 36
          break

        case 'T20_EARLY_WARNING':
          // T+20: Early Warning automatically broadcast across 6 agency channels
          updatedNowcast.currentRisk = 'HIGH'
          updatedNowcast.riskScore = 72.0
          updatedWarnings[0].acknowledged = true
          updatedIncident.aiRecommendation = 'AI NOWCAST ADVISORY: Culvert overflow expected in 15 mins. Pre-position Pump DP-04, divert non-emergency transit to NH16, alert citizens in Ward 12.'
          break

        case 'T25_TRAFFIC_IMPACT':
          // T+25: Roadway impact predicted; congestion builds
          updatedCorridors['beach-road'].status = 'CONGESTED'
          updatedCorridors['beach-road'].speedKmH = 18
          updatedCorridors['vip-road'].status = 'CONGESTED'
          updatedNowcast.predictedImpacts.trafficCongestionIndex = 'SEVERE (Delay +22m)'
          break

        case 'T30_OFFICER_APPROVAL':
          // T+30: Human Officer Authorizes Proactive Preparedness
          updatedIncident.humanSignOff = true
          updatedIncident.signedBy = 'Duty Commander K. Sharma (Badge #4092)'
          updatedIncident.status = 'assigned'
          updatedPreparedness.forEach(p => {
            p.status = 'APPROVED'
            p.humanSignedBy = 'Duty Commander K. Sharma (Badge #4092)'
            p.signedAt = new Date().toISOString()
          })
          break

        case 'T35_WATER_RISING':
          // T+35: Inundation deepens to 48cm; incident fully active
          updatedNowcast.rainfallMmHr = 64.0
          updatedNowcast.waterDepthCm = 48.0
          updatedNowcast.currentRisk = 'VERY HIGH'
          updatedNowcast.riskScore = 82.0
          updatedIncident.waterDepthCm = 48
          updatedSensors['beach-node-1'].levelCm = 48
          updatedSensors['beach-node-1'].drainLevelPct = 96
          updatedSensors['beach-node-1'].sensorHealth = 'CRITICAL'
          updatedCorridors['beach-road'].status = 'CLOSED_FLOOD'
          updatedCorridors['beach-road'].speedKmH = 0
          // Citizen SOS marked triaged
          updatedReports[0].aiTriageStatus = 'OFFICER_VERIFIED'
          break

        case 'T40_RESPONSE_DEPLOYED':
          // T+40: Multi-agency response deployed
          updatedIncident.status = 'in_progress'
          updatedResources['P-305'].status = 'en_route'
          updatedResources['P-305'].speed = '45 km/h'
          updatedResources['P-305'].coords = [17.7140, 83.3020]
          updatedResources['P-305'].eta = '1 min'

          updatedResources['FT-12'].status = 'en_route'
          updatedResources['FT-12'].speed = '42 km/h'
          updatedResources['FT-12'].coords = [17.7020, 83.2700]
          updatedResources['FT-12'].eta = '2 mins'

          updatedResources['A-21'].status = 'en_route'
          updatedResources['A-21'].speed = '50 km/h'
          updatedResources['A-21'].coords = [17.7180, 83.3120]
          updatedResources['A-21'].eta = '1 min'

          updatedCorridors['ram-nagar'].status = 'EMERGENCY_CORRIDOR'
          updatedReports[0].aiTriageStatus = 'DISPATCHED'
          break

        case 'T50_DIGITAL_TWIN':
          // T+50: Dewatering pump DP-04 operating on scene; rescue active
          updatedResources['DP-04'].status = 'operating'
          updatedResources['FT-12'].status = 'on_scene'
          updatedResources['P-305'].status = 'on_scene'
          updatedResources['A-21'].status = 'on_scene'
          updatedIncident.waterDepthCm = 42
          break

        case 'T60_WATER_FALLING':
          // T+60: Pump DP-04 recedes water to 22cm
          updatedNowcast.rainfallMmHr = 18.0
          updatedNowcast.rainfallTrend = 'DECREASING'
          updatedNowcast.waterDepthCm = 22.0
          updatedNowcast.currentRisk = 'CAUTION'
          updatedNowcast.riskScore = 38.0
          updatedIncident.waterDepthCm = 22
          updatedSensors['beach-node-1'].levelCm = 22
          updatedSensors['beach-node-1'].drainLevelPct = 48
          updatedSensors['beach-node-1'].status = 'NORMAL'
          updatedCorridors['beach-road'].status = 'OPEN'
          updatedCorridors['beach-road'].speedKmH = 30
          updatedReports[0].aiTriageStatus = 'RESOLVED'
          break

        case 'T70_RISK_NORMALIZED':
          // T+70: Scene secured; normal conditions restored
          updatedNowcast.rainfallMmHr = 4.0
          updatedNowcast.rainfallTrend = 'STABLE'
          updatedNowcast.waterDepthCm = 14.0
          updatedNowcast.currentRisk = 'SAFE'
          updatedNowcast.riskScore = 16.0
          updatedIncident.status = 'resolved'
          updatedIncident.waterDepthCm = 14
          updatedResources['FT-12'].status = 'resolved'
          updatedResources['P-305'].status = 'resolved'
          updatedResources['A-21'].status = 'resolved'
          updatedResources['DP-04'].status = 'resolved'
          updatedCorridors['beach-road'].status = 'OPEN'
          updatedCorridors['beach-road'].speedKmH = 45
          updatedCorridors['ram-nagar'].status = 'OPEN'
          break
      }

      return {
        demoStage: stage,
        simulationTime: simTime,
        nowcast: updatedNowcast,
        earlyWarnings: updatedWarnings,
        preparednessActions: updatedPreparedness,
        citizenReports: updatedReports,
        incident: updatedIncident,
        resources: updatedResources,
        trafficCorridors: updatedCorridors,
        sensors: updatedSensors,
        hospitals: state.hospitals
      }
    })
  },

  startDemo: () => {
    const { pauseDemo } = get()
    pauseDemo()
    set({ demoRunning: true })

    const stages: DemoStage[] = [
      'T00_NORMAL',
      'T05_WEATHER_SIGNAL',
      'T10_AI_NOWCAST',
      'T15_WARD_RISK',
      'T20_EARLY_WARNING',
      'T25_TRAFFIC_IMPACT',
      'T30_OFFICER_APPROVAL',
      'T35_WATER_RISING',
      'T40_RESPONSE_DEPLOYED',
      'T50_DIGITAL_TWIN',
      'T60_WATER_FALLING',
      'T70_RISK_NORMALIZED'
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
      'T00_NORMAL',
      'T05_WEATHER_SIGNAL',
      'T10_AI_NOWCAST',
      'T15_WARD_RISK',
      'T20_EARLY_WARNING',
      'T25_TRAFFIC_IMPACT',
      'T30_OFFICER_APPROVAL',
      'T35_WATER_RISING',
      'T40_RESPONSE_DEPLOYED',
      'T50_DIGITAL_TWIN',
      'T60_WATER_FALLING',
      'T70_RISK_NORMALIZED'
    ]
    const current = get().demoStage
    const idx = stages.indexOf(current)
    const nextIdx = (idx + 1) % stages.length
    get().setDemoStage(stages[nextIdx])
  },

  resetDemo: () => {
    get().pauseDemo()
    get().setDemoStage('T00_NORMAL')
  },

  approveIncidentAction: (officerName: string) => {
    set((state) => ({
      incident: {
        ...state.incident,
        humanSignOff: true,
        signedBy: officerName,
        status: 'assigned'
      },
      preparednessActions: state.preparednessActions.map(p => ({
        ...p,
        status: 'APPROVED',
        humanSignedBy: officerName,
        signedAt: new Date().toISOString()
      }))
    }))
  },

  approvePreparednessAction: (actionId: string, officerName: string) => {
    set((state) => ({
      preparednessActions: state.preparednessActions.map(p => 
        p.id === actionId 
          ? { ...p, status: 'APPROVED', humanSignedBy: officerName, signedAt: new Date().toISOString() }
          : p
      )
    }))
  },

  approveCitizenReport: (reportId: string, officerName: string) => {
    set((state) => ({
      citizenReports: state.citizenReports.map(r => 
        r.id === reportId 
          ? { ...r, aiTriageStatus: 'OFFICER_VERIFIED', officerSignedBy: officerName }
          : r
      )
    }))
  },

  addCitizenReport: (report: CitizenReportItem) => {
    set((state) => ({
      citizenReports: [report, ...state.citizenReports.filter(r => r.id !== report.id)]
    }))
  },

  ingestPipelineEvent: (eventData: any) => {
    set((state) => {
      const ticketNum = eventData.ticket_number || `INC-${Math.floor(1000 + Math.random() * 9000)}`
      const category = eventData.category || 'General Emergency'
      const severity = (eventData.severity?.toLowerCase() || 'critical') as 'critical' | 'high' | 'medium' | 'low'
      
      const newIncident: OperationalIncident = {
        id: eventData.incident_id || `inc-${Date.now()}`,
        ticketNumber: ticketNum,
        title: eventData.title || `[${eventData.source_type || 'IoT'}] ${category} Detected`,
        location: eventData.address || eventData.location || 'Visakhapatnam Operations Zone',
        category,
        severity,
        status: 'active',
        waterDepthCm: eventData.metric_type === 'water_level' ? Math.round((eventData.metric_value || 4.5) * 10) : 15,
        peopleAtRisk: category === 'Hazardous Material' ? 320 : (category === 'Fire' ? 110 : (category === 'Earthquake' ? 450 : 85)),
        assignedUnits: eventData.recommended_resources?.map((r: any) => r.call_sign || r.id) || ['AMB-042', 'FT-12', 'P-305'],
        aiRecommendation: eventData.ai_response_plan?.[0] || 'Execute multi-department emergency containment protocol',
        humanSignOff: false,
        provenance: eventData.provenance || 'REAL_INGESTION',
        sourceType: eventData.source_type,
        aiRiskScore: eventData.ai_risk_score || 88.0,
        aiConfidence: eventData.ai_confidence || 94.6,
        dispatchedDepartments: eventData.dispatched_departments || ['Disaster Management', 'Traffic Police', 'Fire & Rescue'],
        aiResponsePlan: eventData.ai_response_plan || [],
        evidence: eventData.evidence || null
      }

      // Add to citizen report feed as automated sensor/CCTV report
      const newReport: CitizenReportItem = {
        id: `auto-${Date.now()}`,
        source: eventData.source_type === 'CCTV_YOLO' ? 'CITIZEN_PHOTO' : 'CITIZEN_SOS',
        citizenName: eventData.sensor_name || `Edge Sensor [${eventData.source_type || 'IoT'}]`,
        phone: 'Automated Gateway Pipeline',
        location: newIncident.location,
        category,
        severity: severity === 'low' ? 'medium' : severity,
        evidenceSummary: eventData.description || `Sensor telemetry breach: ${eventData.metric_type}=${eventData.metric_value}`,
        aiTriageStatus: 'AI_TRIAGED',
        aiConfidence: `${Math.round(newIncident.aiConfidence || 95)}%`,
        recommendedAction: newIncident.aiRecommendation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provenance: 'SIMULATION'
      }

      const mappedRisk: RiskLevel = severity === 'critical' ? 'CRITICAL' : (severity === 'high' ? 'HIGH' : state.nowcast.currentRisk)

      return {
        incident: newIncident,
        citizenReports: [newReport, ...state.citizenReports.slice(0, 15)],
        nowcast: {
          ...state.nowcast,
          currentRisk: mappedRisk,
          riskScore: eventData.ai_risk_score || state.nowcast.riskScore
        }
      }
    })
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
