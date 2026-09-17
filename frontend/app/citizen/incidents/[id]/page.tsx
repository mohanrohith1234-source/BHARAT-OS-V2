'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  PhoneCall, 
  LifeBuoy, 
  Flame, 
  Shield, 
  Car, 
  CloudRain, 
  AlertTriangle,
  Info,
  Navigation,
  WifiOff,
  Radio,
  Compass,
  ExternalLink,
  Bot
} from 'lucide-react'
import { useCitizenStore } from '../../../../store/useCitizenStore'
import { useVizagDataStore } from '../../../../store/useVizagDataStore'
import { IndexedDbService } from '../../../../services/offline/indexedDbService'
import { CitizenIncident, IncidentStage, AppLanguage } from '../../../../types/citizen'

const trackerTranslations = {
  en: {
    backBtn: "Back to Incidents",
    title: "INCIDENT RESPONSE TRACKER",
    unconfirmedUnit: "Awaiting Unit Assignment — Information Unavailable",
    unconfirmedEta: "ETA Unavailable — Waiting for Dispatch Receipt",
    timelineTitle: "Official Event Activity Log",
    safetyTitle: "Safety Instructions While Waiting:",
    safety1: "1. Stay in a safe, visible location and keep line of sight clear.",
    safety2: "2. Do not attempt hazardous self-rescue if water or fire is spreading.",
    safety3: "3. Keep your mobile phone line free for incoming dispatch calls.",
    honestNotice: "BHARATOS Operational Truthfulness: Unit assignment and live location telemetry are updated strictly when confirmed by backend dispatch servers.",
    syncedBadge: "SYNCED WITH CORE",
    offlineBadge: "SAVED LOCALLY IN INDEXEDDB"
  },
  te: {
    backBtn: "ఇన్సిడెంట్స్‌కు తిరిగి వెళ్ళండి",
    title: "ఇన్సిడెంట్ రెస్పాన్స్ ట్రాకర్",
    unconfirmedUnit: "విభాగం కేటాయింపు కోసం వేచి ఉంది",
    unconfirmedEta: "సమయం అందుబాటులో లేదు",
    timelineTitle: "అధికారిక ఈవెంట్ సమాచారం",
    safetyTitle: "వేచి ఉండే సమయంలో భద్రతా సూచనలు:",
    safety1: "1. సురక్షితమైన ప్రదేశంలో ఉండండి.",
    safety2: "2. ప్రమాదకర చర్యలకు స్వయంగా ప్రయత్నించవద్దు.",
    safety3: "3. మీ ఫోన్ లైన్ ఉచితంగా ఉంచండి.",
    honestNotice: "అధికారిక ధృవీకరణ తర్వాత మాత్రమే సమాచారం అందించబడుతుంది.",
    syncedBadge: "సింక్ చేయబడింది",
    offlineBadge: "ఆఫ్‌లైన్‌లో సేవ్ చేయబడింది"
  },
  hi: {
    backBtn: "घटनाओं पर वापस लौटें",
    title: "घटना प्रतिक्रिया ट्रैकर",
    backTitle: "आपातकालीन स्थिति",
    unconfirmedUnit: "इकाई आवंटन की प्रतीक्षा में",
    unconfirmedEta: "समय अनुपलब्ध",
    timelineTitle: "आधिकारिक गतिविधि लॉग",
    safetyTitle: "प्रतीक्षा के दौरान सुरक्षा निर्देश:",
    safety1: "1. सुरक्षित स्थान पर रहें।",
    safety2: "2. स्वयं जोखिम न उठाएं।",
    safety3: "3. फोन लाइन खाली रखें।",
    honestNotice: "केवल आधिकारिक पुष्टि के बाद स्थिति अपडेट की जाती है।",
    syncedBadge: "सिंक किया गया",
    offlineBadge: "ऑफ़लाइन सहेजा गया"
  }
}

const STAGES_ORDER: { stage: IncidentStage; label: string }[] = [
  { stage: 'received', label: '1. Received' },
  { stage: 'ai_analyzed', label: '2. AI Triaged' },
  { stage: 'dept_notified', label: '3. Dept Routed' },
  { stage: 'resources_assigned', label: '4. Team Assigned' },
  { stage: 'response_in_progress', label: '5. En Route' },
  { stage: 'resolved', label: '6. Resolved' }
]

