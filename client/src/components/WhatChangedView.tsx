import React, { useState } from 'react';
import { RefreshCw, ArrowRight, HelpCircle } from 'lucide-react';
import { LifeInsight, DOMAIN_CONFIGS } from '../types';
import { EvidenceModal } from './EvidenceModal';

interface WhatChangedViewProps {
  insights: LifeInsight[];
  onTriggerRecompute?: () => void;
}

export const WhatChangedView: React.FC<WhatChangedViewProps> = ({
  insights,
  onTriggerRecompute,
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<LifeInsight | null>(null);

  const whatChangedInsight = insights.find(i => i.type === 'what_changed');

  if (!whatChangedInsight) {
    return (
      <div className="card text-center p-8 border-dashed border-slate-800 bg-slate-900/40">
        <h3 className="text-base font-semibold text-slate-300">
          Period Comparison ("What Changed?")
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Compares earlier versus current observational windows to highlight trajectory inflection across domains.
        </p>
        {onTriggerRecompute && (
          <button 
            onClick={onTriggerRecompute}
            className="btn-secondary text-xs mt-4"
          >
            <RefreshCw size={14} /> Check Period Transitions
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card mb-8 animate-fade-in border-teal-500/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
            Longitudinal Shift Detection
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            What Changed? ({whatChangedInsight.period.from} → {whatChangedInsight.period.to})
          </h2>
        </div>

        <button
          onClick={() => setSelectedEvidence(whatChangedInsight)}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 self-start md:self-auto"
        >
          <HelpCircle size={14} />
          <span>Why? (Evidence)</span>
        </button>
      </div>

      <p className="text-sm text-slate-300 mb-6 leading-relaxed">
        {whatChangedInsight.explanation}
      </p>

      {/* Period Transition Domain Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {whatChangedInsight.domainIds.map(dom => {
          const cfg = DOMAIN_CONFIGS[dom];
          if (!cfg) return null;

          return (
            <div 
              key={dom} 
              className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between transition hover:border-slate-700"
            >
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: cfg.color }} 
                />
                <span className="text-sm font-medium text-slate-200">{cfg.name}</span>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-teal-300 bg-teal-500/10 px-2 py-1 rounded">
                <ArrowRight size={12} /> Shifted Up
              </div>
            </div>
          );
        })}
      </div>

      {selectedEvidence && (
        <EvidenceModal
          isOpen={true}
          onClose={() => setSelectedEvidence(null)}
          title={selectedEvidence.title}
          explanation={selectedEvidence.explanation}
          evidence={selectedEvidence.evidence}
          confidence={selectedEvidence.confidence}
        />
      )}
    </div>
  );
};
