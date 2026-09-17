'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  ShieldAlert, 
  Shield, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Compass,
  CheckCircle2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import BrandLogo from '../../components/ui/BrandLogo'

export default function LoginPage() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const [email, setEmail] = useState('officer@bharatos.in')
  const [password, setPassword] = useState('demo1234')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const performLogin = async (officerEmail: string, roleTitle: string = 'District Operations Lead') => {
    setLoading(true)
    setErrorMsg(null)

    setTimeout(async () => {
      const mockSession: any = {
        access_token: 'mock-jwt-token-for-bharatos-demo',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-id-001',
          aud: 'authenticated',
          role: 'authenticated',
          email: officerEmail,
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: { provider: 'email', providers: ['email'] },
          user_metadata: { full_name: 'District Operations Officer', role_name: roleTitle },
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      localStorage.setItem('bharatos_mock_session', JSON.stringify(mockSession))
      await setSession(mockSession as any)
      setLoading(false)
      router.push('/dashboard/district')
    }, 600)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both Officer ID / Email and Password.')
      return
    }
    await performLogin(email)
  }

  const handleQuickDemo = async () => {
    setEmail('officer@bharatos.in')
    setPassword('demo1234')
    await performLogin('officer@bharatos.in', 'Duty Commander (Visakhapatnam NEOC)')
  }

  return (
    <div className="flex min-h-screen w-full bg-[#030712] text-slate-100 overflow-hidden font-sans relative">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[36rem] h-[36rem] bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* LEFT SIDE: PRODUCT OVERVIEW & ARCHITECTURE */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#060a13]/60 border-r border-slate-900/60 flex-col justify-between p-12 overflow-hidden select-none">
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(18,24,38,0.1)_1.5px,transparent_1.5px)] bg-[size:30px_30px] opacity-40" />

        {/* 1. Header Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <BrandLogo size="md" />
          <span className="text-[9.5px] font-mono font-bold px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
            PROTOTYPE ENVIRONMENT • DEMONSTRATION MODE
          </span>
        </div>

        {/* 2. Platform Core Architecture & Value Narrative */}
        <div className="relative z-10 my-auto space-y-6 max-w-lg">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-sky-950/60 border border-sky-800/40 inline-block">
              SIH 2026 AI INNOVATION
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              AI-Powered Emergency Operations & Coordination
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              From emergency signals to coordinated response — BharatOS helps command centers understand incidents, coordinate departments, allocate resources, and execute response plans with human-in-the-loop oversight.
            </p>
          </div>

          {/* 6-Step Response Lifecycle */}
          <div className="p-4 rounded-2xl border border-slate-850 bg-slate-950/80 space-y-3 font-mono text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Automated Response Pipeline
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>1. Citizen Signal Triage</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>2. AI Incident Analysis</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>3. Multi-Agent Planning</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>4. Resource Matching</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>5. Officer Approval (HITL)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>6. Multi-Agency Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer Prototype Disclaimer */}
        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-4">
          <span>Visakhapatnam Working Pilot (GVMC)</span>
          <span>Simulation Mode • Demo Adapter Ready</span>
        </div>

      </div>

      {/* RIGHT SIDE: AUTHENTICATION CONSOLE PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          
          {/* Mobile Branding representation (Hidden on Desktop) */}
          <div className="flex lg:hidden flex-col items-center text-center mb-4">
            <BrandLogo size="md" />
            <span className="mt-2 text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
              PROTOTYPE • DEMONSTRATION MODE
            </span>
          </div>

          {/* Main Glassmorphic Login Container */}
          <div className="w-full rounded-2xl border border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-xl p-8 md:p-9 shadow-2xl space-y-6">
            
            {/* Console Intro / Welcome */}
            <div className="text-left space-y-1">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-sky-400" />
                <h1 className="text-xl font-black tracking-tight text-white font-mono uppercase">
                  BHARATOS COMMAND CENTER
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Authorized Operations Access • Officer Authentication
              </p>
            </div>

            {/* Quick Demo Access Callout (Judge friendly) */}
            <div className="p-3.5 rounded-xl border border-purple-800/50 bg-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-purple-300 uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  HACKATHON EVALUATOR ACCESS
                </span>
                <p className="text-[11px] text-slate-300">
                  Preloaded officer credentials for instant demo access
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider shrink-0 transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-purple-900/40 cursor-pointer"
              >
                <span>QUICK DEMO LOGIN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ALERT DISPLAY */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-red-950/40 border border-red-800/80 p-3.5 text-xs text-red-400 flex items-start space-x-2.5 font-mono"
              >
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-400 animate-pulse" />
                <div>
                  <h5 className="font-bold uppercase tracking-wider">Access Error</h5>
                  <p>{errorMsg}</p>
                </div>
              </motion.div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 font-mono">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5" htmlFor="officer-id">
                  Officer ID / Email
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none group-focus-within:text-sky-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <Input
                    id="officer-id"
                    name="email"
                    type="text"
                    required
                    placeholder="officer@bharatos.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5" htmlFor="officer-password">
                  Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none group-focus-within:text-sky-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <Input
                    id="officer-password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-xs text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-xs uppercase font-bold tracking-widest transition-all duration-300 border border-sky-400/20 shadow-lg cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in to Operations Deck...</span>
                  </span>
                ) : (
                  'SIGN IN'
                )}
              </Button>
            </form>

            {/* Direct Links */}
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
                <span>← Return to Home</span>
              </Link>
              <Link href="/citizen" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">
                Citizen Portal →
              </Link>
            </div>

          </div>

          {/* Bottom badge */}
          <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono text-center">
            <Compass className="w-3.5 h-3.5 text-slate-600" />
            <span>BHARATOS PROTOTYPE • SIMULATION ENVIRONMENT</span>
          </div>

        </div>
      </div>

    </div>
  )
}
