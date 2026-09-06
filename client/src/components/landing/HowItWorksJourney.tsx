import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, BookOpen, Telescope, Sparkles, AlertCircle, Compass, ChevronRight, CheckCircle2, Mic } from 'lucide-react';

export const HowItWorksJourney: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<number>(0);

  const stages = [
    {
      id: 0,
      step: '01',
      name: 'Talk',
      tagline: 'Ambient, Low-Friction Interaction',
      icon: MessageSquare,
      color: '#10B981',
      summary: 'Reflection meets you where you live. Share a quick voice note or text on WhatsApp while commuting, or sit down in the distraction-free evening web space.',
      badge: 'Vision & Live Web',
    },
    {
      id: 1,
      step: '02',
      name: 'Reflect',
      tagline: 'Natural Language Over Rigid Ratings',
      icon: BookOpen,
      color: '#38BDF8',
      summary: 'Life cannot be captured on a 1–5 slider. Express yourself in unedited human voice while Gemini 2.5 Flash extracts domains, cadence, and valence.',
      badge: 'Live Prototype',
    },
    {
      id: 2,
      step: '03',
      name: 'Observe',
      tagline: 'The Multi-Domain Life Horizon',
      icon: Telescope,
      color: '#F59E0B',
      summary: 'Rolling trajectories aligned along a continuous 90-day axis. No gamified streaks or scalar scores—just deterministic longitudinal momentum.',
      badge: 'Live Prototype',
    },
    {
      id: 3,
      step: '04',
      name: 'Discover',
      tagline: 'Invisible Progress & Turning Points',
      icon: Sparkles,
      color: '#10B981',
      summary: 'Surfacing the compounding changes that day-to-day recency bias conceals. Catches quiet breakthroughs before you abandon them.',
      badge: 'Live Prototype',
    },
    {
      id: 4,
      step: '05',
      name: 'Reality Check',
      tagline: 'Gently Detecting Goal Drift',
      icon: AlertCircle,
      color: '#EF4444',
      summary: 'Highlighting the subtle tension between what you say matters and what your calendar and reflection patterns actually demonstrate.',
      badge: 'Live Prototype',
    },
    {
      id: 5,
      step: '06',
      name: 'Learn & Forward',
      tagline: 'Grounded Upcoming Possibilities',
      icon: Compass,
      color: '#C084FC',
      summary: 'Synthesizes active momentum and unaddressed tensions into forward hypotheses, helping you navigate upcoming decisions with clarity.',
      badge: 'Live Prototype',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-b border-[#DDE2DD]/80 bg-[#FAF9F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2ED] text-[#355C4A] text-xs font-mono font-semibold border border-[#355C4A]/20">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Act III · The 6-Stage Planned Journey</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl text-[#1D2421] tracking-tight leading-[1.12]">
            From momentary speech <br />
            <span className="italic text-[#355C4A] relative inline-block">
              to lifelong perspective.
              <span className="absolute left-0 right-0 -bottom-1 h-[2.5px] bg-[#34D399] rounded-full opacity-70" />
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#4F5A55] leading-relaxed">
            Click through the 6 stages to watch how daily moments transform into enduring multi-domain clarity.
          </p>
        </div>

        {/* Stepper Flow Header Ribbon */}
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-[#DDE2DD] -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 relative z-10">
            {stages.map((stage, idx) => {
              const isCurrent = currentStage === idx;
              const isPast = currentStage > idx;
              const Icon = stage.icon;
              return (
                <button
                  key={stage.name}
                  onClick={() => setCurrentStage(idx)}
                  className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-[#FFFFFF] border-[#355C4A] shadow-md scale-105'
                      : isPast
                      ? 'bg-[#FFFFFF] border-[#DDE2DD] text-[#355C4A]'
                      : 'bg-[#F1F2EE] border-transparent text-[#8A938E] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition font-mono text-xs font-bold ${
                    isCurrent
                      ? 'bg-[#355C4A] text-white shadow-xs'
                      : isPast
                      ? 'bg-[#EBF2ED] text-[#355C4A]'
                      : 'bg-[#E6EAE5] text-[#66706B]'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className="font-heading font-bold text-xs text-[#1D2421]">
                    {stage.step}. {stage.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#8A938E] mt-0.5">
                    {stage.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Morphing Stage Card with LIVING VISUAL SIMULATOR */}
        <div className="relative rounded-3xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-elevated p-6 sm:p-10 aperture-glow overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Stage Explanation */}
              <div className="lg:col-span-6 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-[#FAF3E8] text-[#C58A45] border border-[#C58A45]/30">
                    STAGE {stages[currentStage].step} OF 06
                  </span>
                  <span className="badge badge-prototype text-[11px] font-mono font-semibold">
                    {stages[currentStage].badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#1D2421]">
                    {stages[currentStage].name}: <span className="italic text-[#355C4A]">{stages[currentStage].tagline}</span>
                  </h3>
                  <p className="text-base text-[#4F5A55] leading-relaxed">
                    {stages[currentStage].summary}
                  </p>
                </div>

                {/* Stage Navigator Controls */}
                <div className="flex items-center gap-3 pt-3">
                  {currentStage > 0 && (
                    <button
                      onClick={() => setCurrentStage(currentStage - 1)}
                      className="btn-secondary text-xs py-2 px-3.5"
                    >
                      ← Previous Stage
                    </button>
                  )}
                  {currentStage < stages.length - 1 ? (
                    <button
                      onClick={() => setCurrentStage(currentStage + 1)}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-xs"
                    >
                      <span>Next: Stage 0{currentStage + 2} ({stages[currentStage + 1].name})</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStage(0)}
                      className="btn-secondary text-xs py-2 px-4"
                    >
                      <span>Cycle Back to Stage 01</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: LIVING ANIMATED SIMULATOR (Replaces Static Text) */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-[#0D1210] p-5 sm:p-6 border border-white/10 shadow-xl text-white relative overflow-hidden">
                  
                  {/* Stage 0 (Talk): Animated Phone Audio Waveform */}
                  {currentStage === 0 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-mono text-[#34D399] border-b border-white/10 pb-2">
                        <span>🎙️ Ambient Audio Capture</span>
                        <span>0:18 Recorded</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Mic size={20} className="animate-pulse" />
                        </div>
                        <div className="flex-1 flex items-center gap-1 h-8">
                          {[30, 60, 90, 45, 80, 100, 75, 40, 85, 50, 95, 60, 35, 75, 90, 45, 70, 85].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-[#34D399] rounded-full"
                              style={{ 
                                height: `${h}%`,
                                opacity: 0.4 + (h / 100) * 0.6 
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-white/70 italic font-editorial">
                        "Speak naturally while walking home. No forms, no rigid mood numbers."
                      </p>
                    </div>
                  )}

                  {/* Stage 1 (Reflect): Real-time Semantic Entity Highlighting */}
                  {currentStage === 1 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-mono text-[#38BDF8] border-b border-white/10 pb-2">
                        <span>✦ Gemini Domain Segmentation</span>
                        <span>Structured Output</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono space-y-2">
                        <p className="text-white/80">
                          "Exhausting day <span className="text-[#38BDF8] bg-[#38BDF8]/20 px-1 py-0.5 rounded font-bold">[Career: Load High]</span>, but held my writing boundary at 6:30 AM <span className="text-[#34D399] bg-[#34D399]/20 px-1 py-0.5 rounded font-bold">[Learning: Cadence Intact]</span>."
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8]">
                        <CheckCircle2 size={13} />
                        <span>Preserves authentic voice without distortion</span>
                      </div>
                    </div>
                  )}

                  {/* Stage 2 (Observe): Animated 90-Day Trajectory Graph */}
                  {currentStage === 2 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-mono text-[#F59E0B] border-b border-white/10 pb-2">
                        <span>✦ Continuous Multi-Domain Alignment</span>
                        <span>90-Day Lens</span>
                      </div>
                      <svg viewBox="0 0 320 100" className="w-full h-24 overflow-visible">
                        <path d="M 0 80 Q 90 75, 180 50 T 320 20" fill="none" stroke="#34D399" strokeWidth="2.8" className="observatory-glow-emerald" />
                        <path d="M 0 70 Q 100 65, 200 70 T 320 35" fill="none" stroke="#38BDF8" strokeWidth="2.2" />
                        <path d="M 0 90 Q 110 85, 210 65 T 320 45" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeDasharray="3 2" />
                        <circle cx="180" cy="50" r="5" fill="#34D399" stroke="#FFFFFF" strokeWidth="1.5" className="animate-ping" />
                      </svg>
                      <div className="flex justify-between text-[10px] font-mono text-white/50 pt-1 border-t border-white/10">
                        <span className="text-[#34D399]">Learning: Upward</span>
                        <span className="text-[#38BDF8]">Career: Steady</span>
                        <span className="text-[#F59E0B]">Energy: Calibrated</span>
                      </div>
                    </div>
                  )}

                  {/* Stage 3 (Discover): Flashing Discovery Alert Beacon */}
                  {currentStage === 3 && (
                    <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 space-y-2.5 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#34D399] font-bold flex items-center gap-1.5">
                          <Sparkles size={14} />
                          <span>Invisible Progress Verified</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#10B981]/30 text-[#34D399] font-bold">
                          +38% Delta
                        </span>
                      </div>
                      <p className="text-xs text-white/90 leading-relaxed font-editorial">
                        "Your resilience against schedule chaos increased 38% over 60 days. Your habit did not break."
                      </p>
                    </div>
                  )}

                  {/* Stage 4 (Reality Check): Animated Drift Needle Meter */}
                  {currentStage === 4 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-mono text-[#EF4444] border-b border-white/10 pb-2">
                        <span>⚠️ Goal Drift Divergence Radar</span>
                        <span className="font-bold">42° Angle</span>
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-white/60">Stated Priority:</span>
                          <span className="text-[#34D399] font-bold">Health &amp; Recovery (#1)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Actual Calendar Allocation:</span>
                          <span className="text-[#EF4444] font-bold">Only 4% time (82% meetings)</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#EF4444] w-[82%]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage 5 (Learn & Forward): Forward Scenario Horizon */}
                  {currentStage === 5 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-mono text-[#C084FC] border-b border-white/10 pb-2">
                        <span>✦ Forward Scenario Navigation</span>
                        <span>3-Week Horizon</span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs flex items-center justify-between text-white">
                          <span>Scenario A: Maintain 6:30 AM block</span>
                          <span className="text-[#34D399] font-bold">High Stability</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs flex items-center justify-between text-white/70">
                          <span>Scenario B: Add evening recovery walk</span>
                          <span className="text-[#C084FC] font-bold">+18% Energy</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer provenance label */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
                    <span>Non-clinical boundary preserved</span>
                    <span className="text-[#34D399]">100% Deterministic Provenance</span>
                  </div>

                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
