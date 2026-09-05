import React, { useState } from 'react';
import { Target, Compass, AlertCircle, Sparkles } from 'lucide-react';
import { Goal, Prediction, LifeInsight, DOMAIN_CONFIGS } from '../types';
import { EvidenceModal } from './EvidenceModal';

interface UpcomingPossibilitiesProps {
  goals?: Goal[];
  predictions?: Prediction[];
  insights?: LifeInsight[];
  onExploreSuggestions?: () => void;
}

export const UpcomingPossibilities: React.FC<UpcomingPossibilitiesProps> = ({
  goals = [],
  predictions = [],
  insights = [],
  onExploreSuggestions: _onExploreSuggestions,
}) => {
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<{
    title: string;
    description: string;
    evidence: any[];
  } | null>(null);

  // Derive prospective possibilities from real user data
  const possibilities: Array<{
    id: string;
    icon: React.ReactNode;
    color: string;
    text: string;
    badge: string;
    evidence?: any[];
  }> = [];

  // 1. Add active drift warnings
  const driftInsights = insights.filter(i => i.type === 'drift');
  for (const drift of driftInsights) {
    possibilities.push({
      id: drift.id,
      icon: <AlertCircle size={14} />,
      color: '#C58A45',
      text: drift.summary || drift.title,
      badge: 'Drift Notice',
      evidence: drift.evidence,
    });
  }

  // 2. Add active predictions / foresight hypotheses
  const activePreds = predictions.filter(p => p.status !== 'evaluated');
  for (const pred of activePreds) {
    const domId = pred.expectedOutcomes?.[0]?.domain || (pred as any).domainId || 'career';
    const cfg = (DOMAIN_CONFIGS as any)[domId] || DOMAIN_CONFIGS.career;
    possibilities.push({
      id: pred.id,
      icon: <Compass size={14} />,
      color: cfg.color,
      text: `Forecast test: "${pred.title || (pred as any).text}". Scheduled for review soon.`,
      badge: `${cfg.name} Hypothesis`,
    });
  }

  // 3. Add active stated intentions
  for (const goal of goals.filter(g => g.status === 'active').slice(0, 3)) {
    const cfg = (DOMAIN_CONFIGS as any)[goal.domainId] || DOMAIN_CONFIGS.career;
    possibilities.push({
      id: goal.id,
      icon: <Target size={14} />,
      color: cfg.color,
      text: `Active intention: "${goal.title}". Attention directed toward ${cfg.name.toLowerCase()}.`,
      badge: `${cfg.name} Intention`,
    });
  }

  return (
    <>
      <div className="rounded-[22px] bg-[#FFFFFF] border border-[#DDE2DD] p-7 sm:p-8">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-[#DDE2DD]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C58A45]" />
            <h3 className="font-editorial text-xl text-[#1D2421] font-medium">
              Upcoming Possibilities
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#8A938E]">
            Derived from active signals
          </span>
        </div>

        {/* List */}
        {possibilities.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] text-[#8A938E] flex items-center justify-center mx-auto mb-2">
              <Sparkles size={15} />
            </div>
            <p className="text-xs text-[#66706B] font-light max-w-sm mx-auto leading-relaxed">
              No active hypotheses or drift notices yet. When you set intentions, forecast outcomes, or observe habits, prospective trajectories will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EDECE6]">
            {possibilities.map(item => (
              <div 
                key={item.id} 
                className="py-4.5 first:pt-0 last:pb-0 flex items-start gap-4 group"
              >
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>

                <div className="flex-1">
                  <p className="text-[14px] text-[#2C3531] leading-relaxed font-light">
                    {item.text}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A938E]">
                      {item.badge}
                    </span>

                    {item.evidence && item.evidence.length > 0 && (
                      <button
                        onClick={() => setActiveEvidenceModal({
                          title: item.badge,
                          description: item.text,
                          evidence: item.evidence || [],
                        })}
                        className="text-[11px] font-mono text-[#355C4A] hover:underline"
                      >
                        Inspect evidence
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeEvidenceModal && (
        <EvidenceModal
          isOpen={true}
          onClose={() => setActiveEvidenceModal(null)}
          title={activeEvidenceModal.title}
          explanation={activeEvidenceModal.description}
          evidence={activeEvidenceModal.evidence}
        />
      )}
    </>
  );
};
