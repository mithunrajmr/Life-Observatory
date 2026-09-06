import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export const ProblemNarrative: React.FC = () => {
  const [currentDay, setCurrentDay] = useState<number>(32);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const hasAutoPlayedRef = React.useRef<boolean>(false);

  // Scroll-triggered auto-play: runs simulation once when scrolled into view
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoPlayedRef.current) {
          hasAutoPlayedRef.current = true;
          setCurrentDay(1);
          setIsPlaying(true);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentDay((prev) => {
        if (prev >= 90) {
          setIsPlaying(false);
          return 90;
        }
        return prev + 1;
      });
    }, 65);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Dynamic calculations for the compounding curve vs erratic emotional curve
  const progressPercent = currentDay / 90;
  const cursorX = 30 + progressPercent * 540;

  // Emotional erratic curve height at currentDay
  const getEmotionalY = (day: number) => {
    const base = 120;
    const wave = Math.sin(day * 0.4) * 25 + Math.cos(day * 0.25) * 20;
    const dip = day >= 25 && day <= 42 ? 32 : 0;
    return base + wave + dip;
  };

  // Compounding trajectory height at currentDay
  const getCompoundingY = (day: number) => {
    const t = day / 90;
    const rise = Math.pow(t, 2.2) * 125;
    return 165 - rise;
  };

  const currentEmotionalY = getEmotionalY(currentDay);
  const currentCompoundingY = getCompoundingY(currentDay);

  // Dynamic phase insights
  let phaseTitle = 'Day 1–20 · The Illusion of Stagnation';
  let phaseDescription = '1% daily micro-deltas are completely invisible tonight. You feel identical to who you were yesterday, tempting you to stop.';
  let phaseTag = 'Imperceptible Compounding';
  let phaseColor = '#F59E0B';
  let phaseBadgeBg = 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/30';

  if (currentDay > 25 && currentDay <= 45) {
    phaseTitle = 'Day 26–45 · The Valley of Surrender (Recency Bias)';
    phaseDescription = 'An exhausting Thursday or difficult week colors your entire self-evaluation. Human memory screams "nothing is working" right before compounding begins.';
    phaseTag = 'DANGER: 80% of Habits Abandoned Here';
    phaseColor = '#EF4444';
    phaseBadgeBg = 'bg-[#FEE2E2] text-[#B91C1C] border-[#EF4444]/40';
  } else if (currentDay > 45 && currentDay <= 70) {
    phaseTitle = 'Day 46–70 · Invisible Decoupling';
    phaseDescription = 'Habits quietly stabilize beneath awareness. Your resilience increases by 38% under high workload, even though daily fatigue is still felt.';
    phaseTag = 'Invisible Progress Active';
    phaseColor = '#10B981';
    phaseBadgeBg = 'bg-[#D1FAE5] text-[#065F46] border-[#10B981]/30';
  } else if (currentDay > 70) {
    phaseTitle = 'Day 71–90 · The Trajectory Inflection';
    phaseDescription = 'Compounding breaks into undeniable reality. What felt like sporadic effort is now an anchored permanent foundation in your life.';
    phaseTag = 'Milestone Turning Point';
    phaseColor = '#059669';
    phaseBadgeBg = 'bg-[#A7F3D0] text-[#064E3B] border-[#059669]/40';
  }

  return (
    <section 
      ref={sectionRef}
      id="story" 
      className="py-20 sm:py-28 border-b border-[#DDE2DD]/80 bg-[#FAF9F5] relative overflow-hidden"
    >
      {/* Guiding laser line connecting from above */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-12 bg-gradient-to-b from-[#34D399] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Section Header with Eye-Catching Eye-Guidance Beacon */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3E8] border border-[#C58A45]/30 text-[#C58A45] text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
              <span>Act I · The Human Dilemma</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-5xl text-[#1D2421] tracking-tight leading-[1.12]">
              Why you give up right before <br />
              <span className="italic text-[#355C4A] relative inline-block">
                compounding takes hold.
                <span className="absolute left-0 right-0 -bottom-1 h-[2.5px] bg-[#34D399] rounded-full opacity-70" />
              </span>
            </h2>
            <p className="text-base sm:text-lg text-[#4F5A55] leading-relaxed">
              Drag the timeline scrubber below or press Play to watch the fatal disconnect between how you feel day-to-day versus how your life actually evolves.
            </p>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-sm self-start lg:self-end">
            <button
              onClick={() => {
                if (currentDay >= 90) setCurrentDay(1);
                setIsPlaying(!isPlaying);
              }}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-bold shadow-xs hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Simulate 90 Days'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentDay(1);
              }}
              className="p-2.5 rounded-xl text-[#66706B] hover:text-[#1D2421] hover:bg-[#EBECE7] transition"
              title="Reset scrubber to Day 1"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* The Compounding vs. Recency Bias Visual Instrument */}
        <div className="rounded-3xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-elevated p-6 sm:p-10 space-y-8 aperture-glow">
          
          {/* Top Telemetry & Scrubber */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E6EAE5]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[#1D2421] px-3.5 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#DDE2DD] shadow-2xs">
                  DAY {currentDay} OF 90
                </span>
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${phaseBadgeBg} flex items-center gap-1.5`}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: phaseColor }} />
                  {phaseTag}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#8A938E] hidden sm:inline">
                Drag scrubber or hit simulate to watch emotional noise vs reality
              </span>
            </div>

            {/* Slider input */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="1"
                max="90"
                value={currentDay}
                aria-label="Timeline day scrubber"
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentDay(Number(e.target.value));
                }}
                className="w-full h-2.5 bg-[#E6EAE5] rounded-lg appearance-none cursor-pointer accent-[#355C4A]"
              />
              <div className="flex justify-between text-[10.5px] font-mono uppercase text-[#8A938E] pt-1">
                <span className="hover:text-[#1D2421] cursor-pointer" onClick={() => setCurrentDay(1)}>Day 01 (Anchor)</span>
                <span className="text-[#EF4444] font-bold cursor-pointer" onClick={() => setCurrentDay(32)}>⚠️ Day 32 (Valley of Surrender)</span>
                <span className="hover:text-[#1D2421] cursor-pointer" onClick={() => setCurrentDay(60)}>Day 60 (Decoupling)</span>
                <span className="text-[#10B981] font-bold cursor-pointer" onClick={() => setCurrentDay(90)}>✦ Day 90 (Inflection)</span>
              </div>
            </div>
          </div>

          {/* Interactive Dual-Chart SVG Canvas with High Contrast */}
          <div className="rounded-2xl bg-[#0D1210] p-4 sm:p-6 border border-white/10 relative overflow-hidden text-white">
            <svg
              viewBox="0 0 600 220"
              className="w-full h-60 sm:h-72 overflow-visible"
              role="img"
              aria-label="Interactive timeline showing emotional volatility vs actual compounding"
            >
              <defs>
                <linearGradient id="compoundingNeonFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid guides */}
              <line x1="30" y1="180" x2="570" y2="180" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="30" y1="110" x2="570" y2="110" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="30" y1="40" x2="570" y2="40" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

              {/* Valley of Surrender Danger Zone (Day 25 to 45 => x=180 to 300) */}
              <rect
                x="180"
                y="30"
                width="120"
                height="160"
                fill="rgba(239, 68, 68, 0.12)"
                stroke="rgba(239, 68, 68, 0.3)"
                strokeDasharray="4 2"
                rx="8"
              />
              <text x="240" y="22" textAnchor="middle" fill="#F87171" className="text-[10px] font-mono font-bold tracking-wider">
                ⚠️ VALLEY OF SURRENDER (DAY 32)
              </text>

              {/* 1. Compounding Path (Glowing Emerald) */}
              <path
                d="M 30 165 Q 220 160, 360 115 T 570 38 L 570 195 L 30 195 Z"
                fill="url(#compoundingNeonFill)"
              />
              <path
                d="M 30 165 Q 220 160, 360 115 T 570 38"
                fill="none"
                stroke="#34D399"
                strokeWidth="3.5"
                className="observatory-glow-emerald"
              />

              {/* 2. Emotional Volatility Path (Vibrant Terracotta Wave) */}
              <path
                d="M 30 120 Q 80 80, 130 145 T 230 165 T 320 90 T 420 150 T 510 85 T 570 135"
                fill="none"
                stroke="#FB923C"
                strokeWidth="2.2"
                strokeDasharray="4 3"
                opacity="0.9"
              />

              {/* Dynamic Timeline Cursor Laser Line */}
              <line
                x1={cursorX}
                y1="25"
                x2={cursorX}
                y2="195"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeDasharray="3 3"
              />

              {/* Compounding Node (Green) */}
              <circle
                cx={cursorX}
                cy={currentCompoundingY}
                r="7"
                fill="#34D399"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="transition-all"
              />

              {/* Emotional Node (Orange) */}
              <circle
                cx={cursorX}
                cy={currentEmotionalY}
                r="6"
                fill="#FB923C"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all"
              />
            </svg>

            {/* High-Contrast Dynamic Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-5">
                <span className="flex items-center gap-2 text-[#34D399] font-bold">
                  <span className="w-3 h-3 rounded-full bg-[#34D399] shadow-sm" />
                  What Is Actually Compounding (The Observatory Mirror)
                </span>
                <span className="flex items-center gap-2 text-[#FB923C] font-semibold">
                  <span className="w-3 h-0.5 bg-[#FB923C] border-dashed" />
                  How You Feel Day-to-Day (Erratic Emotional Fog)
                </span>
              </div>
              <span className="text-white/40">
                Cleveland &amp; McGill Aligned Coordinate
              </span>
            </div>
          </div>

          {/* Dynamic Animated Insight Callout According to Cursor */}
          <motion.div
            key={phaseTitle}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#DDE2DD] space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-heading font-bold text-base text-[#1D2421]">
                {phaseTitle}
              </h3>
              <span className="text-xs font-mono font-bold" style={{ color: phaseColor }}>
                ● {phaseTag}
              </span>
            </div>
            <p className="text-sm text-[#4F5A55] leading-relaxed">
              {phaseDescription}
            </p>
          </motion.div>

          {/* Visual 3-Way Tool Paradigm Comparison (Replaces Static Paragraphs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#DDE2DD] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#A95C58]">
                <XCircle size={15} />
                <span>Daily Diary / Journal</span>
              </div>
              <p className="text-xs text-[#66706B] leading-relaxed">
                Captures how you felt on a single hard evening, reinforcing recency bias without longitudinal calibration.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#DDE2DD] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#B98235]">
                <AlertTriangle size={15} />
                <span>Binary Habit Tracker</span>
              </div>
              <p className="text-xs text-[#66706B] leading-relaxed">
                Breaks on day 31, inducing streak guilt and abandonment even when underlying stamina grew 38%.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EDF7F2] border border-[#3E8064]/40 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#355C4A]">
                <CheckCircle2 size={15} />
                <span>The Life Observatory</span>
              </div>
              <p className="text-xs text-[#355C4A] leading-relaxed font-medium">
                Reveals the silent 90-day trajectory beneath the noise so you persevere through the Valley of Surrender.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