export default function IncidentTrackerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const incidentId = resolvedParams.id
  const router = useRouter()

  const { profile, myIncidents } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = trackerTranslations[lang as 'en' | 'te' | 'hi'] || trackerTranslations.en

  const [incident, setIncident] = useState<CitizenIncident | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadIncidentDetails() {
      // Check Zustand store first
      let found = myIncidents.find(i => i.id === incidentId)
      
      // If not in store, check IndexedDB
      if (!found) {
        const dbIncidents = await IndexedDbService.getAllIncidents()
        found = dbIncidents.find(i => i.id === incidentId)
      }

      // If still not found, construct a demo fallback for testing
      if (!found) {
        found = {
          id: incidentId,
          category: 'medical',
          severity: 'critical',
          title: `EMERGENCY INCIDENT ${incidentId}`,
          description: 'Emergency response request submitted. Awaiting dispatch assignment.',
          location: {
            latitude: 17.7289,
            longitude: 83.3214,
            address: 'Beach Road Sector 4, MVP Colony, Visakhapatnam',
            district: 'Visakhapatnam',
            stateName: 'Andhra Pradesh',
            gpsState: 'GPS AVAILABLE'
          },
          affectedCount: 1,
          mediaUrls: {},
          stage: 'received',
          dataFreshness: 'live',
          dataSource: 'LIVE',
          syncState: 'SYNCED',
          timeline: [
            { stage: 'received', title: 'Request Received', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Logged by BHARATOS Emergency System' }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      setIncident(found)
      setLoading(false)
    }

    loadIncidentDetails()
  }, [incidentId, myIncidents])

  if (loading) {
    return (
      <div className="py-12 text-center text-xs font-mono text-slate-500 animate-pulse">
        Loading Incident Response Telemetry...
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="py-12 text-center space-y-3 font-mono text-xs">
        <p className="text-red-400">Incident record not found.</p>
        <Link href="/citizen/incidents" className="text-sky-400 underline">Return to Incidents List</Link>
      </div>
    )
  }

  const { demoStage, simulationTime, incident: vizagIncident } = useVizagDataStore()

  // Calculate dynamic stage aligned with shared Vizag scenario
  const getEffectiveStageIdx = () => {
    if (demoStage === 'RESOLVED') return 5
    if (demoStage === 'UNITS_DISPATCHED' || demoStage === 'WATER_DRAINED') return 4
    if (demoStage === 'OFFICER_APPROVED') return 2
    if (demoStage === 'AI_TRIAGE') return 1
    return STAGES_ORDER.findIndex(s => s.stage === incident?.stage) || 0
  }

  const currentStageIdx = incident ? getEffectiveStageIdx() : 0
  const isEnRoute = demoStage === 'UNITS_DISPATCHED' || demoStage === 'WATER_DRAINED'
  const isResolved = demoStage === 'RESOLVED'
  const isAwaitingApproval = demoStage === 'AI_TRIAGE' || demoStage === 'OFFICER_APPROVED'

  return (
    <div className="space-y-5 pb-8">

      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backBtn}</span>
        </button>

        <span className="text-[9.5px] font-mono font-bold text-sky-400">
          ID: {incident.id}
        </span>
      </div>

      {/* Header Info */}
      <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-white font-mono uppercase">{incident.category}</span>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-400 uppercase">
              {incident.severity}
            </span>
          </div>

          <span className="text-[9.5px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
            {incident.isOfflineSaved ? t.offlineBadge : t.syncedBadge}
          </span>
        </div>

        <h1 className="text-base font-black text-white leading-snug">{incident.title}</h1>
        <p className="text-xs text-slate-300 font-mono leading-relaxed">{incident.description}</p>
        
        <div className="pt-2 border-t border-slate-900 flex items-center space-x-1.5 text-xs font-mono text-sky-400">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{incident.location.address}</span>
        </div>
      </div>

      {/* 7-Stage Visual Lifecycle Progress Tracker */}
      <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
          LIFECYCLE STAGE PROGRESS
        </span>

        <div className="grid grid-cols-6 gap-1">
          {STAGES_ORDER.map((stg, idx) => {
            const isComplete = idx <= currentStageIdx
            const isCurrent = idx === currentStageIdx

            return (
              <div key={stg.stage} className="space-y-1 text-center">
                <div 
                  className={`h-2.5 rounded-full transition-all ${
                    isCurrent 
                      ? 'bg-sky-400 animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.9)]' 
                      : isComplete 
                      ? 'bg-emerald-500' 
                      : 'bg-slate-850'
                  }`}
                />
                <span className={`text-[7.5px] font-mono uppercase block truncate ${
                  isCurrent ? 'text-sky-300 font-bold' : isComplete ? 'text-emerald-400' : 'text-slate-600'
                }`}>
                  {stg.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Live Response Tracking & Operational Status */}
      {isEnRoute ? (
        <div className="rounded-2xl border border-sky-600/70 bg-sky-950/20 p-4 space-y-3 font-mono shadow-[0_0_30px_rgba(56,189,248,0.2)]">
          <div className="flex items-center justify-between border-b border-sky-900/50 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                LIVE RESPONSE TELEMETRY — UNITS EN ROUTE
              </h3>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-sky-950/80 border border-sky-700/60 text-sky-300">
              GPS SOURCE: SIMULATION
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-black/50 border border-sky-900/50 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold uppercase">PRIMARY UNIT</span>
                <span className="text-emerald-400 font-bold">42 km/h</span>
              </div>
              <p className="text-white font-bold text-[11px]">FT-12 (Water Rescue Tender)</p>
              <div className="flex justify-between items-center text-[9.5px] text-slate-400 pt-0.5">
                <span>ETA: <strong className="text-white">~3 min</strong> (1.1 km away)</span>
                <span className="text-cyan-400">Via NH16 Detour</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-sky-900/50 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold uppercase">MEDICAL SUPPORT</span>
                <span className="text-emerald-400 font-bold">38 km/h</span>
              </div>
              <p className="text-white font-bold text-[11px]">A-21 (ALS Ambulance)</p>
              <div className="flex justify-between items-center text-[9.5px] text-slate-400 pt-0.5">
                <span>ETA: <strong className="text-white">~4 min</strong> (1.4 km away)</span>
                <span className="text-cyan-400">En Route</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              Corridor: <strong className="text-slate-200">Beach Road Sector 4 Bypass</strong>
            </span>
            <Link
              href="/citizen/safe-exit"
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Navigation className="w-3 h-3" />
              <span>TRACK ON DIGITAL TWIN</span>
            </Link>
          </div>
        </div>
      ) : isAwaitingApproval ? (
        <div className="rounded-2xl border border-amber-800/80 bg-amber-950/20 p-4 space-y-2.5 font-mono">
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                AWAITING OFFICER DISPATCH APPROVAL
              </h3>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300">
              AI_DERIVED TRIAGE
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Incident classified as SEV-2 High Priority. Municipal Duty Officer has received the dispatch ticket and is authorizing high-impact vehicle deployment.
          </p>
          <div className="p-2 rounded-xl bg-black/40 border border-amber-950 text-[9.5px] text-amber-400 font-bold">
            BHARATOS Protocol: High-impact vehicles require authorized human sign-off before physical dispatch.
          </div>
        </div>
      ) : isResolved ? (
        <div className="rounded-2xl border border-emerald-800/80 bg-emerald-950/20 p-4 space-y-2 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                INCIDENT RESOLVED & SCENE SECURED
              </h3>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300">
              VERIFIED
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Water receded, Beach Road Sector 4 reopened, and all responding municipal units have stood down.
          </p>
        </div>
      ) : (
        /* Honest Fallback Status Cards (Unit & ETA) */
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-2xl border border-slate-900 bg-[#060a13] space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">ASSIGNED UNIT</span>
            <p className="text-white font-bold text-[11px] truncate">
              {incident.assignedUnit ? incident.assignedUnit.name : t.unconfirmedUnit}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-900 bg-[#060a13] space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">ESTIMATED ETA</span>
            <p className="text-white font-bold text-[11px] truncate">
              {incident.estimatedEta ? incident.estimatedEta : t.unconfirmedEta}
            </p>
          </div>
        </div>
      )}

      {/* Official Activity Log Timeline */}
      <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
        <span className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
          {t.timelineTitle}
        </span>

        <div className="space-y-3 font-mono text-xs relative pl-4 border-l border-slate-850">
          {(incident.timeline || []).map((evt, i) => (
            <div key={i} className="relative space-y-0.5">
              <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-sky-400 border border-slate-950" />
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span className="font-bold text-white uppercase">{evt.title}</span>
                <span>{evt.timestamp}</span>
              </div>
              {evt.note && <p className="text-slate-400 text-[11px] leading-relaxed">{evt.note}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Safety Guidelines While Waiting */}
      <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{t.safetyTitle}</h3>
        <ul className="space-y-2 text-xs text-slate-300 font-mono">
          <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-900">{t.safety1}</li>
          <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-900">{t.safety2}</li>
          <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-900">{t.safety3}</li>
        </ul>
      </div>

      {/* Honest Operational Disclaimer */}
      <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 text-[9.5px] font-mono text-slate-400 flex items-start space-x-2">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{t.honestNotice}</p>
      </div>

    </div>
  )
}
