import React, { useState } from 'react';
import { Compass, AlertTriangle, HelpCircle } from 'lucide-react';
import { LifeInsight } from '../types';
import { EvidenceModal } from './EvidenceModal';

interface DriftCardProps {
  driftInsights: LifeInsight[];
}

export const DriftCard: React.FC<DriftCardProps> = ({ driftInsights }) => {
  const [selectedDrift, setSelectedDrift] = useState<LifeInsight | null>(null);

  if (driftInsights.length === 0) {
    return null; // Don't clutter UI if no drift detected
  }

  return (
    <div className="card mb-8 border-amber-500/20 bg-slate-900/60">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
          <Compass size={18} />
        </div>
        <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
          Intention vs. Activity Notice (Drift)
        </span>
      </div>

      <div className="space-y-4">
        {driftInsights.map(d => (
          <div 
            key={d.id} 
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">{d.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{d.summary}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDrift(d)}
              className="btn-secondary text-xs py-1.5 px-3 self-start md:self-auto flex items-center gap-1 text-slate-300"
            >
              <HelpCircle size={14} />
              <span>Details</span>
            </button>
          </div>
        ))}
      </div>

      {selectedDrift && (
        <EvidenceModal
          isOpen={true}
          onClose={() => setSelectedDrift(null)}
          title={selectedDrift.title}
          explanation={selectedDrift.explanation}
          evidence={selectedDrift.evidence}
          confidence={selectedDrift.confidence}
        />
      )}
    </div>
  );
};
