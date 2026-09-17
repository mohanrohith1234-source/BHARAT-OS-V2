'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Info,
  AlertTriangle,
  Radio,
  Sparkles,
  CloudRain,
  Flame,
  LifeBuoy,
  WifiOff
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { IndexedDbService } from '../../../services/offline/indexedDbService'
import { CitizenAlert, AppLanguage, EmergencySeverity } from '../../../types/citizen'

const alertsTranslations = {
  en: {
    title: "EMERGENCY ALERTS CENTER",
    subtitle: "Verified location-aware public safety advisories and official bulletins",
    tabAll: "All Alerts",
    tabActive: "Active Warnings",
    tabNearby: "Nearby Area",
    tabPrevious: "Previous Bulletins",
    officialBadge: "PUBLIC SAFETY FEED • DEMO",
    aiBadge: "BHARATOS AI",
    verifiedBadge: "SYSTEM GENERATED",
    noAlertsFound: "No emergency alerts found for selected filter.",
    recommendedActionLabel: "Recommended Safety Action:"
  },
  te: {
    title: "అత్యవసర అలర్ట్‌ల కేంద్రం",
    subtitle: "ధృవీకరించబడిన ప్రజా భద్రతా హెచ్చరికలు మరియు డెమో ప్రకటనలు",
    tabAll: "అన్ని అలర్ట్‌లు",
    tabActive: "క్రియాశీల హెచ్చరికలు",
    tabNearby: "సమీప ప్రాంతం",
    tabPrevious: "గత ప్రకటనలు",
    officialBadge: "ప్రజా భద్రత • డెమో",
    aiBadge: "AI సమాచారం",
    verifiedBadge: "సిస్టమ్ జనరేటెడ్",
    noAlertsFound: "ఎటువంటి అత్యవసర అలర్ట్‌లు కనుగొనబడలేదు.",
    recommendedActionLabel: "సిఫార్సు చేయబడిన భద్రతా చర్య:"
  },
  hi: {
    title: "आपातकालीन अलर्ट केंद्र",
    subtitle: "सार्वजनिक सुरक्षा चेतावनियाँ व डेमो बुलेटिन",
    tabAll: "सभी अलर्ट",
    tabActive: "सक्रिय चेतावनियाँ",
    tabNearby: "पास का क्षेत्र",
    tabPrevious: "पिछले बुलेटिन",
    officialBadge: "सार्वजनिक सुरक्षा • डेमो",
    aiBadge: "एआई सहायता",
    verifiedBadge: "सिस्टम जनरेटेड",
    noAlertsFound: "कोई आपातकालीन अलर्ट नहीं मिला।",
    recommendedActionLabel: "अनुशंसित सुरक्षा कार्रवाई:"
  }
}

const INITIAL_ALERTS: CitizenAlert[] = [
  {
    id: 'alt-101',
    title: 'Severe Coastal Storm & Waterlogging Warning',
    summary: 'Heavy rainfall exceeding 110mm reported across Visakhapatnam Beach Road corridors. Water depth 65cm at Beach Road Sector 4.',
    severity: 'critical',
    category: 'Flood Warning',
    affectedArea: 'Visakhapatnam Beach Road Sector 4 & MVP Colony',
    officialSource: 'SIMULATED EXTERNAL FEED (IMD / SDMA)',
    recommendedAction: 'Avoid Beach Road Sector 4 corridor. Move vehicles to elevated ground immediately.',
    timestamp: '12 mins ago',
    isVerified: true,
    status: 'active',
    dataSource: 'SIMULATION'
  },
  {
    id: 'alt-102',
    title: 'Traffic Diversion: Beach Bypass Road Closed',
    summary: 'Beach Road Sector 4 completely closed due to localized water accumulation. Police and traffic units diverting vehicles to NH16 Bypass.',
    severity: 'high',
    category: 'Traffic Advisory',
    affectedArea: 'Siripuram Junction to MVP Colony',
    officialSource: 'SYSTEM GENERATED (Traffic Police)',
    recommendedAction: 'Use National Highway 16 Bypass route instead of coastal corridors.',
    timestamp: '25 mins ago',
    isVerified: true,
    status: 'nearby',
    dataSource: 'VERIFIED'
  },
  {
    id: 'alt-103',
    title: 'AI Predicted Urban Drainage Overflow Advisory',
    summary: 'AI hydrological models project 78% likelihood of secondary drain overflow near Gajuwaka Sector within 2 hours based on upstream runoff.',
    severity: 'medium',
    category: 'AI Advisory',
    affectedArea: 'Gajuwaka Industrial Belt (Sector 3)',
    officialSource: 'BHARATOS AI (Decision Support)',
    recommendedAction: 'Clear surface drain grates and secure basement electrical supply.',
    timestamp: '45 mins ago',
    isVerified: false,
    status: 'active',
    dataSource: 'AI_DERIVED'
  },
  {
    id: 'alt-104',
    title: 'Telemetry Node SW-04 Level Normalization (Resolved)',
    summary: 'Lawson’s Bay Beach telemetry sensor reading has subsided below warning threshold (22cm / 60cm limit). Normal drainage restored.',
    severity: 'low',
    category: 'Sensor Status',
    affectedArea: 'Lawson’s Bay Beach Outfall Corridor',
    officialSource: 'SYSTEM GENERATED (GVMC IoT Twin)',
    recommendedAction: 'Normal pedestrian and vehicle movement resumed along beachfront.',
    timestamp: '2 hours ago',
    isVerified: true,
    status: 'previous',
    dataSource: 'SIMULATION'
  }
]

