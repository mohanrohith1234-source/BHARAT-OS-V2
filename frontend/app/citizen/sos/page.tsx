'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  LifeBuoy,
  Flame,
  Shield,
  AlertTriangle,
  WifiOff,
  Navigation,
  Waves
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { IndexedDbService } from '../../../services/offline/indexedDbService'
import { 
  EmergencyCategory, 
  CitizenIncident, 
  LocationInfo, 
  GpsLocationState,
  AppLanguage,
  EmergencyContact 
} from '../../../types/citizen'

const sosTranslations = {
  en: {
    heroTitle: "EMERGENCY SOS DISPATCH",
    heroSub: "3-step high-priority emergency activation for immediate assistance",
    step1Title: "1. Who do you need?",
    step2Title: "2. Location detected",
    step3Title: "3. Activate Emergency SOS",
    medical: "Medical Emergency",
    floodRescue: "Flood Rescue / NDRF",
    fire: "Fire & Rescue",
    police: "Police / Public Safety",
    btnActivate: "ACTIVATE SOS NOW",
    btnActivating: "COMMISSIONING SOS...",
    locationDetected: "📍 MVP Colony, Visakhapatnam (Ward 12)",
    locationRecheck: "Re-check location",
    manualLocationPlaceholder: "Enter landmark or street address...",
    contactsHeader: "Emergency Contacts Notification Request:",
    contactsSimulatedBadge: "DEMO NOTIFICATION",
    statusRequested: "Notification Requested",
    submitConfirmation: "EMERGENCY SOS ACTIVE",
    incidentId: "Incident ID:",
    offlineNotice: "SOS SAVED LOCALLY — WAITING FOR SECURE CONNECTION",
    honestReceipt: "Awaiting Officer Dispatch Approval • High-impact resources require authorized sign-off",
    assignedUnitLabel: "Assigned Response Unit:",
    departmentLabel: "Department Notified:",
    etaLabel: "Estimated Arrival Time (ETA):",
    trackIncidentBtn: "TRACK LIVE RESPONSE ON MAP",
    backHomeBtn: "Return to Home Dashboard",
    safetyHeader: "Immediate Safety Guidelines:",
    safetyStep1: "1. Move to an elevated, structurally safe location if flood water is rising.",
    safetyStep2: "2. Keep your mobile phone free for inbound coordinator calls.",
    safetyStep3: "3. Prepare a bright flashlight or cloth to signal arrival of emergency units."
  },
  te: {
    heroTitle: "అత్యవసర SOS సక్రియం",
    heroSub: "తక్షణ సహాయం కోసం 3-దశల అత్యవసర రెస్పాన్స్ సక్రియం",
    step1Title: "1. మీకు ఏ సహాయం కావాలి?",
    step2Title: "2. లొకేషన్ గుర్తించబడింది",
    step3Title: "3. SOS సక్రియం చేయండి",
    medical: "వైద్య అత్యవసరం",
    floodRescue: "వరద రక్షణ / NDRF",
    fire: "అగ్నిప్రమాదం & రక్షణ",
    police: "పోలీస్ / ప్రజా రక్షణ",
    btnActivate: "ఇప్పుడే SOS యాక్టివేట్ చేయండి",
    btnActivating: "సక్రియం అవుతోంది...",
    locationDetected: "📍 MVP కాలనీ, విశాఖపట్నం (వార్డు 12)",
    locationRecheck: "లొకేషన్ మళ్ళీ తనిఖీ చేయండి",
    manualLocationPlaceholder: "ల్యాండ్‌మార్క్ లేదా చిరునామా నమోదు చేయండి...",
    contactsHeader: "అత్యవసర కాంటాక్ట్‌ల నోటిఫికేషన్ అభ్యర్థన:",
    contactsSimulatedBadge: "డెమో నోటిఫికేషన్",
    statusRequested: "నోటిఫికేషన్ అభ్యర్థించబడింది",
    submitConfirmation: "అత్యవసర SOS సక్రియంగా ఉంది",
    incidentId: "ఇన్సిడెంట్ ID:",
    offlineNotice: "SOS లోకల్‌గా సేవ్ చేయబడింది — కనెక్షన్ కోసం నిరీక్షణ",
    honestReceipt: "అధికారి ఆమోదం కోసం వేచి ఉంది • తగిన ధృవీకరణ తర్వాత బృందం బయలుదేరుతుంది",
    assignedUnitLabel: "కేటాయించిన రెస్పాన్స్ యూనిట్:",
    departmentLabel: "నోటిఫై చేయబడిన విభాగం:",
    etaLabel: "చేరుకునే అంచనా సమయం:",
    trackIncidentBtn: "మ్యాప్‌లో ట్రాక్ చేయండి",
    backHomeBtn: "హోమ్‌కు తిరిగి వెళ్లండి",
    safetyHeader: "తక్షణ భద్రతా సూచనలు:",
    safetyStep1: "1. నీటిమట్టం పెరుగుతుంటే ఎత్తైన సురక్షిత ప్రదేశంలో ఉండండి.",
    safetyStep2: "2. అత్యవసర కాల్‌ల కోసం మీ ఫోన్ లైన్ ఉచితంగా ఉంచండి.",
    safetyStep3: "3. రక్షక బృందాలు వచ్చినప్పుడు సంకేతం ఇవ్వండి."
  },
  hi: {
    heroTitle: "आपातकालीन एसओएस प्रेषण",
    heroSub: "त्वरित सहायता के लिए 3-चरणीय उच्च प्राथमिकता सक्रियण",
    step1Title: "1. आपको किसकी आवश्यकता है?",
    step2Title: "2. स्थान का पता चला",
    step3Title: "3. आपातकालीन एसओएस सक्रिय करें",
    medical: "चिकित्सा आपातकाल",
    floodRescue: "बाढ़ बचाव / एनडीआरएफ",
    fire: "अग्निशमन व बचाव",
    police: "पुलिस व सुरक्षा",
    btnActivate: "अभी एसओएस सक्रिय करें",
    btnActivating: "सक्रिय हो रहा है...",
    locationDetected: "📍 एमवीपी कॉलोनी, विशाखापत्तनम (वार्ड 12)",
    locationRecheck: "स्थान पुनः जांचें",
    manualLocationPlaceholder: "लैंडमार्क या पता दर्ज करें...",
    contactsHeader: "आपातकालीन संपर्क सूचना अनुरोध:",
    contactsSimulatedBadge: "डेमो सूचना",
    statusRequested: "सूचना का अनुरोध किया गया",
    submitConfirmation: "आपातकालीन एसओएस सक्रिय",
    incidentId: "घटना आईडी:",
    offlineNotice: "एसओएस स्थानीय रूप से सहेजा गया — कनेक्शन की प्रतीक्षा",
    honestReceipt: "अधिकारी अनुमोदन की प्रतीक्षा • संसाधन प्रेषण से पूर्व सत्यापन आवश्यक",
    assignedUnitLabel: "आवंटित प्रतिक्रिया इकाई:",
    departmentLabel: "अधिसूचित विभाग:",
    etaLabel: "अनुमानित आगमन समय:",
    trackIncidentBtn: "मानचित्र पर स्थिति ट्रैक करें",
    backHomeBtn: "होम पर लौटें",
    safetyHeader: "तत्काल सुरक्षा निर्देश:",
    safetyStep1: "1. जलस्तर बढ़ने पर ऊंचे और सुरक्षित स्थान पर रहें।",
    safetyStep2: "2. आने वाली कॉल के लिए फोन लाइन खाली रखें।",
    safetyStep3: "3. बचाव दल आगमन पर टार्च या कपड़े से संकेत दें।"
  }
}

