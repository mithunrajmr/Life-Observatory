import React from 'react';
import { BookOpen, Clock, Sparkles } from 'lucide-react';
import { LifeInsight, DOMAIN_CONFIGS, DomainId } from '../types';

interface WhatChangedViewProps {
  insights?: LifeInsight[];
  onTriggerRecompute?: () => void;
  onExploreMore?: () => void;
}

export const WhatChangedView: React.FC<WhatChangedViewProps> = ({
  insights = [],
  onExploreMore: _onExploreMore,
}) => {
  // Find authentic "what_changed" insight or first available insight
  const whatChangedInsight = insights.find(i => i.type === 'what_changed') || insights[0];

  if (!whatChangedInsight) {
    return (
      <section 
        aria-label="What Changed Longitudinal Observation" 
        className="rounded-[22px] bg-[#FFFFFF] border border-[#DDE2DD] p-8 sm:p-12 text-center"
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#EFF3EE] text-[#355C4A] flex items-center justify-center mx-auto mb-4">
            <Sparkles size={18} />
          </div>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#355C4A] font-semibold block">
            Longitudinal Shift Detection
          </span>
          <h3 className="font-editorial text-2xl text-[#1D2421] font-normal">
            The comparative view is forming
          </h3>
          <p className="text-[14px] text-[#66706B] leading-relaxed font-light">
            Observing your trajectory across weeks. As your reflections and connected activities accumulate, Life Observatory will surface subtle shifts and trade-offs between your focus, energy, and habits.
          </p>
        </div>
      </section>
    );
  }

  const periodLabel = whatChangedInsight.period
    ? `${whatChangedInsight.period.from} → ${whatChangedInsight.period.to}`
    : 'Recent Observatory Window';

  const domainIds = whatChangedInsight.domainIds && whatChangedInsight.domainIds.length > 0
    ? whatChangedInsight.domainIds
    : (['career', 'learning'] as DomainId[]);

  const evidenceCount = whatChangedInsight.evidence?.length || 0;

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

          <span className="font-mono text-[10px] tracking-wider uppercase text-[#66706B] bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#DDE2DD]">
            {periodLabel}
          </span>
        </div>

        <h2 className="font-editorial text-2xl sm:text-3xl text-[#1D2421] font-normal mb-3 leading-tight">
          {whatChangedInsight.title}
        </h2>

        <p className="font-editorial text-xl sm:text-[1.45rem] text-[#2C3531] font-normal leading-[1.38] tracking-[-0.01em]">
          "{whatChangedInsight.summary}"
        </p>

        {whatChangedInsight.explanation && (
          <p className="text-[14.5px] text-[#55605B] mt-4 leading-relaxed font-light">
            {whatChangedInsight.explanation}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-[#DDE2DD]/80 text-[11.5px] text-[#66706B]">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#8A938E]">
            <Clock size={12} />
            Window: {periodLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#355C4A]">
            <BookOpen size={12} />
            {evidenceCount > 0 ? `Derived from ${evidenceCount} verified observation${evidenceCount === 1 ? '' : 's'}` : 'Derived from recorded activity'}
          </span>
        </div>
      </div>

      {/* Domain Qualitative Shifts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8A938E]">
            Observed Domain Dynamics
          </span>
          <span className="font-mono text-[11px] text-[#355C4A]">
            {domainIds.length} active domain{domainIds.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainIds.map((domId) => {
            const cfg = (DOMAIN_CONFIGS as any)[domId] || DOMAIN_CONFIGS.career;
            return (
              <div 
                key={domId}
                className="rounded-[20px] bg-[#FFFFFF] border border-[#DDE2DD] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <h4 className="font-heading font-semibold text-[14px] text-[#1D2421]">
                      {cfg.name}
                    </h4>
                  </div>
                  <p className="text-[13px] text-[#4F5A55] leading-relaxed">
                    Observable momentum identified in {cfg.name.toLowerCase()} through recent observations.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0F2EF] text-[10.5px] text-[#8A938E] font-mono">
                  Verified in timeline
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
