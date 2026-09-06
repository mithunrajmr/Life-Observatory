import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Play, Pause, RotateCcw, CheckCircle2, Cpu, LineChart, Compass, Activity, Radio } from 'lucide-react';

export const TheShiftSequence: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const steps = [
    {
      id: 0,
      phase: 'Reflection',
      badge: 'Unstructured Human Voice',
      icon: Radio,
      color: '#34D399',
      title: '1. Raw Daily Speech or Voice Note',
      subtitle: 'Zero forms. No 1–10 sliders. Just natural human expression.',
    },
    {
      id: 1,
      phase: 'Signal',
      badge: 'Constrained JSON Extraction',
      icon: Cpu,
      color: '#38BDF8',
      title: '2. Gemini Parses Domains & Context',
      subtitle: 'Extracts events, emotional valence, and calendar meeting load.',
    },
    {
      id: 2,
      phase: 'Pattern',
      badge: 'Longitudinal Substrate',
      icon: LineChart,
      color: '#FBBF24',
      title: '3. Rolling Momentum (60-Day Memory)',
      subtitle: 'Calculates rolling direction with temporal decay.',
    },
    {
      id: 3,
      phase: 'Insight',
      badge: 'Proactive Discovery',
      icon: Sparkles,
      color: '#10B981',
      title: '4. Invisible Progress Surfaced',
      subtitle: 'The Observatory catches compounding breakthroughs.',
    },
    {
      id: 4,
      phase: 'Direction',
      badge: 'Grounded Forward Horizon',
      icon: Compass,
      color: '#C084FC',
      title: '5. Upcoming Possibilities & Scenarios',
      subtitle: 'Open collaborative hypotheses to calibrate your next 3 weeks.',
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isAutoPlaying, steps.length]);

  return (
    <section id="shift" className="py-20 sm:py-28 border-b border-white/10 bg-[#0C100E] text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 observatory-grid-dark" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-10 right-1/4 w-[550px] h-[350px] bg-gradient-to-bl from-[#34D399]/15 via-[#38BDF8]/10 to-transparent blur-3xl pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399] text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping" />
              <span>Act II · The Transformation Engine</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-5xl text-white tracking-tight leading-[1.12]">
              From ephemeral thought <br />
              <span className="italic text-[#34D399] relative inline-block">
                to longitudinal direction.
                <span className="absolute left-0 right-0 -bottom-1 h-[2.5px] bg-[#34D399] rounded-full opacity-70" />
              </span>
            </h2>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed">
              Watch how raw human speech is parsed, mathematically synthesized across 90 days, and turned into clear perspective.
            </p>
          </div>

          {/* Autoplay Controls */}
          <div className="flex items-center gap-2.5 p-1 rounded-2xl bg-white/5 border border-white/10 self-start md:self-end">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-semibold flex items-center gap-2 transition"
              title={isAutoPlaying ? 'Pause walkthrough' : 'Auto-play transformation pipeline'}
            >
              {isAutoPlaying ? <Pause size={13} /> : <Play size={13} className="fill-current" />}
              <span>{isAutoPlaying ? 'Pause Pipeline' : 'Auto-Play Pipeline'}</span>
            </button>
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                setActiveStep(0);
              }}
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition"
              title="Reset to step 1"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* 5-Step Animated Pipeline Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-1.5 rounded-2xl bg-white/5 border border-white/10 shadow-2xl relative">
          {steps.map((step, idx) => {
            const isCurrent = activeStep === idx;
            const isPassed = activeStep > idx;
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveStep(idx);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl transition text-left relative overflow-hidden ${
                  isCurrent
                    ? 'bg-white/15 border border-white/30 text-white shadow-md'
                    : isPassed
                    ? 'text-[#34D399] hover:bg-white/10'
                    : 'text-white/50 hover:bg-white/5'
                }`}
              >
                {/* Active Indicator Glow */}
                {isCurrent && (
                  <div 
                    className="absolute top-0 left-0 bottom-0 w-1.5 shadow-sm"
                    style={{ backgroundColor: step.color }}
                  />
                )}

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition ${
                    isCurrent
                      ? 'shadow-sm text-[#0C100E]'
                      : isPassed
                      ? 'bg-white/10 text-[#34D399]'
                      : 'bg-white/5 text-white/40'
                  }`}
                  style={{ backgroundColor: isCurrent ? step.color : undefined }}
                >
                  {isPassed ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="font-heading font-bold text-xs block truncate text-white">
                    {step.phase}
                  </span>
                  <span className="text-[10px] font-mono text-white/50 block truncate">
                    Phase 0{idx + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Pipeline Console */}
        <div className="rounded-3xl bg-[#121815] border border-white/10 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          {/* Subtle glowing radial background */}
          <div 
            className="absolute top-0 right-0 w-96 h-96 blur-3xl pointer-events-none opacity-20 -z-10"
            style={{ backgroundColor: steps[activeStep].color }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Narrative Explainer */}
              <div className="lg:col-span-5 space-y-4">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border"
                  style={{ 
                    backgroundColor: `${steps[activeStep].color}15`, 
                    color: steps[activeStep].color,
                    borderColor: `${steps[activeStep].color}35`
                  }}
                >
                  <Activity size={12} className="animate-pulse" />
                  <span>Pipeline Phase 0{activeStep + 1} · {steps[activeStep].badge}</span>
                </div>

                <h3 className="font-editorial text-2xl sm:text-3xl text-white">
                  {steps[activeStep].title}
                </h3>

                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  {steps[activeStep].subtitle}
                </p>

                <div className="pt-3 flex items-center gap-3">
                  {activeStep < steps.length - 1 ? (
                    <button
                      onClick={() => {
                        setIsAutoPlaying(false);
                        setActiveStep(activeStep + 1);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-heading font-bold text-xs flex items-center gap-2 transition shadow-md"
                    >
                      <span>Advance to Phase 0{activeStep + 2}: {steps[activeStep + 1].phase}</span>
                      <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAutoPlaying(false);
                        setActiveStep(0);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-2 transition"
                    >
                      <span>Cycle Pipeline From Beginning</span>
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Living Animated Simulation Canvas */}
              <div className="lg:col-span-7">
                <div className="p-6 rounded-2xl bg-[#080C0A] border border-white/10 shadow-inner space-y-4">
                  
                  {/* Step 0: Audio Waveform Equalizer Animation */}
                  {activeStep === 0 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-md">
                          <Radio size={18} className="animate-pulse" />
                        </div>
                        {/* Bouncing animated audio equalizer bars */}
                        <div className="flex-1 flex items-center gap-1.5 h-7">
                          {[35, 65, 95, 45, 80, 100, 70, 50, 85, 40, 75, 90, 60, 30, 80, 50, 95, 40, 65, 85].map((h, i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-all duration-300 ${i % 2 === 0 ? 'eq-bar-1' : 'eq-bar-3'}`}
                              style={{ 
                                height: `${h}%`, 
                                backgroundColor: '#34D399',
                                opacity: 0.4 + (h / 100) * 0.6 
                              }}
                            />
                          ))}
                        </div>
                        <span className="font-mono text-xs text-[#34D399] font-bold">0:24 REC</span>
                      </div>

                      {/* Transcribed ambient voice bubble */}
                      <div className="p-4 rounded-xl bg-white/5 border-l-4 border-[#34D399] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#34D399] block font-semibold">
                          ✦ Live Transcribed Voice Reflection:
                        </span>
                        <p className="font-editorial italic text-base sm:text-lg text-white/95 leading-relaxed">
                          "Exhausting Thursday. 7 back-to-back reviews and felt wiped by 3 PM. But unlike last month, I didn’t skip my 6:30 AM writing hour before the rush began."
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Real-time Gemini JSON Token Extraction */}
                  {activeStep === 1 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-mono text-[#38BDF8] border-b border-white/10 pb-2 font-semibold">
                        <span>Gemini 2.5 Structured Entity Schema</span>
                        <span className="text-white/40">Zero Distortion</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="p-3.5 rounded-xl bg-white/5 border border-[#38BDF8]/40 space-y-1 shadow-sm">
                          <span className="text-[10px] font-mono text-[#38BDF8] font-bold block uppercase">Career Domain</span>
                          <span className="text-xs font-semibold text-white">7 Review Sessions</span>
                          <span className="text-[10px] font-mono text-white/50 block">Load: High</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/5 border border-[#34D399]/40 space-y-1 shadow-sm">
                          <span className="text-[10px] font-mono text-[#34D399] font-bold block uppercase">Learning Domain</span>
                          <span className="text-xs font-semibold text-white">6:30 AM Anchor</span>
                          <span className="text-[10px] font-mono text-[#34D399] block font-bold">Boundary: Held</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/5 border border-[#FBBF24]/40 space-y-1 shadow-sm">
                          <span className="text-[10px] font-mono text-[#FBBF24] font-bold block uppercase">Energy Domain</span>
                          <span className="text-xs font-semibold text-white">Afternoon Fatigue</span>
                          <span className="text-[10px] font-mono text-white/50 block">Overcome: Yes</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-xs text-[#38BDF8] font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
                        <span>Google Calendar Corroboration: 6.8 hrs of meetings verified in metadata.</span>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Multi-Month Rolling Trajectory Substrate */}
                  {activeStep === 2 && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-mono text-[#FBBF24] border-b border-white/10 pb-2 font-semibold">
                        <span>Multi-Month Trajectory Substrate</span>
                        <span className="text-white/40">Exponential Decay</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">60-Day Historic Baseline:</span>
                          <span className="font-mono text-[#F87171] font-bold">15% consistency on high-meeting days</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#F87171] w-[15%]" />
                        </div>

                        <div className="flex justify-between text-xs pt-1 border-t border-white/10">
                          <span className="text-white font-bold">Recent 4-Week Average:</span>
                          <span className="font-mono text-[#34D399] font-bold">100% consistency on high-meeting days</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#34D399] w-[100%]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#34D399]">
                        <CheckCircle2 size={14} />
                        <span>Sustained positive divergence confirmed across 28 calendar days</span>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Proactive Insight Discovery */}
                  {activeStep === 3 && (
                    <div className="p-5 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 space-y-3 animate-fade-in shadow-xl">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-[#10B981]/30 text-[#34D399] text-[10px] font-mono font-bold uppercase tracking-wider">
                          ✦ Surfaced Discovery
                        </span>
                        <span className="text-[10px] font-mono text-white/50">4 Verified Records</span>
                      </div>
                      <h4 className="font-heading font-bold text-lg text-white">
                        Resilience has decoupled from meeting workload
                      </h4>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                        "Your writing practice consistency increased by 38% compared to baseline. Even though fatigue was noted 4 times, your completed output remained unbroken."
                      </p>
                    </div>
                  )}

                  {/* Step 4: Forward Possibilities & Compass Heading */}
                  {activeStep === 4 && (
                    <div className="p-5 rounded-2xl bg-[#C084FC]/15 border border-[#C084FC]/40 space-y-3 animate-fade-in shadow-xl">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-[#C084FC]/30 text-[#C084FC] text-[10px] font-mono font-bold uppercase tracking-wider">
                          ✦ Forward Possibility
                        </span>
                        <span className="text-[10px] font-mono text-white/50">Non-Deterministic</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                        "If your morning boundary continues during next week's sprint, creative momentum will reach an all-time stability inflection point before the launch."
                      </p>
                      <div className="p-3 rounded-xl bg-black/40 border border-[#C084FC]/30 text-xs text-[#C084FC] italic">
                        Companion question: "Would you like to protect a 45-minute calendar focus block on Wednesday?"
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
