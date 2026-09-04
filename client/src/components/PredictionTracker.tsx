import React, { useState } from 'react';
import { Target, CheckCircle2, Clock, Plus } from 'lucide-react';
import { Prediction, DOMAIN_CONFIGS, DomainId } from '../types';

interface PredictionTrackerProps {
  predictions: Prediction[];
  onCreatePrediction: (prediction: any) => Promise<void>;
  onRecordOutcome: (predictionId: string, outcomeData: any) => Promise<void>;
}

export const PredictionTracker: React.FC<PredictionTrackerProps> = ({
  predictions,
  onCreatePrediction,
  onRecordOutcome,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  // New prediction state
  const [title, setTitle] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<DomainId>('career');
  const [expectedDirection, setExpectedDirection] = useState<'up' | 'down' | 'stable'>('up');
  const [reviewDate, setReviewDate] = useState('');

  // Outcome reflection state
  const [userReflection, setUserReflection] = useState('');
  const [observedDirection, setObservedDirection] = useState<'up' | 'down' | 'stable'>('up');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreatePrediction({
      title: title.trim(),
      expectedOutcomes: [
        {
          domain: selectedDomain,
          direction: expectedDirection,
          confidence: 0.75,
          timeframe: '1-3 months',
        },
      ],
      reviewAt: reviewDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    setTitle('');
    setShowModal(false);
  };

  const handleOutcomeSubmit = async (predictionId: string) => {
    await onRecordOutcome(predictionId, {
      actualOutcomes: [
        {
          domain: selectedDomain,
          observedDirection,
          notes: userReflection,
        },
      ],
      userReflection,
      alignmentScore: 0.8,
    });

    setActiveReviewId(null);
    setUserReflection('');
  };

  return (
    <div className="card mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Target size={20} className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Prediction → Outcome Learning</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test expectations against later reality to calibrate decision confidence over time.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs self-start sm:self-auto"
        >
          <Plus size={15} /> Make New Prediction
        </button>
      </div>

      {predictions.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-dashed border-slate-800 text-slate-400">
          <Clock size={28} className="mx-auto mb-2 text-slate-500" />
          <p className="text-sm font-medium text-slate-300">No active decision predictions</p>
          <p className="text-xs text-slate-500 mt-1">
            When making a major decision or setting a goal, record what you predict will happen to review later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {predictions.map(pred => {
            const isEvaluating = activeReviewId === pred.id;
            const primaryExp = pred.expectedOutcomes[0];

            return (
              <div 
                key={pred.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{pred.title}</h3>
                    <span className={`badge text-[10px] ${
                      pred.status === 'evaluated' 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {pred.status === 'evaluated' ? 'EVALUATED' : 'ACTIVE'}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500">
                    Review Target: {pred.reviewAt}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <span>Domain: <strong className="text-slate-200">{primaryExp?.domain}</strong></span>
                  <span>•</span>
                  <span>Expected Direction: <strong className="text-indigo-300 uppercase">{primaryExp?.direction}</strong></span>
                </div>

                {pred.status === 'active' && !isEvaluating && (
                  <button
                    onClick={() => setActiveReviewId(pred.id)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} /> Record Actual Outcome
                  </button>
                )}

                {isEvaluating && (
                  <div className="mt-3 p-3 bg-slate-950/80 rounded-lg border border-indigo-500/30 animate-fade-in space-y-3">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      Compare Expectation with Observed Reality
                    </h4>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Observed Direction</label>
                      <select 
                        value={observedDirection} 
                        onChange={(e: any) => setObservedDirection(e.target.value)}
                        className="w-full text-xs"
                      >
                        <option value="up">Trajectory shifted upward</option>
                        <option value="stable">Remained mostly stable</option>
                        <option value="down">Declined or struggled</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Your Reflection on the Outcome</label>
                      <textarea
                        value={userReflection}
                        onChange={(e) => setUserReflection(e.target.value)}
                        placeholder="What actually occurred compared to what you expected? What surprised you?"
                        className="w-full text-xs h-20"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveReviewId(null)}
                        className="btn-secondary text-xs py-1 px-3"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleOutcomeSubmit(pred.id)}
                        className="btn-primary text-xs py-1 px-3"
                      >
                        Save Outcome Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Prediction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4">Record New Decision Prediction</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Decision / Prediction Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Changing jobs to join a startup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Target Domain</label>
                <select
                  value={selectedDomain}
                  onChange={(e: any) => setSelectedDomain(e.target.value)}
                  className="w-full text-sm"
                >
                  {Object.entries(DOMAIN_CONFIGS).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Expected Trajectory Direction</label>
                <select
                  value={expectedDirection}
                  onChange={(e: any) => setExpectedDirection(e.target.value)}
                  className="w-full text-sm"
                >
                  <option value="up">Upward (Improvement / Growth)</option>
                  <option value="stable">Stable (Consistent baseline)</option>
                  <option value="down">Downward (Short term friction / decline)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Review Target Date</label>
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Save Prediction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
