import React, { useState } from 'react';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, BookOpen, Lock, AlertCircle, Telescope } from 'lucide-react';
import brandLogo from '../assets/logo.png';

interface LandingViewProps {
  onSignIn: () => void;
  onSignInRedirect?: () => void;
  onExploreDemo: () => void;
  authError?: string | null;
}

export const LandingView: React.FC<LandingViewProps> = ({ onSignIn, onSignInRedirect, onExploreDemo, authError }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col justify-between animate-fade-in">
      {/* Top Brand Bar */}
      <header className="border-b border-[#DDE2DD]/80 px-6 sm:px-12 py-5 flex items-center justify-between bg-[#F7F6F2]/90 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl shadow-xs bg-[#FFFFFF] p-1 border border-[#DDE2DD] flex items-center justify-center overflow-hidden">
            {!logoError ? (
              <img 
                src={brandLogo} 
                alt="Life Observatory Logo" 
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Telescope size={18} className="text-[#355C4A]" />
            )}
          </div>
          <div>
            <span className="font-heading font-bold text-base text-[#1D2421] block leading-none">
              Life Observatory
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8A938E] block mt-1">
              Observing Since 2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="btn-primary text-xs py-2 px-4 shadow-xs flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign In with Google</span>
          </button>
          <button
            onClick={onExploreDemo}
            className="text-xs font-semibold text-[#66706B] hover:text-[#1D2421] px-3.5 py-2 transition"
          >
            Explore Demo
          </button>
        </div>
      </header>

      {/* Main Wide-Screen Hero */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-20 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
          {/* Left Column: Narrative Invitation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF2ED] text-[#355C4A] text-xs font-heading font-semibold border border-[#355C4A]/20 shadow-2xs">
              <Sparkles size={13} className="text-[#355C4A]" />
              <span>Personal Life Observatory · Longitudinal Intelligence</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-editorial text-4xl sm:text-6xl text-[#1D2421] tracking-tight leading-[1.08]">
                Your life changes gradually. <br />
                <span className="font-editorial italic text-[#355C4A]">Life Observatory helps you see it.</span>
              </h1>

              <p className="font-body text-base sm:text-lg text-[#4F5A55] leading-relaxed max-w-xl">
                Most meaningful transformation happens too slowly to notice day-to-day. Progress feels invisible because each morning looks like the last. Life Observatory turns daily reflections and connected life signals into a grounded, longitudinal mirror — making subtle progress, patterns, and turning points visible over time.
              </p>
            </div>

            {/* OBSERVE → CONNECT → UNDERSTAND Progression */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-2xs">
              <div className="text-center p-2">
                <div className="w-6 h-6 mx-auto mb-1.5 rounded-lg bg-[#FAF3E8] text-[#C58A45] flex items-center justify-center font-bold text-xs">1</div>
                <span className="font-heading font-semibold text-xs text-[#1D2421] block tracking-wide">OBSERVE</span>
                <span className="text-[10.5px] text-[#8A938E] leading-tight block mt-0.5">Capture daily reflections</span>
              </div>
              <div className="text-center p-2 border-x border-[#DDE2DD]">
                <div className="w-6 h-6 mx-auto mb-1.5 rounded-lg bg-[#EFF3EE] text-[#355C4A] flex items-center justify-center font-bold text-xs">2</div>
                <span className="font-heading font-semibold text-xs text-[#1D2421] block tracking-wide">CONNECT</span>
                <span className="text-[10.5px] text-[#8A938E] leading-tight block mt-0.5">Calendar, Gmail &amp; Drive</span>
              </div>
              <div className="text-center p-2">
                <div className="w-6 h-6 mx-auto mb-1.5 rounded-lg bg-[#EDF3F8] text-[#3A5A78] flex items-center justify-center font-bold text-xs">3</div>
                <span className="font-heading font-semibold text-xs text-[#1D2421] block tracking-wide">UNDERSTAND</span>
                <span className="text-[10.5px] text-[#8A938E] leading-tight block mt-0.5">AI uncovers your arc</span>
              </div>
            </div>

            {authError && (
              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex flex-col gap-2.5 shadow-2xs">
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

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onSignIn}
                className="btn-primary text-sm py-3.5 px-6 shadow-sm justify-center gap-2.5 font-heading font-semibold"
                title="Sign in with Google popup"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign In with Google</span>
              </button>

              {onSignInRedirect && (
                <button
                  onClick={onSignInRedirect}
                  className="btn-secondary text-xs py-3.5 px-4 justify-center gap-1.5 text-[#355C4A] border-[#355C4A]/30 hover:bg-[#EBF2ED] font-medium"
                  title="Direct full-page redirect to Google accounts"
                >
                  <span>Sign In via Redirect</span>
                  <ArrowRight size={13} />
                </button>
              )}

              <button
                onClick={onExploreDemo}
                className="text-xs font-semibold text-[#8A938E] hover:text-[#1D2421] px-3.5 py-2 transition"
              >
                <span>Demo Preview</span>
              </button>
            </div>

            {/* Trust Pill */}
            <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#8A938E] font-body">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E8064]" />
                Zero rigid questionnaires
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E8064]" />
                No productivity scores
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-[#355C4A]" />
                Private &amp; encrypted
              </span>
            </div>
          </div>

          {/* Right Column: Authentic Live Observatory Preview */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-elevated p-6 sm:p-7 overflow-hidden">
              {/* Window Masthead */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DDE2DD]/70">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D96B43]" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#1D2421]">
                    The Life Horizon — Jun–Sep 2026
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8A938E] bg-[#F7F6F2] px-2.5 py-0.5 rounded-full border border-[#DDE2DD]">
                  Active Observatory
                </span>
              </div>

              {/* Dynamic SVG Horizon Silhouette */}
              <div className="rounded-2xl bg-[#F7F6F2] p-4 border border-[#E6EAE5] mb-5">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-editorial text-sm font-medium text-[#1D2421]">
                    A season shaped by learning &amp; recovery
                  </span>
                  <span className="text-[11px] font-mono text-[#355C4A] font-medium">5 of 6 domains upward</span>
                </div>
                <svg viewBox="0 0 400 110" className="w-full h-24 overflow-visible">
                  <defs>
                    <linearGradient id="landingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#355C4A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#355C4A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Subtle Grid Lines */}
                  <line x1="0" y1="90" x2="400" y2="90" stroke="#DDE2DD" strokeDasharray="3 3" />
                  <line x1="0" y1="45" x2="400" y2="45" stroke="#DDE2DD" strokeDasharray="3 3" />
                  {/* Health Curve */}
                  <path d="M 0 85 Q 100 80, 200 70 T 400 20" fill="none" stroke="#D96B43" strokeWidth="2.5" />
                  {/* Learning Area & Line */}
                  <path d="M 0 90 Q 100 85, 200 60 T 400 35 L 400 110 L 0 110 Z" fill="url(#landingGrad)" />
                  <path d="M 0 90 Q 100 85, 200 60 T 400 35" fill="none" stroke="#355C4A" strokeWidth="3" />
                  {/* Career Curve */}
                  <path d="M 0 70 Q 120 60, 200 75 T 400 30" fill="none" stroke="#3A5A78" strokeWidth="2" />
                  {/* Milestone Pin */}
                  <circle cx="340" cy="40" r="4" fill="#355C4A" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
                <div className="flex justify-between text-[10px] font-mono uppercase text-[#8A938E] mt-1 pt-1 border-t border-[#DDE2DD]/50">
                  <span>Jun</span>
                  <span>Jul (Dip)</span>
                  <span>Aug (Rebound)</span>
                  <span className="text-[#355C4A] font-semibold">Sep (Now)</span>
                </div>
              </div>

              {/* Sample Observation & Evidence Card */}
              <div className="p-4 rounded-2xl bg-[#EDF7F2] border border-[#3E8064]/25 space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3E8064]" />
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#355C4A]">
                      You May Not Have Noticed This
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#66706B]">6-Week Shift</span>
                </div>
                <h4 className="font-heading font-bold text-sm text-[#1D2421]">
                  Gradual progress visible in career
                </h4>
                <p className="text-xs text-[#4F5A55] leading-relaxed">
                  "Activity shifted from intermittent intent into 35 consecutive days of steady, completed architectural practice."
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <span className="text-[#8A938E]">Then: Inconsistent starts</span>
                  <span className="text-[#355C4A]">→</span>
                  <span className="font-semibold text-[#1D2421]">Now: Consistent completed output</span>
                </div>
              </div>

              {/* Companion Annotation */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF9F5] border border-[#DDE2DD] text-xs text-[#66706B]">
                <div className="w-6 h-6 rounded-lg bg-[#355C4A] text-white flex items-center justify-center shrink-0">
                  <Sparkles size={13} />
                </div>
                <p className="leading-tight">
                  <span className="font-semibold text-[#1D2421]">Thinking Partner:</span> "Notice how energy dipped during the July crunch, then stabilized when you anchored your 6:30 AM routine."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Experiential Story */}
        <div className="border-t border-[#DDE2DD] pt-14">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#355C4A] block mb-1">
              How The Observatory Works
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl text-[#1D2421]">
              A mirror for the longitudinal self.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-xs flex items-center justify-center text-[#355C4A] font-bold">
                <BookOpen size={18} />
              </div>
              <h4 className="font-heading font-bold text-base text-[#1D2421]">
                1. Speak Your Day Freely
              </h4>
              <p className="font-body text-xs sm:text-sm text-[#66706B] leading-relaxed">
                No tedious multi-question surveys. Answer "How was today?" like leaving a voice note for a close confidant. Gemini extracts domain momentum quietly in the background.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-xs flex items-center justify-center text-[#C58A45] font-bold">
                <TrendingUp size={18} />
              </div>
              <h4 className="font-heading font-bold text-base text-[#1D2421]">
                2. Discover Longitudinal Shifts
              </h4>
              <p className="font-body text-xs sm:text-sm text-[#66706B] leading-relaxed">
                Notice the changes you were too close to perceive: subtle habits compounding over weeks, drift in neglected areas, and inflection points that marked true breakthroughs.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-xs flex items-center justify-center text-[#3E8064] font-bold">
                <ShieldCheck size={18} />
              </div>
              <h4 className="font-heading font-bold text-base text-[#1D2421]">
                3. Calibrate Your Intuition
              </h4>
              <p className="font-body text-xs sm:text-sm text-[#66706B] leading-relaxed">
                Record your decision expectations and test them against how reality actually unfolds. Build deep, evidence-based intuition for how your mind and energy work.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDE2DD] py-6 px-6 sm:px-12 text-center text-xs text-[#8A938E] bg-[#F7F6F2]">
        <p>Life Observatory • Longitudinal self-reflection model powered by Gemini on Cloud Run.</p>
        <p className="mt-1 text-[11px] text-[#8A938E]/80">Designed for personal clarity. Your reflections stay entirely yours.</p>
      </footer>
    </div>
  );
};
