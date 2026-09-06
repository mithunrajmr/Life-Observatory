import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Telescope, Sparkles, Lock, AlertCircle, Play, Pause, Activity } from 'lucide-react';

interface LandingHeroProps {
  onSignIn: () => void;
  onSignInRedirect?: () => void;
  onExploreDemo: () => void;
  authError?: string | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSignIn,
  onSignInRedirect,
  onExploreDemo,
  authError,
}) => {
  const [lensMode, setLensMode] = useState<'calibrated' | 'noise'>('calibrated');
  const [activePin, setActivePin] = useState<number | null>(2);
  const [scannerX, setScannerX] = useState<number>(235);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [tickerIndex, setTickerIndex] = useState<number>(0);

  const telemetrySignals = [
    { domain: 'Learning', tag: '+38% Resilience', time: 'Day 28', desc: 'Execution held steady through 4 high-friction meetings.' },
    { domain: 'Career', tag: 'Boundary Stabilized', time: 'Day 45', desc: 'Shifted from late-night sprints to 6:30 AM deep work.' },
    { domain: 'Energy', tag: 'Recovery Cadence', time: 'Day 72', desc: 'Sleep cadence stabilized following calendar focus restructuring.' },
    { domain: 'Direction', tag: 'Trajectory Aligned', time: 'Day 90', desc: '3 core domains compounding in positive momentum.' },
  ];

  // Auto-scan cycle for the aperture preview
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScannerX((prev) => {
        if (prev >= 380) return 40;
        return prev + 2;
      });
    }, 45);
    return () => clearInterval(interval);
  }, [isScanning]);

  // Telemetry stream ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % telemetrySignals.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [telemetrySignals.length]);

  const samplePins = [
    {
      id: 1,
      x: 110,
      y: 75,
      date: 'Jun 14',
      domain: 'Learning',
      color: '#10B981',
      title: 'Routine Anchor Point',
      note: 'Shifted from erratic late sprints to steady 6:30 AM reading block.',
    },
    {
      id: 2,
      x: 235,
      y: 50,
      date: 'Aug 08',
      domain: 'Career',
      color: '#38BDF8',
      title: 'Invisible Progress Detected',
      note: 'Resilience increased 38% over 60-day baseline despite 4 fatigue days.',
    },
    {
      id: 3,
      x: 350,
      y: 28,
      date: 'Sep 02',
      domain: 'Health',
      color: '#F59E0B',
      title: 'Recovery Trajectory',
      note: 'Sleep cadence stabilized following calendar focus restructuring.',
    },
  ];

  const currentTelemetry = telemetrySignals[tickerIndex];

  return (
    <section className="relative pt-6 pb-16 sm:pt-12 sm:pb-24 overflow-hidden border-b border-[#DDE2DD]/80">
      {/* Dynamic Animated Ambient Background Glows */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 observatory-grid" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-gradient-to-br from-[#34D399]/15 via-[#38BDF8]/10 to-transparent blur-3xl pointer-events-none -z-10 animate-pulse-glow" 
        aria-hidden="true"
      />
      <div 
        className="absolute top-20 right-10 w-[500px] h-[300px] bg-gradient-to-bl from-[#F59E0B]/10 via-[#818CF8]/10 to-transparent blur-3xl pointer-events-none -z-10 animate-pulse-glow" 
        style={{ animationDelay: '1.8s' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Hero Narrative */}
          <motion.div 
            className="lg:col-span-6 space-y-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Live Telemetry Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#3E8064]/30 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
              </span>
              <span className="font-mono text-[11px] text-[#355C4A] font-bold uppercase tracking-wider">
                Personal Life Observatory · 90-Day Telemetry
              </span>
            </div>

            {/* Main Punchy Editorial Headline */}
            <div className="space-y-3">
              <h1 className="font-editorial text-4xl sm:text-6xl text-[#1D2421] tracking-tight leading-[1.08]">
                What if you could actually <br className="hidden sm:inline" />
                <span className="italic text-[#355C4A] relative">
                  see yourself changing?
                  <span className="absolute left-0 right-0 -bottom-1 h-[3px] bg-gradient-to-r from-[#10B981] via-[#38BDF8] to-[#F59E0B] rounded-full opacity-60" />
                </span>
              </h1>

              <p className="text-base sm:text-[1.1rem] text-[#4F5A55] leading-relaxed max-w-xl pt-1">
                We live day to day, but evaluate our lives across seasons. Because compounding change is imperceptible in the moment, we abandon meaningful pursuits right before they bear fruit. Life Observatory turns everyday reflections into an enduring multi-domain picture of how your life is evolving.
              </p>
            </div>

            {/* Auth Notice if Error */}
            {authError && (
              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex flex-col gap-2.5 shadow-2xs animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#DC2626]" />
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold">Sign-in Notice:</p>
                    <p className="font-mono text-[11px] leading-relaxed">{authError}</p>
                  </div>
                </div>
                {onSignInRedirect && (
                  <button
                    onClick={onSignInRedirect}
                    className="self-start ml-6 px-3 py-1.5 rounded-lg bg-[#DC2626] text-white font-medium text-xs hover:bg-[#B91C1C] transition"
                  >
                    Try Direct Page Redirect Instead →
                  </button>
                )}
              </div>
            )}

            {/* Live Streaming Signal Bar (Replaces Static Text) */}
            <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EBF2ED] text-[#355C4A] flex items-center justify-center shrink-0">
                <Activity size={16} className="animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[10.5px] font-mono mb-0.5">
                  <span className="text-[#355C4A] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    {currentTelemetry.domain} Signal ({currentTelemetry.time})
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#EDF7F2] text-[#3E8064] font-semibold">
                    {currentTelemetry.tag}
                  </span>
                </div>
                <p className="text-xs text-[#66706B] truncate">
                  {currentTelemetry.desc}
                </p>
              </div>
            </div>

            {/* Primary Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onExploreDemo}
                className="btn-primary text-sm py-3.5 px-6 shadow-md justify-center gap-2.5 font-heading font-semibold hover:scale-[1.02] transition-transform"
                title="Launch live prototype with pre-populated sample reflections"
              >
                <Telescope size={17} />
                <span>Explore the Observatory</span>
              </button>

              <button
                onClick={onSignIn}
                className="btn-secondary text-xs py-3.5 px-5 justify-center gap-2 font-medium"
                title="Sign in with your Google account"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign In with Google</span>
              </button>

              <a
                href="https://github.com/mithunrajmr/Life-Observatory"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#66706B] hover:text-[#1D2421] px-3.5 py-2 text-center transition flex items-center justify-center gap-1.5"
              >
                <span>GitHub</span>
                <span className="text-[10px] text-[#8A938E]">↗</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#66706B] font-body">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Zero streak anxiety
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                No 1–10 scalar ratings
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-[#355C4A]" />
                Metadata-only context
              </span>
            </div>
          </motion.div>

          {/* Right Visual Aperture Centerpiece with Interactive Dual Lenses */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative rounded-3xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-elevated p-5 sm:p-7 aperture-glow overflow-hidden">
              {/* Aperture Masthead with Lens Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#DDE2DD]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#1D2421]">
                    The Life Horizon · Aperture Lens
                  </span>
                </div>

                {/* Interactive Mode Pill (Shows Eye the Difference Instantly) */}
                <div className="flex items-center p-1 rounded-xl bg-[#F1F2EE] border border-[#DDE2DD] text-xs font-mono">
                  <button
                    onClick={() => setLensMode('calibrated')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      lensMode === 'calibrated'
                        ? 'bg-[#355C4A] text-white font-bold shadow-xs'
                        : 'text-[#66706B] hover:text-[#1D2421]'
                    }`}
                  >
                    ✦ Calibrated
                  </button>
                  <button
                    onClick={() => setLensMode('noise')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      lensMode === 'noise'
                        ? 'bg-[#A95C58] text-white font-bold shadow-xs'
                        : 'text-[#66706B] hover:text-[#1D2421]'
                    }`}
                  >
                    ≈ Daily Fog
                  </button>
                </div>
              </div>

              {/* Dynamic SVG Horizon Silhouette with Laser Scanner */}
              <div className="rounded-2xl bg-[#0D1210] p-4 sm:p-5 border border-white/10 relative overflow-hidden text-white">
                {/* Visual header */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-editorial text-sm font-medium text-white/90">
                    {lensMode === 'calibrated' 
                      ? 'Compounding momentum across 90-day baseline' 
                      : 'Distorted day-to-day emotional perception'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsScanning(!isScanning)}
                      className="p-1 rounded-md bg-white/10 text-white/70 hover:text-white transition"
                      title={isScanning ? 'Pause laser scan' : 'Play laser scan'}
                    >
                      {isScanning ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                      lensMode === 'calibrated' ? 'bg-[#10B981]/20 text-[#34D399]' : 'bg-[#EF4444]/20 text-[#F87171]'
                    }`}>
                      {lensMode === 'calibrated' ? '4 Domains Ascending' : 'Recency Bias Active'}
                    </span>
                  </div>
                </div>

                <svg viewBox="0 0 400 135" className="w-full h-36 overflow-visible" role="img" aria-label="Life Horizon visualization">
                  <defs>
                    <linearGradient id="heroEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="heroCyanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="110" x2="400" y2="110" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

                  {lensMode === 'calibrated' ? (
                    <>
                      {/* Domain 1: Energy (Amber) */}
                      <path d="M 0 100 Q 120 105, 240 75 T 400 50" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeDasharray="4 2" opacity="0.8" />

                      {/* Domain 2: Health (Terracotta) */}
                      <path d="M 0 90 Q 100 85, 200 75 T 400 32" fill="none" stroke="#FB923C" strokeWidth="2.2" />

                      {/* Domain 3: Career (Cyan) */}
                      <path d="M 0 80 Q 130 70, 220 82 T 400 38 L 400 135 L 0 135 Z" fill="url(#heroCyanGrad)" />
                      <path d="M 0 80 Q 130 70, 220 82 T 400 38" fill="none" stroke="#38BDF8" strokeWidth="2.4" />

                      {/* Domain 4: Learning (Emerald) */}
                      <path d="M 0 95 Q 110 88, 210 60 T 400 22 L 400 135 L 0 135 Z" fill="url(#heroEmeraldGrad)" />
                      <path d="M 0 95 Q 110 88, 210 60 T 400 22" fill="none" stroke="#34D399" strokeWidth="3" className="observatory-glow-emerald" />

                      {/* Interactive Inflection Pins */}
                      {samplePins.map((pin) => {
                        const isSelected = activePin === pin.id;
                        return (
                          <g 
                            key={pin.id} 
                            className="cursor-pointer"
                            onClick={() => setActivePin(pin.id)}
                          >
                            <circle
                              cx={pin.x}
                              cy={pin.y}
                              r={isSelected ? 6.5 : 4.5}
                              fill={pin.color}
                              stroke="#FFFFFF"
                              strokeWidth="2.5"
                              className="transition-all duration-200"
                            />
                            {isSelected && (
                              <circle
                                cx={pin.x}
                                cy={pin.y}
                                r="12"
                                fill="none"
                                stroke={pin.color}
                                strokeWidth="1.5"
                                className="animate-ping opacity-75"
                              />
                            )}
                          </g>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {/* Chaotic Noisy Fog Curves */}
                      <path
                        d="M 0 80 Q 40 20, 80 110 T 160 40 T 240 120 T 320 30 T 400 100"
                        fill="none"
                        stroke="#F87171"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        className="animate-pulse"
                      />
                      <text x="200" y="70" textAnchor="middle" fill="#FCA5A5" className="text-[11px] font-mono font-bold">
                        ⚠️ EMOTIONAL VOLATILITY: YOU FEEL LIKE NOTHING COMPOUNDED
                      </text>
                    </>
                  )}

                  {/* Animated Vertical Laser Scan Line */}
                  <line
                    x1={scannerX}
                    y1="10"
                    x2={scannerX}
                    y2="125"
                    stroke="#34D399"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.85"
                  />
                  <circle
                    cx={scannerX}
                    cy="65"
                    r="3.5"
                    fill="#34D399"
                    className="shadow-sm"
                  />
                </svg>

                {/* Timeline Axis Labels */}
                <div className="flex justify-between text-[10px] font-mono uppercase text-white/50 mt-2 pt-2 border-t border-white/10">
                  <span>90 Days Ago</span>
                  <span>Day 45 (Turning Point)</span>
                  <span>Day 70</span>
                  <span className="text-[#34D399] font-bold">Today (Calibrated)</span>
                </div>
              </div>

              {/* Dynamic Callout for Selected Pin */}
              {activePin && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#FAF9F5] border border-[#DDE2DD] flex items-start gap-3 animate-fade-in">
                  <div className="w-6 h-6 rounded-lg bg-[#355C4A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles size={13} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-heading font-bold text-[#1D2421]">
                        {samplePins.find(p => p.id === activePin)?.title}
                      </span>
                      <span className="font-mono text-[#355C4A] text-[10px] font-semibold">
                        {samplePins.find(p => p.id === activePin)?.domain} · {samplePins.find(p => p.id === activePin)?.date}
                      </span>
                    </div>
                    <p className="text-xs text-[#4F5A55] leading-relaxed">
                      "{samplePins.find(p => p.id === activePin)?.note}"
                    </p>
                  </div>
                </div>
              )}

              {/* Footer Guide */}
              <div className="mt-3 pt-3 border-t border-[#DDE2DD]/60 flex items-center justify-between text-[11px] text-[#66706B] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  Deterministic Rolling Momentum
                </span>
                <span className="text-[#8A938E]">Click nodes to inspect provenance</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
