import React, { useState } from 'react';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { LifeInsight } from '../types';

interface WhatChangedViewProps {
  insights?: LifeInsight[];
  onTriggerRecompute?: () => void;
  onExploreMore?: () => void;
}

export const WhatChangedView: React.FC<WhatChangedViewProps> = ({
  insights,
  onExploreMore,
}) => {
  const [activePeriod, setActivePeriod] = useState<'summer' | 'recent'>('summer');

  const periodLabel = activePeriod === 'summer' ? 'Jun 2026 → Aug 2026' : 'Jul 2026 → Aug 2026';

  const narrativeLead = activePeriod === 'summer'
    ? (insights && insights.length > 0 && insights[0].summary
        ? insights[0].summary
        : "Over the last 8 weeks, your deliberate practice in learning became an unbroken habit, while energy steadily recovered following the late-July delivery sprint.")
    : "Following the delivery of the July project milestone, your daily rhythm re-established restorative sleep and consistent morning routines, stabilizing focus.";

  const domainObservations = [
    {
      domain: 'Learning & Craft',
      color: '#355C4A',
      shift: 'Sporadic bursts → Unbroken morning habit',
      observation:
        'Daily practice transitioned from irregular weekend cramming into an anchored 45-minute morning routine. Even during high-pressure sprint cycles, you maintained consistency across 35 consecutive days.',
      evidenceNote: '35-day streak recorded · System design modules completed',
      direction: 'up' as const,
      delta: '+42% consistency',
    },
    {
      domain: 'Health & Recovery',
      color: '#C58A45',
      shift: 'Depleted baseline → Restored 8-hour anchor',
      observation:
        'Sleep stabilized as a protective anchor following the July milestone. You consciously protected evening wind-downs, reversing the mid-summer fatigue curve and restoring morning clarity.',
      evidenceNote: 'Consistent 10:30 PM wind-down · Rebounded sleep index',
      direction: 'up' as const,
      delta: '+31% recovery',
    },
    {
      domain: 'Physical Energy',
      color: '#D96B43',
      shift: 'Dormant schedule → Sustained aerobic rhythm',
      observation:
        'Morning runs resumed on a 3x weekly cadence. Rather than forcing high-strain intensity, you prioritized sustainable aerobic pacing, preventing afternoon energy crashes.',
      evidenceNote: 'Rebuilt 6:30 AM cadence · Heart-rate consistency',
      direction: 'up' as const,
      delta: '+28% frequency',
    },
    {
      domain: 'Social Connection',
      color: '#7A5B82',
      shift: 'Work isolation → Intentional weekend renewal',
      observation:
        'Social gatherings dipped significantly during the late-July deadline. While sprint demands crowded out friends for three weeks, intentional Sunday reconnects in late August have begun rebuilding your relational baseline.',
      evidenceNote: 'Sunday gatherings resumed · Reduced work on weekends',
      direction: 'rebounding' as const,
      delta: 'Rebounding from dip',
    },
  ];

  return (
    <section 
      aria-label="What Changed Longitudinal Observation" 
      className="space-y-8"
    >
      {/* Narrative Lead Observation */}
      <div className="rounded-[22px] bg-[#FAF9F5] border border-[#DDE2DD] p-7 sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#355C4A]" />
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#355C4A]">
              Cross-Domain Synthesis
            </span>
          </div>

          <div className="inline-flex items-center rounded-full bg-[#FFFFFF] border border-[#DDE2DD] p-0.5">
            <button
              onClick={() => setActivePeriod('summer')}
              className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition ${
                activePeriod === 'summer'
                  ? 'bg-[#355C4A] text-white'
                  : 'text-[#66706B] hover:text-[#1D2421]'
              }`}
            >
              Summer Arc (Jun–Aug)
            </button>
            <button
              onClick={() => setActivePeriod('recent')}
              className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition ${
                activePeriod === 'recent'
                  ? 'bg-[#355C4A] text-white'
                  : 'text-[#66706B] hover:text-[#1D2421]'
              }`}
            >
              Post-Sprint (Jul–Aug)
            </button>
          </div>
        </div>

        <p className="font-editorial text-xl sm:text-[1.6rem] text-[#1D2421] font-normal leading-[1.35] tracking-[-0.01em]">
          "{narrativeLead}"
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-[#DDE2DD]/80 text-[11.5px] text-[#66706B]">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#8A938E]">
            <Clock size={12} />
            Window: {periodLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#355C4A]">
            <BookOpen size={12} />
            Derived from 18 reflections &amp; verified calendar events
          </span>
        </div>
      </div>

      {/* Domain Qualitative Shifts — Asymmetric Editorial Layout */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8A938E]">
            Primary Longitudinal Breakthrough
          </span>
          <span className="font-mono text-[11px] text-[#355C4A] font-semibold">
            35 consecutive days anchored
          </span>
        </div>

        {/* Primary Breakthrough Feature: Learning & Craft */}
        <div className="rounded-[22px] bg-[#FFFFFF] border border-[#DDE2DD] p-7 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#355C4A]" />
              <h3 className="font-editorial text-2xl text-[#1D2421] font-normal">
                Learning &amp; Craft
              </h3>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#355C4A]">
              Sporadic bursts → Unbroken morning habit
            </span>
          </div>

          <p className="text-[15px] text-[#343F38] leading-relaxed max-w-3xl font-light">
            Daily practice transitioned from irregular weekend cramming into an anchored 45-minute morning routine. Even during high-pressure sprint cycles, you maintained consistency across 35 consecutive days without interruption.
          </p>

          <div className="mt-5 pt-4 border-t border-[#DDE2DD]/70 flex flex-wrap items-center justify-between gap-3 text-xs text-[#66706B]">
            <span className="font-mono text-[10.5px] text-[#8A938E]">
              35-day streak recorded · System design modules completed
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#355C4A] bg-[#EDF7F2] px-2.5 py-0.5 rounded-full">
              Anchor Domain
            </span>
          </div>
        </div>

        {/* Interconnected Compensatory Triad */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8A938E]">
              Compensatory Ripple Effects
            </span>
            <span className="text-[12px] text-[#66706B]">
              Energy, recovery, and relational dynamics
            </span>
          </div>

          <div className="rounded-[22px] bg-[#FFFFFF] border border-[#DDE2DD] divide-y lg:divide-y-0 lg:divide-x divide-[#DDE2DD] grid grid-cols-1 lg:grid-cols-3">
            {domainObservations.slice(1).map((d) => (
              <div key={d.domain} className="p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <h4 className="font-heading font-semibold text-[14px] text-[#1D2421]">
                      {d.domain}
                    </h4>
                  </div>

                  <p className="font-mono text-[10px] text-[#8A938E] uppercase tracking-wider mb-2.5">
                    {d.shift}
                  </p>

                  <p className="text-[13.5px] text-[#4F5A55] leading-relaxed">
                    {d.observation}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#F0F2EF] text-[11px] text-[#8A938E] font-mono">
                  {d.evidenceNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Epistemic Grounding Note — Integrated Bridge */}
      <div className="p-6 rounded-[22px] bg-[#FAF9F5] border border-[#DDE2DD] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h4 className="font-editorial text-base text-[#1D2421] font-medium mb-1">
            Understanding Compensatory Cycles
          </h4>
          <p className="text-xs text-[#66706B] leading-relaxed max-w-2xl">
            Human lives rarely advance symmetrically in every domain at once. The Observatory tracks natural compensations: high sprint velocity often draws temporary borrowing from social restoration, followed by intentional recovery.
          </p>
        </div>

        {onExploreMore && (
          <button
            onClick={onExploreMore}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#355C4A] hover:underline shrink-0"
          >
            <span>Explore full timeline</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </section>
  );
};
