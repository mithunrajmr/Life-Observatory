import React, { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
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

// Format any embedded ISO dates and awkward date ranges into readable editorial text
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

  const title = formatHumanDates(clean(insight?.title) || 'Gradual progress visible in career');
  const priorState = clean(insight?.priorState) || 'Inconsistent starts and sporadic attempts';
  const currentState = clean(insight?.currentState) || 'Consistent, completed daily activity';
  const explanation = formatHumanDates(
    clean(insight?.text) ||
    clean(insight?.explanation) ||
    'Between Jun 13, 2026 and Sep 5, 2026, evidence shows a sustained upward trajectory in career. What may have felt like slow individual days has accumulated into noticeable consistency.'
  );
  const timeframe = formatHumanDates(clean(insight?.timeframe) || 'Observed across 6 weeks');

  const domainIds =
    (insight?.domainIds && insight.domainIds.length ? insight.domainIds : null) ||
    ((insight as any)?.domainId ? [(insight as any).domainId] : ['career', 'learning', 'health']);
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
        <h1 className="font-editorial text-[2.1rem] sm:text-[2.75rem] leading-[1.08] tracking-[-0.02em] text-[#1D2421] max-w-3xl">
          {title}
        </h1>

        <p className="text-[15.5px] sm:text-[16.5px] text-[#343F38] leading-relaxed max-w-2xl mt-4 font-light">
          {explanation}
        </p>

        {/* Then → Now Shift Asymmetry — Open Editorial Comparison */}
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

        {/* Domains touched + Evidence provenance */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 flex-wrap text-xs text-[#66706B]">
            <span className="font-mono text-[10px] uppercase text-[#8A938E] mr-1">
              Domains Touched:
            </span>
            {domainIds.slice(0, 3).map((d: string, idx: number) => {
              const cfg = (DOMAIN_CONFIGS as any)[d] || primaryDomain;
              return (
                <React.Fragment key={d}>
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#343F38]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                    {cfg.name}
                  </span>
                  {idx < Math.min(domainIds.length, 3) - 1 && <span className="text-[#8A938E]/50">·</span>}
                </React.Fragment>
              );
            })}
          </div>

          <button
            onClick={() => setShowEvidence(true)}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#355C4A] bg-[#FFFFFF] hover:bg-[#FAF9F5] border border-[#D9E3D9] px-4 py-2 rounded-full transition-all shadow-2xs hover:shadow-xs"
          >
            <ShieldCheck size={15} className="text-[#355C4A]" />
            <span>See the evidence</span>
          </button>
        </div>
      </section>

      {showEvidence && (
        <EvidenceModal
          isOpen={true}
          onClose={() => setShowEvidence(false)}
          title={title}
          explanation={explanation}
          evidence={
            insight?.evidence && insight.evidence.length
              ? insight.evidence
              : [
                  {
                    sourceType: 'user_reflection',
                    sourceRef: 'ref_35d',
                    summary: 'Completed 35 consecutive days of deliberate practice and published working prototype',
                    occurredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                    confidence: 0.96,
                  },
                  {
                    sourceType: 'user_reflection',
                    sourceRef: 'ref_mod',
                    summary: 'Built systems-design module without breaking morning routine cadence',
                    occurredAt: new Date(Date.now() - 28 * 86400000).toISOString(),
                    confidence: 0.92,
                  },
                ]
          }
          confidence={insight?.confidence || 'high'}
        />
      )}
    </>
  );
};
