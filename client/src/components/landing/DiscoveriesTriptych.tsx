import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, AlertCircle, RotateCcw, Play } from 'lucide-react';

export const DiscoveriesTriptych: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invisible' | 'drift' | 'possibilities'>('invisible');
  const [realigned, setRealigned] = useState<boolean>(false);
  
  // Lens 1: Compounding Stacker Animation State
  const [stackedCount, setStackedCount] = useState<number>(28);
  const [isStacking, setIsStacking] = useState<boolean>(false);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const hasAutoPlayedRef = React.useRef<boolean>(false);

  // Scroll-triggered auto-play: runs stacking accumulation once when scrolled into view
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoPlayedRef.current) {
          hasAutoPlayedRef.current = true;
          setStackedCount(1);
          setIsStacking(true);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isStacking) return;
    const timer = setInterval(() => {
      setStackedCount((prev) => {
        if (prev >= 28) {
          setIsStacking(false);
          return 28;
        }
        return prev + 1;
      });
    }, 70);
    return () => clearInterval(timer);
  }, [isStacking]);

  const handleSimulateStacking = () => {
    setStackedCount(1);
    setIsStacking(true);
  };

  return (
    <section 
      ref={sectionRef}
      id="discoveries" 
      className="py-20 sm:py-28 border-b border-[#DDE2DD]/80 bg-[#FAF9F5] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF7F2] text-[#3E8064] text-xs font-mono font-semibold border border-[#3E8064]/30">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Act V · Longitudinal Cognitive Lenses</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl text-[#1D2421] tracking-tight leading-[1.12]">
            What daily fatigue conceals, <br />
            <span className="italic text-[#355C4A] relative inline-block">
              the observatory reveals.
              <span className="absolute left-0 right-0 -bottom-1 h-[2.5px] bg-[#34D399] rounded-full opacity-70" />
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#4F5A55] leading-relaxed">
            Three interactive instruments designed to detect quiet compounding, catch silent drift, and model upcoming crossroads.
          </p>
        </div>

        {/* Discovery Lenses Switcher Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <button
            onClick={() => setActiveTab('invisible')}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === 'invisible'
                ? 'bg-[#FFFFFF] border-[#10B981] shadow-md scale-[1.02]'
                : 'bg-[#FFFFFF]/70 border-[#DDE2DD] hover:bg-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#10B981] font-bold">
                Instrument 01 · Compounding
              </span>
            </div>
            <h3 className="font-heading font-bold text-base text-[#1D2421]">
              Invisible Progress
            </h3>
            <p className="text-xs text-[#66706B] mt-1.5 leading-relaxed">
              Quiet compounding shifts that your daily fatigue caused you to overlook.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('drift')}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === 'drift'
                ? 'bg-[#FFFFFF] border-[#F59E0B] shadow-md scale-[1.02]'
                : 'bg-[#FFFFFF]/70 border-[#DDE2DD] hover:bg-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#F59E0B] font-bold">
                Instrument 02 · Alignment
              </span>
            </div>
            <h3 className="font-heading font-bold text-base text-[#1D2421]">
              Reality Check &amp; Drift
            </h3>
            <p className="text-xs text-[#66706B] mt-1.5 leading-relaxed">
              Compassionate, non-judgmental mirror comparing intentions against actual calendar time.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('possibilities')}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === 'possibilities'
                ? 'bg-[#FFFFFF] border-[#C084FC] shadow-md scale-[1.02]'
                : 'bg-[#FFFFFF]/70 border-[#DDE2DD] hover:bg-[#FFFFFF]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C084FC]" />
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#C084FC] font-bold">
                Instrument 03 · Forward Horizons
              </span>
            </div>
            <h3 className="font-heading font-bold text-base text-[#1D2421]">
              Upcoming Possibilities
            </h3>
            <p className="text-xs text-[#66706B] mt-1.5 leading-relaxed">
              Collaborative hypotheses based on trajectory momentum without deterministic prophecies.
            </p>
          </button>
        </div>

        {/* Dynamic Display of the Selected Instrument */}
        <div className="rounded-3xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-elevated p-6 sm:p-10 aperture-glow overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* LENS 1: INVISIBLE PROGRESS & STACKING ACCUMULATION */}
            {activeTab === 'invisible' && (
              <motion.div
                key="invisible"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF7F2] text-[#10B981] text-xs font-mono font-bold">
                    <Sparkles size={13} />
                    <span>Compounding Accumulation Engine</span>
                  </div>
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#1D2421]">
                    You may not have noticed this…
                  </h3>
                  <p className="text-sm sm:text-base text-[#4F5A55] leading-relaxed">
                    When you are in the thick of an exhausting sprint, emotional memory fixates on fatigue. The Observatory audits your historical records against your 60-day baseline to reveal that your execution held steady anyway.
                  </p>
                  
                  <div className="pt-2">
                    <button
                      onClick={handleSimulateStacking}
                      className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-bold shadow-xs"
                    >
                      <Play size={13} className="fill-current" />
                      <span>{isStacking ? 'Stacking Micro-Deltas...' : 'Simulate 28-Day Accumulation'}</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="p-6 rounded-2xl bg-[#0D1210] border border-white/10 shadow-xl space-y-5 text-white">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#34D399] font-bold">
                        {stackedCount} of 28 Consecutive Days Active
                      </span>
                      <span className="text-white/60">4 Fatigue Days Absorbed</span>
                    </div>

                    {/* Stacking day blocks grid with live active glow */}
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const isFilled = i < stackedCount;
                        const isFatigueDay = [4, 11, 19, 25].includes(i);
                        return (
                          <div
                            key={i}
                            className={`h-10 rounded-lg flex flex-col items-center justify-center text-[10.5px] font-mono font-bold transition-all duration-200 ${
                              !isFilled
                                ? 'bg-white/5 text-white/20 border border-white/5'
                                : isFatigueDay
                                ? 'bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40 shadow-xs'
                                : 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/50 shadow-xs'
                            }`}
                          >
                            <span>D{i + 1}</span>
                            {isFilled && isFatigueDay && <span className="text-[8px] text-[#FBBF24]">⚡</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center justify-between font-mono">
                      <span><strong>Accumulation Status:</strong> {Math.min(stackedCount, 24)} Focus Days + 4 High-Fatigue Days</span>
                      <span className="font-bold text-sm text-[#34D399]">+38% Delta</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* LENS 2: REALITY CHECK & 360° DRIFT COMPASS */}
            {activeTab === 'drift' && (
              <motion.div
                key="drift"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF4EB] text-[#F59E0B] text-xs font-mono font-bold border border-[#F59E0B]/30">
                    <AlertCircle size={13} />
                    <span>Interactive Drift Radar Compass</span>
                  </div>
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#1D2421]">
                    The gentle reality check.
                  </h3>
                  <p className="text-sm sm:text-base text-[#4F5A55] leading-relaxed">
                    Humans suffer from cognitive dissonance: we believe we prioritize physical health or craft, but our actual calendar allocation reveals a sharp divergence. Life Observatory catches drift early so you can course-correct before exhaustion.
                  </p>
                  <button
                    onClick={() => setRealigned(!realigned)}
                    className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 font-mono font-semibold"
                  >
                    <span>{realigned ? '✦ Show Observed Drift (68°)' : '✦ Test Intentional Re-Alignment (0°)'}</span>
                    <RotateCcw size={13} />
                  </button>
                </div>

                <div className="lg:col-span-7">
                  <div className="p-6 rounded-2xl bg-[#0D1210] border border-white/10 shadow-xl space-y-5 text-white">
                    {/* Visual 360° Drift Compass Needle */}
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                      <div className="relative w-40 h-40 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-black/40 shadow-inner">
                        {/* Compass North / South / East / West */}
                        <div className="absolute top-2 text-[9px] font-mono text-[#34D399] font-bold tracking-wider">INTENDED NORTH</div>
                        <div className="absolute right-2 text-[9px] font-mono text-[#F87171] font-bold">DRIFT 68°</div>
                        <div className="absolute bottom-2 text-[9px] font-mono text-white/30">CALENDAR BASE</div>

                        {/* Radar sweep line */}
                        <div className="absolute inset-0 rounded-full border border-white/5 animate-radar-sweep pointer-events-none" />

                        {/* Compass Needle */}
                        <div
                          className="w-2 h-18 rounded-full transition-transform duration-700 origin-bottom shadow-lg"
                          style={{
                            backgroundColor: realigned ? '#10B981' : '#EF4444',
                            transform: realigned ? 'rotate(0deg)' : 'rotate(68deg)',
                          }}
                        />
                        <div className="w-5 h-5 rounded-full bg-white absolute z-10 shadow-sm" />
                      </div>

                      <div className="space-y-3 text-xs flex-1 max-w-sm">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <span className="font-mono text-[10px] text-white/50 block uppercase">Stated Intention (Day 01):</span>
                          <span className="font-bold text-white">"Physical Health &amp; Deep Writing Craft"</span>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <span className="font-mono text-[10px] text-[#FBBF24] font-bold block uppercase">
                            {realigned ? 'Realigned Focus Boundary' : 'Observed Divergence (Day 45):'}
                          </span>
                          <p className="text-white/80 leading-relaxed font-mono text-[11px]">
                            {realigned
                              ? 'Morning focus buffer locked; meetings capped at 22 hrs/week.'
                              : '82% of calendar swallowed by meetings. Health unmentioned for 18 days.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* LENS 3: UPCOMING POSSIBILITIES & SCENARIO BRANCHING */}
            {activeTab === 'possibilities' && (
              <motion.div
                key="possibilities"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFF7] text-[#C084FC] text-xs font-mono font-bold border border-[#C084FC]/30">
                    <Compass size={13} />
                    <span>Collaborative Forward Hypotheses</span>
                  </div>
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#1D2421]">
                    Grounded upcoming possibilities.
                  </h3>
                  <p className="text-sm sm:text-base text-[#4F5A55] leading-relaxed">
                    Generic AI systems generate rigid prophecies ("You will burn out on Tuesday"). Life Observatory treats you like a thoughtful adult: modeling forward scenario branches based on verified rolling momentum so you can choose deliberately.
                  </p>
                </div>

                <div className="lg:col-span-7">
                  <div className="p-6 rounded-2xl bg-[#0D1210] border border-white/10 shadow-xl space-y-4 text-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Branch A */}
                      <div className="p-4 rounded-xl bg-white/5 border border-[#EF4444]/40 space-y-2">
                        <span className="text-[10.5px] font-mono text-[#F87171] font-bold uppercase block">
                          Branch A · Unchecked Overload
                        </span>
                        <p className="text-white/80 leading-relaxed font-mono text-[11px]">
                          "Continuing late-night email sprints will trigger an energy inflection dip 4 days before the product release."
                        </p>
                        <div className="text-[11px] font-mono text-[#F87171] font-bold">
                          Projected Energy: -28% dip
                        </div>
                      </div>

                      {/* Branch B */}
                      <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/50 space-y-2 shadow-sm">
                        <span className="text-[10.5px] font-mono text-[#34D399] font-bold uppercase block">
                          Branch B · Protected Focus Boundary
                        </span>
                        <p className="text-white/95 font-medium leading-relaxed font-mono text-[11px]">
                          "Preserving 45-minute morning boundaries on Wed &amp; Thu stabilizes energy trajectory through release week."
                        </p>
                        <div className="text-[11px] font-mono text-[#34D399] font-bold">
                          Projected Momentum: +22% stability
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
