'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  MapPin,
  CheckCircle2,
  LifeBuoy,
  Flame,
  Shield,
  Car,
  CloudRain,
  Waves,
  Radio,
  Mic,
  Camera,
  Video,
  Users,
  Navigation,
  ChevronRight,
  WifiOff,
  Info,
  Clock,
  Layers,
  Play,
  Square,
  Trash2,
  Bot,
  Sparkles,
  X
} from 'lucide-react'
import { useCitizenStore } from '../../../store/useCitizenStore'
import { useVizagDataStore } from '../../../store/useVizagDataStore'
import { IndexedDbService } from '../../../services/offline/indexedDbService'
import {
  EmergencyCategory,
  EmergencySeverity,
  CitizenIncident,
  LocationInfo,
  GpsLocationState,
  AppLanguage
} from '../../../types/citizen'

const reportTranslations = {
  en: {
    title: "REPORT AN EMERGENCY",
    subtitle: "Submit verified incident details to city response coordinators",
    categoryLabel: "1. Select Emergency Type",
    medical: "Medical",
    flood: "Flood / Waterlogging",
    fire: "Fire & Rescue",
    police: "Police / Safety",
    roadAccident: "Road Accident",
    general: "Other Emergency",
    floodSubtypeLabel: "Select Flood Severity / Issue Type:",
    floodSubtypes: [
      { id: 'waterlogging', label: 'Waterlogging (Roads Blocked)' },
      { id: 'blocked_drain', label: 'Blocked Drain / Overflow' },
      { id: 'rising_water', label: 'Rapidly Rising Water' },
      { id: 'stranded_person', label: 'Stranded Person / Family' },
      { id: 'vehicle_trapped', label: 'Vehicle Trapped in Water' },
      { id: 'other_flood', label: 'Other Flood Issue' }
    ],
    locationLabel: "2. Emergency Location",
    manualLocationPlaceholder: "Enter landmark or street address...",
    gpsDetecting: "Detecting location...",
    detailsLabel: "3. Incident Details & Observations",
    titlePlaceholder: "Brief summary (e.g. 50cm water stagnation near Beach Road Sector 4)",
    descPlaceholder: "Describe what is happening, visible hazards, trapped citizens, or urgent needs...",
    affectedLabel: "4. Number of People Affected / In Danger",
    mediaLabel: "5. Attach Photo / Voice Evidence (Optional)",
    voiceRecordBtn: "Record Voice Note",
    imageAttachBtn: "Attach Photo",
    videoAttachBtn: "Attach Video",
    sharedInfoNotice: "Information Shared: Your detected location, incident summary, affected count, and contact phone number will be routed to the appropriate municipal department.",
    submitBtn: "SUBMIT EMERGENCY REPORT",
    submittingBtn: "Submitting Emergency Report...",
    successTitle: "EMERGENCY REPORT RECEIVED",
    ticketLabel: "Incident ID:",
    offlineNotice: "SAVED LOCALLY IN SECURE QUEUE — WILL SYNC WHEN ONLINE",
    honestReceipt: "Awaiting Officer Dispatch Approval • High-impact resources require authorized sign-off",
    trackBtn: "Track Response on Digital Twin",
    homeBtn: "Return to Home Dashboard",
    lifecycleTitle: "RESPONSE LIFECYCLE PROGRESS"
  },
  te: {
    title: "అత్యవసర పరిస్థితిని నివేదించండి",
    subtitle: "నగర రెస్పాన్స్ కోఆర్డినేటర్లకు ధృవీకరించబడిన సమాచారం పంపండి",
    categoryLabel: "1. అత్యవసర రకాన్ని ఎంచుకోండి",
    medical: "వైద్యం",
    flood: "వరద / నీటి నిల్వ",
    fire: "అగ్నిప్రమాదం & రక్షణ",
    police: "పోలీస్ / ప్రజా రక్షణ",
    roadAccident: "రోడ్డు ప్రమాదం",
    general: "ఇతర అత్యవసరం",
    floodSubtypeLabel: "వరద రకాన్ని ఎంచుకోండి:",
    floodSubtypes: [
      { id: 'waterlogging', label: 'రోడ్లపై నీటి నిల్వ' },
      { id: 'blocked_drain', label: 'డ్రెయిన్ మూసుకుపోవడం' },
      { id: 'rising_water', label: 'వేగంగా పెరుగుతున్న నీటిమట్టం' },
      { id: 'stranded_person', label: 'చిక్కుకున్న వ్యక్తులు / కుటుంబం' },
      { id: 'vehicle_trapped', label: 'నీటిలో చిక్కుకున్న వాహనం' },
      { id: 'other_flood', label: 'ఇతర వరద సమస్య' }
    ],
    locationLabel: "2. అత్యవసర స్థలం",
    manualLocationPlaceholder: "ల్యాండ్‌మార్క్ లేదా చిరునామా నమోదు చేయండి...",
    gpsDetecting: "స్థానం గుర్తిస్తోంది...",
    detailsLabel: "3. ఇన్సిడెంట్ వివరాలు",
    titlePlaceholder: "సంక్షిప్త సారాంశం (ఉదా. బీచ్ రోడ్ వద్ద నీరు నిల్వ ఉంది)",
    descPlaceholder: "ఏమి జరిగిందో వివరించండి...",
    affectedLabel: "4. ప్రమాదంలో ఉన్న వ్యక్తుల సంఖ్య",
    mediaLabel: "5. మీడియా ఆధారాలు జోడించండి (ఐచ్ఛికం)",
    voiceRecordBtn: "వాయిస్ రికార్డ్ చేయండి",
    imageAttachBtn: "ఫోటో అప్‌లోడ్",
    videoAttachBtn: "వీడియో అప్‌లోడ్",
    sharedInfoNotice: "పంచుకున్న సమాచారం: మీ చిరునామా, వివరణ మరియు ఫోన్ నంబర్ సంబంధిత విభాగానికి పంపబడతాయి.",
    submitBtn: "అత్యవసర రిపోర్ట్ పంపండి",
    submittingBtn: "సమర్పిస్తోంది...",
    successTitle: "అత్యవసర నివేదిక స్వీకరించబడింది",
    ticketLabel: "ఇన్సిడెంట్ ID:",
    offlineNotice: "లోకల్‌గా సేవ్ చేయబడింది — కనెక్షన్ కోసం నిరీక్షణ",
    honestReceipt: "అధికారి ఆమోదం కోసం వేచి ఉంది • తగిన ధృవీకరణ తర్వాత బృందం బయలుదేరుతుంది",
    trackBtn: "డిజిటల్ ట్విన్ పై ట్రాక్ చేయండి",
    homeBtn: "హోమ్‌కు తిరిగి వెళ్ళండి",
    lifecycleTitle: "ప్రతిస్పందన పురోగతి"
  },
  hi: {
    title: "आपातकाल की रिपोर्ट करें",
    subtitle: "नगर आपातकालीन समन्वयकों को सत्यापित विवरण भेजें",
    categoryLabel: "1. आपातकाल का प्रकार चुनें",
    medical: "चिकित्सा",
    flood: "बाढ़ / जलभराव",
    fire: "अग्निशमन व बचाव",
    police: "पुलिस व सुरक्षा",
    roadAccident: "सड़क दुर्घटना",
    general: "अन्य आपातकाल",
    floodSubtypeLabel: "बाढ़ / जलभराव की श्रेणी चुनें:",
    floodSubtypes: [
      { id: 'waterlogging', label: 'सड़कों पर भारी जलभराव' },
      { id: 'blocked_drain', label: 'नाली जाम / ओवरफ्लो' },
      { id: 'rising_water', label: 'तेजी से बढ़ता जलस्तर' },
      { id: 'stranded_person', label: 'फंसे हुए नागरिक / परिवार' },
      { id: 'vehicle_trapped', label: 'पानी में फंसा वाहन' },
      { id: 'other_flood', label: 'अन्य बाढ़ समस्या' }
    ],
    locationLabel: "2. आपातकालीन स्थान",
    manualLocationPlaceholder: "लैंडमार्क या पता दर्ज करें...",
    gpsDetecting: "स्थान ट्रैक हो रहा है...",
    detailsLabel: "3. घटना का विवरण",
    titlePlaceholder: "संक्षिप्त विवरण (उदा. बीच रोड सेक्टर 4 में जलभराव)",
    descPlaceholder: "क्या हुआ, वर्तमान खतरे और नागरिक स्थिति का विवरण दें...",
    affectedLabel: "4. प्रभावित / खतरे में लोगों की संख्या",
    mediaLabel: "5. साक्ष्य जोड़ें (वैकल्पिक)",
    voiceRecordBtn: "वॉइस नोट रिकॉर्ड करें",
    imageAttachBtn: "तस्वीर जोड़ें",
    videoAttachBtn: "वीडियो जोड़ें",
    sharedInfoNotice: "साझा की गई जानकारी: आपका स्थान, घटना विवरण और संपर्क संबंधित विभाग को भेजे जाएंगे।",
    submitBtn: "आपातकालीन रिपोर्ट भेजें",
    submittingBtn: "सबमिट हो रहा है...",
    successTitle: "आपातकालीन रिपोर्ट प्राप्त हुई",
    ticketLabel: "घटना आईडी:",
    offlineNotice: "स्थानीय रूप से सुरक्षित — कनेक्शन पर सिंक होगा",
    honestReceipt: "अधिकारी अनुमोदन की प्रतीक्षा • संसाधन प्रेषण से पूर्व सत्यापन आवश्यक",
    trackBtn: "डिजिटल ट्विन पर ट्रैक करें",
    homeBtn: "होम पर लौटें",
    lifecycleTitle: "प्रतिक्रिया प्रगति चक्र"
  }
}