import { useVizagDataStore } from '../../../store/useVizagDataStore'

export default function SosEmergencyPage() {
  const { profile, activeLocation, networkState, setLocation, addIncident, setEmergencyMode } = useCitizenStore()
  const { incident: vizagIncident, resources: vizagResources } = useVizagDataStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = sosTranslations[lang as 'en' | 'te' | 'hi'] || sosTranslations.en

  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('flood')
  const [manualAddress, setManualAddress] = useState(activeLocation.address || 'MVP Colony, Visakhapatnam (Ward 12)')
  const [gpsStatus, setGpsStatus] = useState<GpsLocationState>(activeLocation.gpsState || 'GPS AVAILABLE')
  const [isActivating, setIsActivating] = useState(false)
  const [activatedIncident, setActivatedIncident] = useState<CitizenIncident | null>(null)

  // Handlers for location detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('GPS UNAVAILABLE')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const updatedLoc: LocationInfo = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          address: manualAddress || `MVP Colony, Visakhapatnam (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E)`,
          district: 'Visakhapatnam',
          stateName: 'Andhra Pradesh',
          gpsState: 'GPS AVAILABLE'
        }
        setLocation(updatedLoc)
        setGpsStatus('GPS AVAILABLE')
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('PERMISSION DENIED')
        } else {
          setGpsStatus('GPS UNAVAILABLE')
        }
      }
    )
  }

  // Trigger SOS Activation
  const handleTriggerSos = async () => {
    setIsActivating(true)
    
    // Generate citizen incident ID
    const randomNum = Math.floor(8000 + Math.random() * 1999)
    const incId = `CIT-SOS-${randomNum}`
    const nowIso = new Date().toISOString()
    const isOffline = networkState === 'OFFLINE'

    // Get assigned unit from shared simulation store or fallback
    const assignedUnitName = vizagIncident.assignedUnits.length > 0 
      ? vizagIncident.assignedUnits.join(', ')
      : (selectedCategory === 'flood' ? 'FT-12 (GVMC High-Capacity Dewatering)' : selectedCategory === 'medical' ? 'A-21 (Advanced Life Support)' : 'P-305 (Sector Patrol)')

    const departmentName = selectedCategory === 'flood' 
      ? 'NDRF / GVMC Disaster Response' 
      : selectedCategory === 'medical' 
      ? 'Andhra Health & 108 Operations' 
      : selectedCategory === 'fire' 
      ? 'AP State Fire & Rescue Services' 
      : 'Visakhapatnam City Police'

    const sosIncident: CitizenIncident = {
      id: incId,
      category: selectedCategory,
      severity: 'critical',
      title: `HIGH-PRIORITY SOS — ${selectedCategory === 'flood' ? 'FLOOD RESCUE' : selectedCategory.toUpperCase()}`,
      description: `Immediate 1-Tap SOS Emergency activation triggered by citizen from ${manualAddress || activeLocation.address}. Unit requested: ${assignedUnitName}.`,
      location: {
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        address: manualAddress || activeLocation.address,
        district: activeLocation.district || 'Visakhapatnam',
        stateName: activeLocation.stateName || 'Andhra Pradesh',
        gpsState: gpsStatus,
        isManual: gpsStatus !== 'GPS AVAILABLE'
      },
      affectedCount: 1,
      mediaUrls: {},
      stage: 'received',
      dataFreshness: isOffline ? 'offline' : 'live',
      dataSource: isOffline ? 'CACHED' : 'LIVE',
      syncState: isOffline ? 'PENDING' : 'SYNCED',
      isOfflineSaved: isOffline,
      assignedDepartment: departmentName,
      assignedUnit: {
        name: assignedUnitName,
        type: selectedCategory === 'flood' ? 'NDRF / Dewatering' : 'Rapid Emergency',
        phone: '+91 891 2562233'
      },
      estimatedEta: '4-7 Mins',
      timeline: [
        { 
          stage: 'received', 
          title: 'SOS Emergency Signal Received', 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          note: isOffline ? 'Saved in local secure queue' : 'Received by City Operations Gateway' 
        },
        {
          stage: 'ai_analyzed',
          title: 'AI Priority Classification: Critical Level 1',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `High-impact alert flagged to Officer Desk. Target unit: ${assignedUnitName}`
        }
      ],
      safetyInstructions: [
        t.safetyStep1,
        t.safetyStep2,
        t.safetyStep3
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    }

    // Save to store and IndexedDB
    addIncident(sosIncident)
    await IndexedDbService.saveIncident(sosIncident)

    // Sync directly to Command Center Central Pipeline
    useVizagDataStore.getState().addCitizenReport({
      id: incId,
      source: 'CITIZEN_SOS',
      citizenName: profile.name || 'Citizen SOS Beacon',
      phone: profile.phone || '+91 891 2562233',
      location: manualAddress || activeLocation.address,
      category: selectedCategory === 'flood' ? 'Flood Rescue' : selectedCategory.toUpperCase(),
      severity: 'critical',
      evidenceSummary: `1-Tap SOS Distress Ping. Unit requested: ${assignedUnitName}. Location: ${manualAddress || activeLocation.address}`,
      aiTriageStatus: 'TRIAGE_PENDING',
      aiConfidence: '98%',
      recommendedAction: `Deploy ${assignedUnitName} to ${manualAddress || activeLocation.address}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provenance: isOffline ? 'CACHED' : 'LIVE'
    })
    
    // Enable Emergency Focus Mode
    setEmergencyMode(true)

    // Set confirmation UI state
    setTimeout(() => {
      setIsActivating(false)
      setActivatedIncident(sosIncident)
    }, 600)
  }

  return (
    <div className="space-y-5 pb-8 font-sans">

      {!activatedIncident ? (
        <>
          {/* Hero Header */}
          <div className="text-center space-y-1">
            <span className="text-[9.5px] font-mono font-black text-red-500 uppercase tracking-widest px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 inline-block animate-pulse">
              ● 1-TAP HIGH-PRIORITY SOS
            </span>
            <h1 className="text-xl font-black text-white font-mono tracking-tight">{t.heroTitle}</h1>
            <p className="text-xs text-slate-400">{t.heroSub}</p>
          </div>

          {/* STEP 1: Who do you need? */}
          <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-900/80 pb-2">
              <label className="text-[10.5px] font-mono font-bold text-slate-200 uppercase tracking-wider">
                {t.step1Title}
              </label>
              <span className="text-[9px] font-mono text-sky-400 font-bold">STEP 1 OF 3</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Flood Rescue - Highlighted */}
              <button
                type="button"
                onClick={() => setSelectedCategory('flood')}
                className={`p-3 rounded-2xl border font-mono text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  selectedCategory === 'flood'
                    ? 'border-sky-500 bg-sky-950/80 text-white shadow-lg shadow-sky-950/50 ring-1 ring-sky-500/50'
                    : 'border-slate-900 bg-[#040813] text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="p-2 rounded-xl bg-sky-950/90 text-sky-400 border border-sky-800/60">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold block">{t.floodRescue}</span>
                  <span className="text-[9.5px] text-slate-400">Boat / Dewatering</span>
                </div>
              </button>

              {/* Medical */}
              <button
                type="button"
                onClick={() => setSelectedCategory('medical')}
                className={`p-3 rounded-2xl border font-mono text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  selectedCategory === 'medical'
                    ? 'border-red-500 bg-red-950/80 text-white shadow-lg shadow-red-950/50'
                    : 'border-slate-900 bg-[#040813] text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="p-2 rounded-xl bg-red-950/90 text-red-400 border border-red-800/60">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold block">{t.medical}</span>
                  <span className="text-[9.5px] text-slate-400">ALS Ambulance</span>
                </div>
              </button>

              {/* Fire */}
              <button
                type="button"
                onClick={() => setSelectedCategory('fire')}
                className={`p-3 rounded-2xl border font-mono text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  selectedCategory === 'fire'
                    ? 'border-orange-500 bg-orange-950/80 text-white shadow-lg shadow-orange-950/50'
                    : 'border-slate-900 bg-[#040813] text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="p-2 rounded-xl bg-orange-950/90 text-orange-400 border border-orange-800/60">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold block">{t.fire}</span>
                  <span className="text-[9.5px] text-slate-400">Rescue Tender</span>
                </div>
              </button>

              {/* Police */}
              <button
                type="button"
                onClick={() => setSelectedCategory('police')}
                className={`p-3 rounded-2xl border font-mono text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  selectedCategory === 'police'
                    ? 'border-blue-500 bg-blue-950/80 text-white shadow-lg shadow-blue-950/50'
                    : 'border-slate-900 bg-[#040813] text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-950/90 text-blue-400 border border-blue-800/60">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold block">{t.police}</span>
                  <span className="text-[9.5px] text-slate-400">Patrol Unit</span>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: Location detected */}
          <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-900/80 pb-2">
              <label className="text-[10.5px] font-mono font-bold text-slate-200 uppercase tracking-wider">
                {t.step2Title}
              </label>
              <button 
                type="button" 
                onClick={handleDetectGps}
                className="text-[10px] font-mono font-bold text-sky-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Navigation className="w-3 h-3" />
                <span>{t.locationRecheck}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center space-x-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {manualAddress || activeLocation.address}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  ● Verified Sector Location (Ward 12, Visakhapatnam)
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: Primary SOS Dispatch Button */}
          <div className="rounded-2xl border border-red-950/60 bg-red-950/10 p-4 space-y-3 text-center">
            <div className="flex items-center justify-between border-b border-red-950/40 pb-2">
              <label className="text-[10.5px] font-mono font-bold text-red-300 uppercase tracking-wider">
                {t.step3Title}
              </label>
              <span className="text-[9px] font-mono text-red-400 font-bold">STEP 3 OF 3</span>
            </div>

            <button
              onClick={handleTriggerSos}
              disabled={isActivating}
              aria-label="Trigger High-Priority SOS Emergency"
              className="w-full h-24 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white font-mono font-black text-base tracking-widest uppercase shadow-[0_0_35px_rgba(239,68,68,0.45)] border-2 border-red-300 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-200"
            >
              <ShieldAlert className="w-7 h-7 animate-bounce" />
              <span>{isActivating ? t.btnActivating : t.btnActivate}</span>
            </button>
            
            <p className="text-[10px] text-slate-400 font-mono">
              ⚡ Transmits instant distress ping to Visakhapatnam Emergency Command & dispatches designated sector units.
            </p>
          </div>

          {/* Emergency Contacts Notification Card */}
          <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                {t.contactsHeader}
              </span>
              <span className="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300">
                {t.contactsSimulatedBadge}
              </span>
            </div>

            <div className="space-y-2">
              {profile.emergencyContacts.map((contact: EmergencyContact) => (
                <div key={contact.id} className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-slate-950 border border-slate-900">
                  <div>
                    <span className="font-bold text-white block">{contact.name} ({contact.relationship})</span>
                    <span className="text-[10px] text-slate-400">{contact.phone}</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/40">
                    {t.statusRequested}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Post-Activation Live Tracking Display */
        <div className="space-y-5 py-3 font-sans">
          
          <div className={`rounded-3xl p-6 text-center space-y-4 border ${
            activatedIncident.isOfflineSaved 
              ? 'border-amber-800/80 bg-amber-950/20' 
              : 'border-red-800/80 bg-red-950/20 shadow-xl shadow-red-950/30'
          }`}>
            <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center border-2 ${
              activatedIncident.isOfflineSaved ? 'border-amber-400 text-amber-400 bg-amber-950/80' : 'border-red-400 text-red-400 bg-red-950/80'
            }`}>
              {activatedIncident.isOfflineSaved ? <WifiOff className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8 animate-pulse text-red-400" />}
            </div>

            <div className="space-y-1">
              <span className="text-[9.5px] font-mono font-bold px-2.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 uppercase tracking-widest">
                ● SOS ACTIVE — RESPONSE DISPATCHED
              </span>
              <h2 className="text-lg font-black text-white font-mono uppercase tracking-wide pt-1">
                {t.submitConfirmation}
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                {t.incidentId} <span className="text-sky-400 font-bold text-sm">{activatedIncident.id}</span>
              </p>
            </div>

            {/* Response Unit Assignment Details */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-left text-xs font-mono space-y-2.5">
              <div className="flex justify-between items-center text-[10.5px] border-b border-slate-900 pb-2">
                <span className="text-slate-400">{t.assignedUnitLabel}</span>
                <span className="text-emerald-400 font-bold">{activatedIncident.assignedUnit?.name || 'FT-12 (GVMC High-Capacity Dewatering)'}</span>
              </div>

              <div className="flex justify-between items-center text-[10.5px] border-b border-slate-900 pb-2">
                <span className="text-slate-400">{t.departmentLabel}</span>
                <span className="text-sky-300 font-bold">{activatedIncident.assignedDepartment || 'NDRF / GVMC Disaster Response'}</span>
              </div>

              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-400">{t.etaLabel}</span>
                <span className="text-amber-400 font-bold text-sm">{activatedIncident.estimatedEta || '4-7 Mins'}</span>
              </div>

              <div className="pt-2 border-t border-slate-900 text-[10px] text-amber-300/90 font-bold">
                ● {activatedIncident.isOfflineSaved ? t.offlineNotice : t.honestReceipt}
              </div>
            </div>
          </div>

          {/* Immediate Safety Guidelines */}
          <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{t.safetyHeader}</h3>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-900">{t.safetyStep1}</li>
              <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-900">{t.safetyStep2}</li>
              <li className="p-2.5 rounded-xl bg-slate-950 border border-slate-900">{t.safetyStep3}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-1 font-mono text-xs">
            <Link
              href={`/citizen/incidents/${activatedIncident.id}`}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold tracking-wider uppercase text-center flex items-center justify-center space-x-2 shadow-lg transition-all"
            >
              <span>{t.trackIncidentBtn}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/citizen"
              className="w-full py-3.5 rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white font-bold tracking-wider uppercase text-center block transition-all"
            >
              {t.backHomeBtn}
            </Link>
          </div>

        </div>
      )}

    </div>
  )
}
