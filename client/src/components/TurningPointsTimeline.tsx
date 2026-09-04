import React, { useState } from 'react';
import { Flag, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { TurningPoint, DOMAIN_CONFIGS } from '../types';
import { EvidenceModal } from './EvidenceModal';

interface TurningPointsTimelineProps {
  turningPoints: TurningPoint[];
  onUpdateStatus: (id: string, status: 'confirmed' | 'rejected') => Promise<void>;
}

export const TurningPointsTimeline: React.FC<TurningPointsTimelineProps> = ({
  turningPoints,
  onUpdateStatus,
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<TurningPoint | null>(null);

  if (turningPoints.length === 0) {
    return (
      <div className="card text-center p-12 text-slate-400">
        <Flag size={28} className="mx-auto mb-3 text-slate-500" />
        <h3 className="text-base font-semibold text-slate-300">No Turning Points Recorded Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Meaningful inflection points and trajectory shifts will appear here as you log reflections and life milestones.
        </p>
      </div>
    );
  }

  return (
    <div className="card mb-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Flag size={20} className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Turning-Point Timeline</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inflection points that meaningfully alter long-term life trajectory. Review and confirm candidates.
          </p>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {turningPoints.map(tp => (
          <div key={tp.id} className="relative group">
            {/* Timeline node marker */}
            <div 
              className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-canvas transition ${
                tp.status === 'confirmed' 
                  ? 'bg-indigo-500' 
                  : tp.status === 'rejected'
                  ? 'bg-slate-700'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-white">{tp.title}</h4>
                  <span className={`badge text-[10px] ${
                    tp.status === 'confirmed' ? 'bg-indigo-500/20 text-indigo-300' :
                    tp.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {tp.status.toUpperCase()}
                  </span>
                  {tp.domains.map(d => (
                    <span 
                      key={d} 
                      className="text-[10px] px-2 py-0.5 rounded font-semibold"
                      style={{ backgroundColor: `${DOMAIN_CONFIGS[d]?.color || '#818CF8'}20`, color: DOMAIN_CONFIGS[d]?.color || '#818CF8' }}
                    >
                      {DOMAIN_CONFIGS[d]?.name || d}
                    </span>
                  ))}
                </div>

                <span className="text-xs text-slate-500">
                  {new Date(tp.occurredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <p className="text-sm text-slate-300 mb-2 leading-relaxed">
                {tp.description}
              </p>

              <p className="text-xs text-indigo-300/80 bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-900/40 mb-3">
                <strong>Trajectory Shift:</strong> {tp.trajectoryShiftSummary}
              </p>

              {/* Actions & Evidence */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedEvidence(tp)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                >
                  <HelpCircle size={14} />
                  <span>Inspect Evidence</span>
                </button>

                {tp.status === 'candidate' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateStatus(tp.id, 'confirmed')}
                      className="btn-primary text-xs py-1 px-3 flex items-center gap-1"
                    >
                      <CheckCircle size={13} /> Confirm
                    </button>
                    <button
                      onClick={() => onUpdateStatus(tp.id, 'rejected')}
                      className="btn-secondary text-xs py-1 px-3 flex items-center gap-1 text-slate-400 hover:text-red-300"
                    >
                      <XCircle size={13} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedEvidence && (
        <EvidenceModal
          isOpen={true}
          onClose={() => setSelectedEvidence(null)}
          title={`Evidence for ${selectedEvidence.title}`}
          explanation={selectedEvidence.trajectoryShiftSummary}
          evidence={[]}
          confidence="high"
        />
      )}
    </div>
  );
};
