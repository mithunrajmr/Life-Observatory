import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { LifeInsight, DOMAIN_CONFIGS } from '../types';
import { EvidenceModal } from './EvidenceModal';

interface InvisibleProgressCardProps {
  insight: LifeInsight | null;
}

// Strip stray markdown / null artifacts so raw tokens never reach the UI
const clean = (s?: string | null): string =>
  (s || '')
    .replace(/[*_`#>]+/g, '')
    .replace(/\bundefined\b|\bnull\b/gi, '');

// Format embedded ISO dates into readable editorial text
const formatHumanDates = (text: string): string => {
  const formatted = text.replace(/(\d{4})-(\d{2})-(\d{2})/g, (_, y, m, d) => {
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime())
      ? `${y}-${m}-${d}`
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });
  return formatted.replace(/Across the last ([A-Z][a-z]{2}\s+\d+,?\s+\d{4})\s+to\s+([A-Z][a-z]{2}\s+\d+,?\s+\d{4})/gi, 'Between $1 and $2');
};

export const InvisibleProgressCard: React.FC<InvisibleProgressCardProps> = ({ insight }) => {
  const [showEvidence, setShowEvidence] = useState(false);

  // If no invisible progress detected yet, render an authentic, encouraging observation state
  if (!insight) {
    return (
      <section
        className="relative rounded-[24px] bg-[#EFF3EE] border border-[#D9E3D9] p-7 sm:p-10 transition shadow-2xs"
        aria-label="Discovery: You May Not Have Noticed This"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#355C4A]" />
          <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[#355C4A] font-semibold">
            Discovery · Longitudinal Momentum
          </span>
        </div>

        <h2 className="font-editorial text-[1.85rem] sm:text-[2.2rem] leading-[1.15] text-[#1D2421] max-w-2xl font-normal">
          Quiet shifts reveal themselves over time.
        </h2>

        <p className="text-[15px] sm:text-[16px] text-[#4F5A55] leading-relaxed max-w-2xl mt-3 font-light">
          Most meaningful growth happens too gradually to notice day to day. As you record reflections or connect your calendar, Life Observatory continuously analyzes cumulative patterns to surface subtle breakthroughs you might otherwise miss.
        </p>

        <div className="mt-6 pt-5 border-t border-[#D9E3D9] flex items-center gap-2 text-xs text-[#66706B] font-mono">
          <Sparkles size={13} className="text-[#355C4A]" />
          <span>Awaiting multi-session activity to establish baseline</span>
        </div>
      </section>
    );
  }

  const title = formatHumanDates(clean(insight.title) || 'Gradual progress observed');
  const priorState = clean(insight.priorState) || 'Inconsistent starts and sporadic attempts';
  const currentState = clean(insight.currentState) || 'Consistent, completed daily activity';
  const explanation = formatHumanDates(clean(insight.text) || clean(insight.explanation) || clean(insight.summary) || '');
  const timeframe = formatHumanDates(clean(insight.timeframe) || 'Observed across weeks');

  const domainIds = (insight.domainIds && insight.domainIds.length ? insight.domainIds : null) || ['personal'];
  const primaryDomain = (DOMAIN_CONFIGS as any)[domainIds[0]] || DOMAIN_CONFIGS.career;

  return (
    <>
      <section
        className="relative rounded-[24px] bg-[#EFF3EE] border border-[#D9E3D9] p-7 sm:p-10 transition shadow-2xs"
        aria-label="Discovery: You May Not Have Noticed This"
      >
        {/* Eyebrow + timeframe */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#355C4A]" />
            <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[#355C4A] font-semibold">
              Discovery · You May Not Have Noticed This
            </span>
          </div>
          <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#66706B] bg-[#FFFFFF]/70 px-3 py-1 rounded-full border border-[#D9E3D9]">
            {timeframe}
          </span>
        </div>

        {/* The Discovery Headline */}
        <h1 className="font-editorial text-[2.1rem] sm:text-[2.75rem] leading-[1.08] tracking-[-0.02em] text-[#1D2421] max-w-3xl font-normal">
          {title}
        </h1>

        {explanation && (
          <p className="text-[15.5px] sm:text-[16.5px] text-[#343F38] leading-relaxed max-w-2xl mt-4 font-light">
            {explanation}
          </p>
        )}

        {/* Then → Now Shift Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1.25fr] gap-5 sm:gap-8 items-center my-7 py-6 border-y border-[#D9E3D9]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A938E]" />
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8A938E]">
                Baseline (Then)
              </span>
            </div>
            <p className="text-[15px] text-[#55605B] leading-relaxed font-light">
              {priorState}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <span className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#D9E3D9] flex items-center justify-center text-[#355C4A] shadow-2xs shrink-0">
              <ArrowRight size={14} className="rotate-90 sm:rotate-0" />
            </span>
          </div>

          <div className="pl-0 sm:pl-2">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#355C4A]" />
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#355C4A] font-semibold">
                Observed Trajectory (Now)
              </span>
            </div>
            <p className="font-editorial text-[17px] sm:text-[19px] font-medium text-[#1D2421] leading-snug">
              {currentState}
            </p>
          </div>
        </div>

        {/* Provenance Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2.5">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: primaryDomain.color }} 
            />
            <span className="font-mono text-[11px] text-[#66706B]">
              Primary Domain: <strong className="font-semibold text-[#1D2421]">{primaryDomain.name}</strong>
            </span>
          </div>

          {insight.evidence && insight.evidence.length > 0 && (
            <button
              onClick={() => setShowEvidence(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#F7F6F2] border border-[#D9E3D9] text-[#1D2421] text-xs font-mono transition shadow-2xs"
            >
              <ShieldCheck size={13} className="text-[#355C4A]" />
              <span>Inspect {insight.evidence.length} supporting signals</span>
            </button>
          )}
        </div>
      </section>

      {showEvidence && insight.evidence && (
        <EvidenceModal
          isOpen={showEvidence}
          onClose={() => setShowEvidence(false)}
          title={title}
          explanation={explanation}
          evidence={insight.evidence}
        />
      )}
    </>
  );
};
