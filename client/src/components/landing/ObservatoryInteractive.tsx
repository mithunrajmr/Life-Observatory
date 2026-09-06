import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Telescope, Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';

interface ObservatoryInteractiveProps {
  onExploreDemo: () => void;
}

export const ObservatoryInteractive: React.FC<ObservatoryInteractiveProps> = ({ onExploreDemo }) => {
  const [selectedDomain, setSelectedDomain] = useState<string | 'all'>('all');
  const [activeTurningPoint, setActiveTurningPoint] = useState<number | null>(2);
  const [simulationProgress, setSimulationProgress] = useState<number>(90);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const hasAutoPlayedRef = React.useRef<boolean>(false);

  // Scroll-triggered auto-play: runs once when scrolled into view
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoPlayedRef.current) {
          hasAutoPlayedRef.current = true;
          setSimulationProgress(10);
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
      setSimulationProgress((prev) => {
        if (prev >= 90) {
          setIsPlaying(false);
          return 90;
        }
        return prev + 2;
      });
    }, 55);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const domains = [
    { id: 'learning', name: 'Learning', color: '#4ADE80', glowClass: 'observatory-glow-emerald', label: '+42% Resilience' },
    { id: 'career', name: 'Career', color: '#60A5FA', glowClass: 'observatory-glow-blue', label: 'Cadence Stabilized' },
    { id: 'health', name: 'Health', color: '#FB923C', glowClass: 'observatory-glow-amber', label: 'Rebounding Upward' },
    { id: 'relationships', name: 'Relationships', color: '#C084FC', glowClass: '', label: 'Weekly Sync Held' },
    { id: 'energy', name: 'Energy', color: '#FACC15', glowClass: 'observatory-glow-amber', label: 'Morning Peak Intact' },
    { id: 'personal', name: 'Personal', color: '#34D399', glowClass: 'observatory-glow-emerald', label: 'Creative Deepening' },
  ];

  const turningPoints = [
    {
      id: 1,
      day: 22,
      date: 'Jun 18',
      domain: 'Learning',
      color: '#4ADE80',
      title: 'Morning Routine Anchor',
      note: 'Shifted from erratic late sprints to steady 6:30 AM reading. Momentum stabilized across subsequent 40 days.',
      cx: 155,
      cy: 140,
    },
    {
      id: 2,
      day: 54,
      date: 'Jul 24',
      domain: 'Career',
      color: '#60A5FA',
      title: 'Resilience Decoupling Milestone',
      note: 'Technical output remained consistent despite 4 fatigue days and 38 hours of meetings. 38% higher resilience than baseline.',
      cx: 375,
      cy: 85,
    },
    {
      id: 3,
      day: 81,
      date: 'Aug 20',
      domain: 'Health',
      color: '#FB923C',
      title: 'Sleep Cadence Stabilization',
      note: 'Calendar restructuring protected 8 hours of evening recovery. Rebound trajectory confirmed across 3 consecutive weeks.',
      cx: 565,
      cy: 60,
    },
  ];

  // Clip width based on simulationProgress (maps 0..90 to 0..650 width)
  const clipWidth = (simulationProgress / 90) * 650;

  return (
    <section 
      ref={sectionRef}
      id="observatory" 
      className="py-20 sm:py-28 border-b border-[#DDE2DD]/80 bg-[#121715] text-[#FAF9F5] relative overflow-hidden"
    >
      {/* Subtle Starfield & Celestial Grid */}
      <div className="absolute inset-0 observatory-grid-dark opacity-70 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#355C4A]/25 via-[#C58A45]/10 to-transparent blur-3xl pointer-events-none -z-10" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C2621] text-[#4ADE80] text-xs font-mono tracking-wider border border-[#4ADE80]/30">
              <Telescope size={13} className="text-[#4ADE80]" />
              <span className="uppercase font-semibold text-[10.5px]">Centerpiece · Longitudinal Life Horizon</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#FFFFFF] tracking-tight leading-[1.12]">
              Looking into an observatory, <br />
              <span className="italic text-[#4ADE80]">not a spreadsheet.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#A8B2AC] leading-relaxed">
              Experience your trajectory as living astronomical vectors. Six life domains calibrated on an aligned continuous axis, revealing compounding breakthroughs that daily anxiety obscured.
            </p>
          </div>

          {/* Time Scrubber Controls */}
          <div className="flex flex-wrap items-center gap-2.5 p-1.5 rounded-full bg-[#1C2420] border border-[#2B3831] self-start lg:self-end">
            <button
              onClick={() => {
                if (simulationProgress >= 90) setSimulationProgress(10);
                setIsPlaying(!isPlaying);
              }}
              className="bg-[#4ADE80] hover:bg-[#22C55E] text-[#121715] text-xs font-heading font-bold py-2 px-3.5 rounded-full flex items-center gap-1.5 transition"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? 'Pause' : 'Animate Trajectory'}</span>
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setSimulationProgress(10);
              }}
              className="p-2 rounded-full text-[#8A938E] hover:text-white hover:bg-[#2B3831] transition"
              title="Reset animation"
            >
              <RotateCcw size={13} />
            </button>
            <span className="font-mono text-xs text-[#A8B2AC] pr-3 pl-1">
              Day {simulationProgress}/90
            </span>
          </div>
        </div>

        {/* The Observatory Celestial Box */}
        <div className="rounded-3xl bg-[#171E1A] border border-[#2B3831] shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Top Readout Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2B3831]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#4ADE80] animate-ping" />
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#FAF9F5]">
                Telescope Aperture · Continuous 90-Day Exposure
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10.5px] font-mono text-[#FACC15] px-2.5 py-0.5 rounded-full bg-[#2A2B1E] border border-[#FACC15]/30">
                Illustrative Demo Simulation
              </span>
              <span className="text-[11px] font-mono text-[#8A938E] hidden sm:inline">
                Hover domains or click turning point stars
              </span>
            </div>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition ${
                selectedDomain === 'all'
                  ? 'bg-[#4ADE80] text-[#121715] shadow-sm'
                  : 'bg-[#1C2621] text-[#A8B2AC] hover:text-white border border-[#2B3831]'
              }`}
            >
              All 6 Domains
            </button>
            {domains.map((d) => {
              const isSelected = selectedDomain === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(isSelected ? 'all' : d.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-heading font-medium flex items-center gap-1.5 transition border ${
                    isSelected
                      ? 'border-transparent text-[#121715] font-bold shadow-sm'
                      : 'border-[#2B3831] bg-[#1C2621] text-[#A8B2AC] hover:text-white'
                  }`}
                  style={{
                    backgroundColor: isSelected ? d.color : undefined,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isSelected ? '#121715' : d.color }}
                  />
                  <span>{d.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({d.label})</span>
                </button>
              );
            })}
          </div>

          {/* Optical Canvas SVG */}
          <div className="rounded-2xl bg-[#0E1311] p-4 sm:p-6 border border-[#2B3831] relative overflow-hidden">
            {/* Ambient Optical Light Cones */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ADE80]/5 rounded-full blur-3xl pointer-events-none" />

            <svg
              viewBox="0 0 650 240"
              className="w-full h-60 sm:h-80 overflow-visible"
              role="img"
              aria-label="Interactive illuminated Life Observatory Horizon Canvas"
            >
              <defs>
                <clipPath id="playbackClip">
                  <rect x="0" y="0" width={clipWidth} height="240" />
                </clipPath>
                <linearGradient id="gradLearnDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradCareerDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradHealthDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB923C" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FB923C" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="200" x2="650" y2="200" stroke="#1D2722" strokeDasharray="4 4" />
              <line x1="0" y1="130" x2="650" y2="130" stroke="#1D2722" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="650" y2="60" stroke="#1D2722" strokeDasharray="4 4" />

              {/* Trajectories Group with Live Clipping */}
              <g clipPath="url(#playbackClip)">
                {/* Domain: Energy (Gold) */}
                <path
                  d="M 0 180 Q 180 205, 360 165 T 650 85"
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth={selectedDomain === 'energy' ? 3.5 : 2}
                  opacity={selectedDomain === 'all' || selectedDomain === 'energy' ? 0.75 : 0.15}
                  strokeDasharray="4 2"
                />

                {/* Domain: Health (Orange) */}
                <path
                  d="M 0 175 Q 160 185, 340 160 T 650 60 L 650 240 L 0 240 Z"
                  fill="url(#gradHealthDark)"
                  opacity={selectedDomain === 'all' || selectedDomain === 'health' ? 0.8 : 0.05}
                />
                <path
                  d="M 0 175 Q 160 185, 340 160 T 650 60"
                  fill="none"
                  stroke="#FB923C"
                  strokeWidth={selectedDomain === 'health' ? 3.5 : 2.2}
                  opacity={selectedDomain === 'all' || selectedDomain === 'health' ? 0.9 : 0.15}
                />

                {/* Domain: Career (Blue) */}
                <path
                  d="M 0 160 Q 160 140, 340 155 T 650 70 L 650 240 L 0 240 Z"
                  fill="url(#gradCareerDark)"
                  opacity={selectedDomain === 'all' || selectedDomain === 'career' ? 0.75 : 0.05}
                />
                <path
                  d="M 0 160 Q 160 140, 340 155 T 650 70"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth={selectedDomain === 'career' ? 3.5 : 2.4}
                  opacity={selectedDomain === 'all' || selectedDomain === 'career' ? 0.9 : 0.15}
                />

                {/* Domain: Learning (Neon Emerald) */}
                <path
                  d="M 0 190 Q 140 180, 280 120 T 650 45 L 650 240 L 0 240 Z"
                  fill="url(#gradLearnDark)"
                  opacity={selectedDomain === 'all' || selectedDomain === 'learning' ? 0.9 : 0.05}
                />
                <path
                  d="M 0 190 Q 140 180, 280 120 T 650 45"
                  fill="none"
                  stroke="#4ADE80"
                  strokeWidth={selectedDomain === 'learning' ? 4 : 2.8}
                  opacity={selectedDomain === 'all' || selectedDomain === 'learning' ? 1 : 0.15}
                  className="observatory-glow-emerald"
                />
              </g>

              {/* Turning Point Stellar Nodes (only visible if within simulationProgress) */}
              {turningPoints.map((tp) => {
                const isVisible = tp.cx <= clipWidth;
                if (!isVisible) return null;
                const isSelected = activeTurningPoint === tp.id;
                return (
                  <g
                    key={tp.id}
                    className="cursor-pointer"
                    onClick={() => setActiveTurningPoint(tp.id)}
                  >
                    <line
                      x1={tp.cx}
                      y1={tp.cy}
                      x2={tp.cx}
                      y2="240"
                      stroke={tp.color}
                      strokeDasharray="2 2"
                      opacity={isSelected ? 0.8 : 0.25}
                    />

                    <circle
                      cx={tp.cx}
                      cy={tp.cy}
                      r={isSelected ? 8 : 5.5}
                      fill={tp.color}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />

                    {isSelected && (
                      <circle
                        cx={tp.cx}
                        cy={tp.cy}
                        r="16"
                        fill="none"
                        stroke={tp.color}
                        strokeWidth="1.5"
                        className="animate-ping opacity-75"
                      />
                    )}

                    <text
                      x={tp.cx}
                      y={tp.cy - 14}
                      textAnchor="middle"
                      fill={tp.color}
                      className="text-[10px] font-mono font-bold"
                    >
                      ★ {tp.title}
                    </text>
                  </g>
                );
              })}

              {/* Live Laser Scanner Head */}
              <line
                x1={clipWidth}
                y1="20"
                x2={clipWidth}
                y2="240"
                stroke="#4ADE80"
                strokeWidth="1.5"
                opacity="0.85"
              />
              <circle
                cx={clipWidth}
                cy="20"
                r="4"
                fill="#4ADE80"
                className="animate-ping"
              />
            </svg>

            {/* Time Axis */}
            <div className="flex justify-between text-[10px] font-mono uppercase text-[#8A938E] mt-3 pt-2 border-t border-[#2B3831]">
              <span>Day 01 (Initial Baseline)</span>
              <span className="text-[#60A5FA]">Day 54 (Resilience Decoupling)</span>
              <span className="text-[#4ADE80] font-bold">Day 90 (Active Calibration)</span>
            </div>
          </div>

          {/* Active Inflection Milestone Card */}
          {activeTurningPoint && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-[#1F2B24] border border-[#4ADE80]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#4ADE80]/20 text-[#4ADE80]">
                    Verified Turning Point Milestone
                  </span>
                  <span className="font-mono text-xs text-[#A8B2AC]">
                    Day {turningPoints.find((t) => t.id === activeTurningPoint)?.day} · {turningPoints.find((t) => t.id === activeTurningPoint)?.date}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-base text-[#FAF9F5]">
                  {turningPoints.find((t) => t.id === activeTurningPoint)?.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#A8B2AC] leading-relaxed max-w-2xl">
                  "{turningPoints.find((t) => t.id === activeTurningPoint)?.note}"
                </p>
              </div>

              <button
                onClick={onExploreDemo}
                className="bg-[#4ADE80] hover:bg-[#22C55E] text-[#121715] font-heading font-bold text-xs py-2.5 px-4 rounded-full flex items-center gap-1.5 transition shrink-0 self-start sm:self-center"
              >
                <span>Inspect in Prototype</span>
                <ChevronRight size={13} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