const LIFECYCLE_STAGES = [
  { id: 'report', label: 'Report' },
  { id: 'ai_triage', label: 'AI Triage' },
  { id: 'verified', label: 'Verified' },
  { id: 'dept_routed', label: 'Dept Routed' },
  { id: 'response', label: 'Response' },
  { id: 'resolved', label: 'Resolved' }
]

function ReportEmergencyForm() {
  const router = useRouter()
  const { profile, activeLocation, networkState, setLocation, addIncident } = useCitizenStore()
  const lang: AppLanguage = profile.language || 'en'
  const t = reportTranslations[lang as 'en' | 'te' | 'hi'] || reportTranslations.en

  // Form State
  const [category, setCategory] = useState<EmergencyCategory>('flood')
  const [floodSubtype, setFloodSubtype] = useState<string>('waterlogging')
  const [severity, setSeverity] = useState<EmergencySeverity>('high')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [affectedCount, setAffectedCount] = useState<number>(1)
  const [manualAddress, setManualAddress] = useState(activeLocation.address || '')
  const [gpsStatus, setGpsStatus] = useState<GpsLocationState>(activeLocation.gpsState || 'GPS AVAILABLE')

  // Real Media Attachment State
  const photoInputRef = React.useRef<HTMLInputElement | null>(null)
  const videoInputRef = React.useRef<HTMLInputElement | null>(null)
  const [photo, setPhoto] = useState<{ name: string; sizeKb: number; previewUrl: string } | null>(null)
  const [video, setVideo] = useState<{ name: string; sizeMb: string; previewUrl: string } | null>(null)
  
  // Voice Recording simulation state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [voiceDuration, setVoiceDuration] = useState(0)
  const [voiceNote, setVoiceNote] = useState<{ name: string; durationSec: number; sizeKb: number } | null>(null)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)

  // Voice recording timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecordingVoice])

  const handleStartVoiceRecording = () => {
    setVoiceDuration(0)
    setIsRecordingVoice(true)
  }

  const handleStopVoiceRecording = () => {
    setIsRecordingVoice(false)
    const finalSec = voiceDuration > 0 ? voiceDuration : 4
    setVoiceNote({
      name: `VOICE_NOTE_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.aac`,
      durationSec: finalSec,
      sizeKb: 32 + finalSec * 14
    })
  }

  const handleTogglePlayVoice = () => {
    setIsPlayingVoice(true)
    setTimeout(() => {
      setIsPlayingVoice(false)
    }, (voiceNote?.durationSec || 3) * 1000)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto({
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        previewUrl: URL.createObjectURL(file)
      })
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideo({
        name: file.name,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1),
        previewUrl: URL.createObjectURL(file)
      })
    }
  }

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedIncident, setSubmittedIncident] = useState<CitizenIncident | null>(null)

  // Humanized location detection handler
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
        setGpsStatus(err.code === err.PERMISSION_DENIED ? 'PERMISSION DENIED' : 'GPS UNAVAILABLE')
      }
    )
  }

  // Handle Submit
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const randomNum = Math.floor(8000 + Math.random() * 1999)
    const incId = `CIT-${randomNum}`
    const nowIso = new Date().toISOString()
    const isOffline = networkState === 'OFFLINE'

    const generatedTitle = title || (
      category === 'flood'
        ? `[FLOOD] ${floodSubtype.replace(/_/g, ' ').toUpperCase()} near ${manualAddress || activeLocation.address}`
        : `[${category.toUpperCase()} EMERGENCY] ${manualAddress || activeLocation.address}`
    )

    const incidentPayload: CitizenIncident = {
      id: incId,
      category,
      severity,
      title: generatedTitle,
      description: description || `Citizen report submitted for ${category.toUpperCase()} (${category === 'flood' ? floodSubtype : 'Standard'}). Media: Voice (${voiceNote ? voiceNote.name : 'None'}), Photo (${photo ? photo.name : 'None'}), Video (${video ? video.name : 'None'}).`,
      location: {
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        address: manualAddress || activeLocation.address,
        district: activeLocation.district || 'Visakhapatnam',
        stateName: activeLocation.stateName || 'Andhra Pradesh',
        gpsState: gpsStatus,
        isManual: gpsStatus !== 'GPS AVAILABLE'
      },
      affectedCount,
      mediaUrls: {
        voice: voiceNote ? voiceNote.name : undefined,
        images: photo ? [photo.previewUrl] : undefined,
        video: video ? video.previewUrl : undefined
      },
      stage: 'received',
      dataFreshness: isOffline ? 'offline' : 'live',
      dataSource: isOffline ? 'CACHED' : 'LIVE',
      syncState: isOffline ? 'PENDING' : 'SYNCED',
      isOfflineSaved: isOffline,
      timeline: [
        { 
          stage: 'received', 
          title: 'Emergency Report Received', 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          note: isOffline ? 'Saved in local secure queue' : 'Received by City Operations Gateway' 
        },
        { 
          stage: 'ai_analyzed', 
          title: 'AI Triage & Sensor Correlation', 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          note: 'Correlated with MVP Colony telemetry. Priority classified as HIGH.' 
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    }

    // Save to Zustand & IndexedDB
    addIncident(incidentPayload)
    await IndexedDbService.saveIncident(incidentPayload)

    // Sync to Command Center Central Pipeline
    useVizagDataStore.getState().addCitizenReport({
      id: incId,
      source: photo ? 'CITIZEN_PHOTO' : voiceNote ? 'CITIZEN_VOICE' : 'CITIZEN_TEXT',
      citizenName: profile.name || 'Citizen Reporter',
      phone: profile.phone || '+91 891 2562233',
      location: manualAddress || activeLocation.address,
      category: category === 'flood' ? `Flood (${floodSubtype})` : category.toUpperCase(),
      severity: category === 'flood' || category === 'medical' ? 'high' : 'medium',
      evidenceSummary: `${title || description} • Affected citizens: ~${affectedCount}`,
      aiTriageStatus: 'TRIAGE_PENDING',
      aiConfidence: '94%',
      recommendedAction: `Deploy ${category === 'flood' ? 'Municipal Sump Dewatering Team DP-04' : 'First Responder'} to ${manualAddress || activeLocation.address}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provenance: isOffline ? 'CACHED' : 'LIVE'
    })

    setTimeout(() => {
      setIsSubmitting(false)
      setSubmittedIncident(incidentPayload)
    }, 600)
  }

  // Submitted Confirmation View
  if (submittedIncident) {
    return (
      <div className="space-y-5 py-3 font-sans">
        <div className={`rounded-3xl p-6 text-center space-y-4 border ${
          submittedIncident.isOfflineSaved
            ? 'border-amber-800/80 bg-amber-950/20'
            : 'border-emerald-800/80 bg-emerald-950/20'
        }`}>
          <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center border-2 ${
            submittedIncident.isOfflineSaved 
              ? 'border-amber-400 text-amber-400 bg-amber-950/80' 
              : 'border-emerald-400 text-emerald-400 bg-emerald-950/80'
          }`}>
            {submittedIncident.isOfflineSaved ? <WifiOff className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </div>

          <div className="space-y-1">
            <span className="text-[9.5px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 uppercase tracking-widest">
              {submittedIncident.isOfflineSaved ? 'SAVED LOCALLY' : 'INCIDENT RECEIVED'}
            </span>
            <h2 className="text-lg font-black text-white font-mono uppercase tracking-wide pt-1">
              {t.successTitle}
            </h2>
            <p className="text-xs text-slate-300 font-mono">
              Incident ID: <span className="text-sky-400 font-bold text-sm">{submittedIncident.id}</span>
            </p>
          </div>

          {/* AI INCIDENT ANALYSIS PANEL */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/60 space-y-3.5 text-left">
            <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                  AI INCIDENT ANALYSIS
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-300">
                AI_DERIVED • 94% CONFIDENCE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-black/40 border border-indigo-950/80">
                <span className="text-[9px] text-slate-400 uppercase block">Incident Type</span>
                <span className="text-white font-bold uppercase truncate block">
                  {submittedIncident.category === 'flood' ? `Flood (${floodSubtype})` : submittedIncident.category}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-indigo-950/80">
                <span className="text-[9px] text-slate-400 uppercase block">Severity</span>
                <span className="text-amber-400 font-bold uppercase block">
                  {submittedIncident.severity.toUpperCase()}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-indigo-950/80">
                <span className="text-[9px] text-slate-400 uppercase block">Risk Level</span>
                <span className="text-red-400 font-bold uppercase block">HIGH (78/100)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-indigo-950/80 sm:col-span-2">
                <span className="text-[9px] text-slate-400 uppercase block">Affected Area</span>
                <span className="text-slate-200 font-bold truncate block">
                  {submittedIncident.location.address}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-indigo-950/80">
                <span className="text-[9px] text-slate-400 uppercase block">People Affected</span>
                <span className="text-cyan-400 font-bold block">~{affectedCount} Citizens</span>
              </div>
            </div>

            {/* RECOMMENDED DEPARTMENTS */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                RECOMMENDED DEPARTMENTS:
              </span>
              <div className="flex flex-wrap gap-2 text-[10.5px] font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-300 font-semibold flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-sky-400" />
                  Disaster Management (GVMC / NDRF)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-300 font-semibold flex items-center gap-1.5">
                  <Car className="w-3 h-3 text-amber-400" />
                  Traffic Police (Diversion)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-800/60 text-red-300 font-semibold flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-red-400" />
                  Fire & Rescue (Dewatering Pump)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <LifeBuoy className="w-3 h-3 text-emerald-400" />
                  Medical (108 Paramedic Standby)
                </span>
              </div>
            </div>

            {/* RECOMMENDED RESPONSE */}
            <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-900/40 space-y-1.5 text-xs font-mono">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                RECOMMENDED RESPONSE:
              </span>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                <li>Dispatch dewatering pump unit DP-04 to outfall drainage sump</li>
                <li>Stage traffic diversion toward NH16 Bypass corridor</li>
                <li>Issue hyper-local alert to citizens in Ward 12 catchment</li>
                <li>Await Duty Commander authorization before force deployment</li>
              </ul>
            </div>
          </div>

          {/* Attached Evidence Preview (if any) */}
          {(photo || video || voiceNote) && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-850 text-left space-y-2 font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ATTACHED MULTIMODAL EVIDENCE
              </span>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                {photo && (
                  <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
                    <img src={photo.previewUrl} alt="Report evidence" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <span className="text-[10.5px] font-bold text-white block truncate max-w-[120px]">{photo.name}</span>
                      <span className="text-[9px] text-slate-400">{photo.sizeKb} KB • Photo</span>
                    </div>
                  </div>
                )}
                {video && (
                  <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
                    <Video className="w-6 h-6 text-sky-400 ml-1" />
                    <div>
                      <span className="text-[10.5px] font-bold text-white block truncate max-w-[120px]">{video.name}</span>
                      <span className="text-[9px] text-slate-400">{video.sizeMb} MB • Video</span>
                    </div>
                  </div>
                )}
                {voiceNote && (
                  <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
                    <Mic className="w-6 h-6 text-emerald-400 ml-1" />
                    <div>
                      <span className="text-[10.5px] font-bold text-white block truncate max-w-[120px]">{voiceNote.name}</span>
                      <span className="text-[9px] text-slate-400">{voiceNote.durationSec}s • Voice Note</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Incident Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-850 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Category: <strong className="text-white uppercase">{submittedIncident.category}</strong></span>
              <span>Priority: <strong className="text-amber-400 uppercase">{submittedIncident.severity}</strong></span>
            </div>
            <h4 className="text-xs font-bold text-white leading-snug">{submittedIncident.title}</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed truncate">
              📍 {submittedIncident.location.address}
            </p>
            <div className="pt-2 border-t border-slate-900 text-[10px] text-amber-300/90 font-bold">
              ● {submittedIncident.isOfflineSaved ? t.offlineNotice : t.honestReceipt}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <Link
            href={`/citizen/incidents/${submittedIncident.id}`}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wider uppercase text-center flex items-center justify-center space-x-2 shadow-lg transition-all"
          >
            <span>{t.trackBtn}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            href="/citizen/safe-exit"
            className="w-full py-3 rounded-2xl border border-emerald-800 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 font-bold tracking-wider uppercase text-center flex items-center justify-center space-x-2 transition-all"
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>FIND SAFE EVACUATION ROUTE</span>
          </Link>

          <Link
            href="/citizen"
            className="w-full py-3 rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white font-bold tracking-wider uppercase text-center block transition-all"
          >
            {t.homeBtn}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-8 font-sans">

      {/* Header */}
      <div>
        <span className="text-[9.5px] font-mono font-black text-sky-400 uppercase tracking-widest block">
          CITY EMERGENCY GATEWAY
        </span>
        <h1 className="text-xl font-black text-white font-mono tracking-tight">{t.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmitReport} className="space-y-4">

        {/* 1. Category Picker Grid - Flood elevated as first-class citizen emergency */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
          <label className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
            {t.categoryLabel}
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            
            {/* Medical */}
            <button
              type="button"
              onClick={() => setCategory('medical')}
              className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                category === 'medical' 
                  ? 'border-red-500 bg-red-950/60 text-white font-bold shadow-sm shadow-red-950' 
                  : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <LifeBuoy className="w-4 h-4 text-red-400 shrink-0" />
              <span>{t.medical}</span>
            </button>

            {/* Flood / Waterlogging - First Class Highlight */}
            <button
              type="button"
              onClick={() => setCategory('flood')}
              className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                category === 'flood' 
                  ? 'border-sky-500 bg-sky-950/60 text-white font-bold shadow-sm shadow-sky-950 ring-1 ring-sky-500/50' 
                  : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Waves className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{t.flood}</span>
            </button>

            {/* Fire */}
            <button
              type="button"
              onClick={() => setCategory('fire')}
              className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                category === 'fire' 
                  ? 'border-orange-500 bg-orange-950/60 text-white font-bold shadow-sm shadow-orange-950' 
                  : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400 shrink-0" />
              <span>{t.fire}</span>
            </button>

            {/* Police */}
            <button
              type="button"
              onClick={() => setCategory('police')}
              className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                category === 'police' 
                  ? 'border-blue-500 bg-blue-950/60 text-white font-bold shadow-sm shadow-blue-950' 
                  : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{t.police}</span>
            </button>

            {/* Road Accident */}
            <button
              type="button"
              onClick={() => setCategory('road_accident')}
              className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                category === 'road_accident' 
                  ? 'border-amber-500 bg-amber-950/60 text-white font-bold shadow-sm shadow-amber-950' 
                  : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t.roadAccident}</span>
            </button>

            {/* Other Emergency */}
            <button
              type="button"
              onClick={() => setCategory('general')}
              className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                category === 'general' 
                  ? 'border-slate-500 bg-slate-900 text-white font-bold' 
                  : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t.general}</span>
            </button>
          </div>

          {/* Flood Subtype Selector (Shown when Flood is active) */}
          {category === 'flood' && (
            <div className="pt-2 border-t border-slate-900 space-y-2">
              <label className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider block">
                {t.floodSubtypeLabel}
              </label>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                {t.floodSubtypes.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setFloodSubtype(sub.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      floodSubtype === sub.id
                        ? 'border-sky-500 bg-sky-950/80 text-white font-bold'
                        : 'border-slate-900 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    ● {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Location Picker Card - Humanized wording */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
              {t.locationLabel}
            </label>
            <button
              type="button"
              onClick={handleDetectGps}
              className="text-[10px] font-mono font-bold text-sky-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              <span>Detect current location</span>
            </button>
          </div>

          <input
            type="text"
            required
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder={t.manualLocationPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500/60"
          />

          <div className="flex items-center space-x-1.5 text-[9.5px] font-mono font-bold">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className={gpsStatus === 'GPS AVAILABLE' ? 'text-emerald-400' : 'text-amber-400'}>
              {gpsStatus === 'GPS AVAILABLE' ? '📍 Location detected' : '⚠️ Location not detected — manual landmark entered'}
            </span>
          </div>
        </div>

        {/* 3. Details & Observations */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
          <label className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
            {t.detailsLabel}
          </label>

          <div className="space-y-2.5">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500/60"
            />

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500/60 resize-none"
            />
          </div>
        </div>

        {/* 4. Affected Count Counter */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
              {t.affectedLabel}
            </label>
            <span className="text-xs font-mono font-bold text-sky-400">{affectedCount} Person(s)</span>
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono text-xs">
            {[1, 3, 8, 15].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setAffectedCount(cnt)}
                className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  affectedCount === cnt
                    ? 'border-sky-500 bg-sky-950 text-sky-300'
                    : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {cnt === 1 ? '1 Person' : cnt === 3 ? '2-5' : cnt === 8 ? '5-10' : '10+'}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Real Multi-Modal Media Attachments */}
        <div className="rounded-2xl border border-slate-900 bg-[#060a13] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
              {t.mediaLabel}
            </label>
            <span className="text-[9.5px] font-mono text-slate-500">OPTIONAL • CAMERA / AUDIO</span>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />

          {/* Media Action Controls */}
          <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
            {/* Photo Trigger */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                photo ? 'border-sky-500 bg-sky-950/60 text-sky-300' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 text-sky-400" />
              <span>{photo ? 'Photo Loaded' : t.imageAttachBtn}</span>
            </button>

            {/* Video Trigger */}
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                video ? 'border-sky-500 bg-sky-950/60 text-sky-300' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4 text-sky-400" />
              <span>{video ? 'Video Loaded' : t.videoAttachBtn}</span>
            </button>

            {/* Voice Recorder Trigger */}
            {!isRecordingVoice ? (
              <button
                type="button"
                onClick={handleStartVoiceRecording}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  voiceNote ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300' : 'border-slate-900 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>{voiceNote ? 'Audio Ready' : t.voiceRecordBtn}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopVoiceRecording}
                className="p-2.5 rounded-xl border border-red-500 bg-red-950/80 text-white flex flex-col items-center justify-center space-y-1 animate-pulse cursor-pointer"
              >
                <Square className="w-4 h-4 text-red-400" />
                <span>Stop (00:0{voiceDuration})</span>
              </button>
            )}
          </div>

          {/* Active Voice Recording Live Bar */}
          {isRecordingVoice && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 flex items-center justify-between font-mono text-xs text-red-200 animate-pulse">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold">RECORDING VOICE OBSERVATION...</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold">00:0{voiceDuration}</span>
                <button
                  type="button"
                  onClick={handleStopVoiceRecording}
                  className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px]"
                >
                  DONE
                </button>
              </div>
            </div>
          )}

          {/* Attached Files Detail Cards */}
          {(photo || video || voiceNote) && (
            <div className="space-y-2 pt-1 font-mono text-xs">
              {/* Photo Preview Card */}
              {photo && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                  <div className="flex items-center space-x-3 truncate">
                    <img src={photo.previewUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-white text-[11px] truncate">{photo.name}</p>
                      <span className="text-[9px] text-slate-400">{photo.sizeKb} KB • Image Evidence</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Video Preview Card */}
              {video && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-white text-[11px] truncate">{video.name}</p>
                      <span className="text-[9px] text-slate-400">{video.sizeMb} MB • Hazard Video Clip</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideo(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Voice Note Preview Card */}
              {voiceNote && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                  <div className="flex items-center space-x-3 truncate">
                    <button
                      type="button"
                      onClick={handleTogglePlayVoice}
                      className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 hover:scale-105 transition-all shrink-0 cursor-pointer"
                    >
                      {isPlayingVoice ? <Square className="w-4 h-4 text-emerald-300 animate-pulse" /> : <Play className="w-4 h-4 text-emerald-300 ml-0.5" />}
                    </button>
                    <div className="truncate">
                      <p className="font-bold text-white text-[11px] truncate">
                        {voiceNote.name} {isPlayingVoice && <span className="text-emerald-400 text-[9px] animate-pulse">● Playing...</span>}
                      </p>
                      <span className="text-[9px] text-slate-400">{voiceNote.durationSec}s duration • {voiceNote.sizeKb} KB</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVoiceNote(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Data Consent & Privacy Notice */}
        <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 text-[10px] font-mono text-slate-400 flex items-start space-x-2">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{t.sharedInfoNotice}</p>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-600 hover:from-blue-500 hover:to-sky-500 active:scale-98 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-lg shadow-blue-950/40 transition-all cursor-pointer"
        >
          {isSubmitting ? t.submittingBtn : t.submitBtn}
        </button>

      </form>

    </div>
  )
}

export default function CitizenReportPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-slate-500 font-mono animate-pulse">Loading Emergency Reporter...</div>}>
      <ReportEmergencyForm />
    </Suspense>
  )
}
