import React, { useState } from 'react';
import { Sparkles, ArrowRight, HelpCircle, TrendingUp } from 'lucide-react';
import { LifeInsight, DOMAIN_CONFIGS } from '../types';
import { EvidenceModal } from './EvidenceModal';

interface InvisibleProgressCardProps {
  insight: LifeInsight | null;
}

export const InvisibleProgressCard: React.FC<InvisibleProgressCardProps> = ({ insight }) => {
  const [showEvidence, setShowEvidence] = useState(false);

  if (!insight) {
    return (
      <div className="card mb-8 border-dashed border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800/80 text-slate-400">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-300">
              Observing Subtle Progress...
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Invisible Progress surfaces sustained, gradual shifts once sufficient evidence accumulates across weeks.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const primaryDomain = insight.domainIds[0];
  const domainConfig = primaryDomain ? DOMAIN_CONFIGS[primaryDomain] : null;

  return (
    <>
      <div 
        className="card mb-8 relative overflow-hidden animate-fade-in border-indigo-500/30"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.08)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
                You May Not Have Noticed This
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {insight.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {domainConfig && (
              <span 
                className="badge"
                style={{
                  backgroundColor: `${domainConfig.color}20`,
                  color: domainConfig.color,
                  border: `1px solid ${domainConfig.color}40`,
                }}
              >
                {domainConfig.name}
              </span>
            )}
            <button
              onClick={() => setShowEvidence(true)}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-slate-300"
              aria-label="Inspect evidence supporting invisible progress"
            >
              <HelpCircle size={14} />
              <span>Why? (Evidence)</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {insight.explanation}
        </p>

        {/* Longitudinal Transition Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-start gap-3">
            <div className="mt-1 w-2.5 h-2.5 rounded-full bg-slate-500" />
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Prior State ({insight.period.from})
              </span>
              <p className="text-sm font-medium text-slate-300 mt-1">
                {insight.priorState || 'Sporadic or inconsistent activity'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400">
              <TrendingUp size={12} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  Current State ({insight.period.to})
                </span>
                <ArrowRight size={14} className="text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-white mt-1">
                {insight.currentState || 'Consistent, sustained completed activity'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <EvidenceModal
        isOpen={showEvidence}
        onClose={() => setShowEvidence(false)}
        title={insight.title}
        evidence={insight.evidence}
        confidence={insight.confidence}
        explanation={insight.explanation}
      />
    </>
  );
};