export default function CitizenAlertsPage() {
  const { profile, activeLocation, setAlerts } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = alertsTranslations[lang as 'en' | 'te' | 'hi'] || alertsTranslations.en

  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'nearby' | 'previous'>('all')
  const [alertsList, setAlertsList] = useState<CitizenAlert[]>(INITIAL_ALERTS)

  useEffect(() => {
    async function initAlerts() {
      // Save alerts to IndexedDB & store for offline capability
      await IndexedDbService.saveAlerts(INITIAL_ALERTS)
      const cached = await IndexedDbService.getCachedAlerts()
      if (cached.length > 0) {
        setAlertsList(cached)
        setAlerts(cached)
      } else {
        setAlertsList(INITIAL_ALERTS)
        setAlerts(INITIAL_ALERTS)
      }
    }
    initAlerts()
  }, [setAlerts])

  const filteredAlerts = alertsList.filter(item => {
    if (filterTab === 'active') return item.status === 'active'
    if (filterTab === 'nearby') return item.status === 'nearby' || item.status === 'active'
    if (filterTab === 'previous') return item.status === 'previous'
    return true
  })

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div>
        <div className="flex items-center space-x-1.5 text-[9.5px] font-mono font-bold text-amber-400 uppercase tracking-widest">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>VERIFIED PUBLIC SAFETY FEED</span>
        </div>
        <h1 className="text-xl font-black text-white font-mono tracking-tight">{t.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 gap-1.5 border border-slate-900 rounded-2xl bg-[#060a13] p-1 font-mono text-[10px]">
        <button
          onClick={() => setFilterTab('all')}
          className={`py-2 rounded-xl font-bold transition-all text-center ${
            filterTab === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.tabAll}
        </button>

        <button
          onClick={() => setFilterTab('active')}
          className={`py-2 rounded-xl font-bold transition-all text-center ${
            filterTab === 'active' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.tabActive}
        </button>

        <button
          onClick={() => setFilterTab('nearby')}
          className={`py-2 rounded-xl font-bold transition-all text-center ${
            filterTab === 'nearby' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.tabNearby}
        </button>

        <button
          onClick={() => setFilterTab('previous')}
          className={`py-2 rounded-xl font-bold transition-all text-center ${
            filterTab === 'previous' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.tabPrevious}
        </button>
      </div>

      {/* Alerts Cards Feed */}
      {filteredAlerts.length === 0 ? (
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-8 text-center text-xs font-mono text-slate-500">
          {t.noAlertsFound}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl p-4.5 space-y-3 border shadow-lg ${
                alert.severity === 'critical'
                  ? 'border-red-900/80 bg-[#170507]'
                  : alert.severity === 'high'
                  ? 'border-amber-900/80 bg-[#170b03]'
                  : 'border-slate-900 bg-[#060a13]'
              }`}
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between border-b border-slate-900/80 pb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    alert.severity === 'critical' ? 'bg-red-950 text-red-400 border-red-800' :
                    alert.severity === 'high' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                    'bg-slate-900 text-slate-300 border-slate-700'
                  }`}>
                    {alert.severity} • {alert.category}
                  </span>

                  {alert.isVerified && (
                    <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.verifiedBadge}</span>
                    </span>
                  )}
                </div>

                <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                  alert.dataSource === 'AI ASSISTED'
                    ? 'bg-purple-950 text-purple-300 border-purple-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {alert.dataSource}
                </span>
              </div>

              {/* Title & Body */}
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white leading-snug">{alert.title}</h3>
                <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">{alert.summary}</p>
              </div>

              {/* Location & Official Source */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center space-x-1 truncate max-w-[60%]">
                  <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">{alert.affectedArea}</span>
                </span>
                <span className="font-bold text-slate-300">{alert.officialSource}</span>
              </div>

              {/* Recommended Action Footer */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 text-[10px] font-mono text-amber-300/90 space-y-0.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">
                  {t.recommendedActionLabel}
                </span>
                <p className="leading-relaxed font-semibold">{alert.recommendedAction}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
