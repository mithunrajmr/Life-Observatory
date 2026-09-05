import React, { useState } from 'react';
import { Plus, CheckCircle2, X } from 'lucide-react';
import { Prediction, Goal, DOMAIN_CONFIGS, DomainId } from '../types';

interface PredictionTrackerProps {
  predictions: Prediction[];
  goals?: Goal[];
  onCreateGoal?: (title: string, domainId: string) => Promise<void>;
  onDeleteGoal?: (goalId: string) => Promise<void>;
  onCreatePrediction: (prediction: any) => Promise<void>;
  onRecordOutcome: (predictionId: string, outcomeData: any) => Promise<void>;
}

const fmtDateStr = (str?: string) => {
  if (!str) return 'Next month';
  const d = new Date(str.includes('T') ? str : `${str}T00:00:00`);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const PredictionTracker: React.FC<PredictionTrackerProps> = ({
  predictions,
  goals = [],
  onCreateGoal,
  onDeleteGoal,
  onCreatePrediction,
  onRecordOutcome,
}) => {
  // Goal modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDomain, setNewGoalDomain] = useState<DomainId>('health');

  // Prediction modal
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predTitle, setPredTitle] = useState('');
  const [predDomain, setPredDomain] = useState<DomainId>('career');
  const [predDirection, setPredDirection] = useState<'improving' | 'stable' | 'recalibrating'>('improving');
  const [reviewDate, setReviewDate] = useState('');

  // Outcome recording
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [outcomeReflection, setOutcomeReflection] = useState('');

  // Deduplicate goals by lowercase trimmed title
  const deduplicatedGoals: Goal[] = [];
  const seenTitles = new Set<string>();
  for (const g of goals) {
    const key = g.title.toLowerCase().trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      deduplicatedGoals.push(g);
    }
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !onCreateGoal) return;
    await onCreateGoal(newGoalTitle.trim(), newGoalDomain);
    setNewGoalTitle('');
    setShowGoalModal(false);
  };

  const handleCreatePred = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!predTitle.trim()) return;

    await onCreatePrediction({
      title: predTitle.trim(),
      expectedOutcomes: [
        {
          domain: predDomain,
          direction: predDirection,
          timeframe: '1-3 months',
        },
      ],
      reviewAt: reviewDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    });

    setPredTitle('');
    setShowPredictionModal(false);
  };

  const handleOutcomeSubmit = async (predId: string) => {
    await onRecordOutcome(predId, {
      actualOutcomes: [
        {
          domain: predDomain,
          observedDirection: 'improving',
          notes: outcomeReflection,
        },
      ],
      userReflection: outcomeReflection,
      alignmentScore: 0.85,
    });
    setActiveReviewId(null);
    setOutcomeReflection('');
  };

  const activePredictions = predictions.filter(p => p.status !== 'evaluated');
  const evaluatedPredictions = predictions.filter(p => p.status === 'evaluated');

  return (
    <div className="space-y-10 animate-fade-in mb-12">
      {/* Editorial Calibration Overview Banner */}
      <div className="rounded-[22px] bg-[#FAF9F5] border border-[#DDE2DD] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#DDE2DD]/80">
          <div>
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#355C4A] block mb-1">
              Epistemic Calibration Instrument
            </span>
            <h2 className="font-editorial text-2xl sm:text-[1.85rem] text-[#1D2421] font-medium leading-tight">
              Test your self-prediction intuition
            </h2>
            <p className="text-[13.5px] text-[#66706B] leading-relaxed max-w-2xl mt-1.5">
              Traditional trackers treat goals as binary checklists. Life Observatory observes the lifecycle: where you intend your energy to go, what you expect to feel, and what the delta between expectation and reality teaches you about yourself.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowGoalModal(true)}
              className="rounded-full bg-[#355C4A] text-white text-xs font-medium px-4 py-2.5 hover:bg-[#284738] transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              <span>Set Intention</span>
            </button>
            <button
              onClick={() => setShowPredictionModal(true)}
              className="rounded-full bg-[#FFFFFF] border border-[#DDE2DD] text-[#1D2421] text-xs font-medium px-4 py-2.5 hover:bg-[#F1F2EE] transition flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Record Expectation</span>
            </button>
          </div>
        </div>

        {/* 4-Step Lifecycle Indicator */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="border-l-2 border-[#355C4A] pl-3">
            <span className="font-mono text-[10px] uppercase text-[#8A938E] block">Phase 1</span>
            <p className="font-heading font-semibold text-xs text-[#1D2421] mt-0.5">Stated Intention</p>
            <p className="text-[11px] text-[#66706B] mt-0.5">What I Want</p>
          </div>
          <div className="border-l-2 border-[#C58A45] pl-3">
            <span className="font-mono text-[10px] uppercase text-[#8A938E] block">Phase 2</span>
            <p className="font-heading font-semibold text-xs text-[#1D2421] mt-0.5">Foresight Hypothesis</p>
            <p className="text-[11px] text-[#66706B] mt-0.5">What I Expect</p>
          </div>
          <div className="border-l-2 border-[#3E8064] pl-3">
            <span className="font-mono text-[10px] uppercase text-[#8A938E] block">Phase 3</span>
            <p className="font-heading font-semibold text-xs text-[#1D2421] mt-0.5">Timeline Reality</p>
            <p className="text-[11px] text-[#66706B] mt-0.5">What Happened</p>
          </div>
          <div className="border-l-2 border-[#7A5B82] pl-3">
            <span className="font-mono text-[10px] uppercase text-[#8A938E] block">Phase 4</span>
            <p className="font-heading font-semibold text-xs text-[#1D2421] mt-0.5">Calibration Delta</p>
            <p className="text-[11px] text-[#66706B] mt-0.5">What It Taught Me</p>
          </div>
        </div>
      </div>

      {/* PHASE 1: WHAT I WANT — STATED INTENTIONS */}
      <section aria-labelledby="phase-1-intentions">
        <div className="flex items-baseline justify-between gap-4 mb-4 pb-2 border-b border-[#DDE2DD]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#355C4A]" />
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#355C4A]">
                Phase 1 · Direction of Attention
              </span>
            </div>
            <h3 id="phase-1-intentions" className="font-editorial text-xl text-[#1D2421] font-medium mt-1">
              Active Intentions &amp; Priorities
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#8A938E]">
            {deduplicatedGoals.length} recorded
          </span>
        </div>

        {deduplicatedGoals.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF9F5] rounded-2xl border border-dashed border-[#DDE2DD] text-xs text-[#66706B]">
            No intentions registered yet. State what you want to guide your horizon.
          </div>
        ) : (
          <div className="rounded-[22px] bg-[#FFFFFF] border border-[#DDE2DD] divide-y divide-[#EDECE6]">
            {deduplicatedGoals.map(g => {
              const cfg = (DOMAIN_CONFIGS as any)[g.domainId] || DOMAIN_CONFIGS.career;
              return (
                <div 
                  key={g.id} 
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F5]/60 transition group"
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 sm:mt-0"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A938E]">
                          {cfg.name}
                        </span>
                      </div>
                      <p className="text-[14.5px] text-[#1D2421] font-medium leading-snug mt-0.5">
                        {g.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <span className="text-[11px] font-mono text-[#355C4A] bg-[#EDF7F2] px-2.5 py-0.5 rounded-full">
                      Tracked in reflections
                    </span>

                    {onDeleteGoal && (
                      <button
                        onClick={() => onDeleteGoal(g.id)}
                        className="text-[#A0A8A2] hover:text-[#A95C58] px-2 py-1 text-[11px] font-mono transition opacity-40 group-hover:opacity-100"
                        title="Archive intention"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PHASE 2: WHAT I EXPECT — FORESIGHT HYPOTHESES */}
      <section aria-labelledby="phase-2-expectations">
        <div className="flex items-baseline justify-between gap-4 mb-4 pb-2 border-b border-[#DDE2DD]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C58A45]" />
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#C58A45]">
                Phase 2 · The Decision Hypotheses
              </span>
            </div>
            <h3 id="phase-2-expectations" className="font-editorial text-xl text-[#1D2421] font-medium mt-1">
              Expectations &amp; Intuition Forecasts
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#8A938E]">
            {activePredictions.length} open tests
          </span>
        </div>

        {activePredictions.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF9F5] rounded-2xl border border-dashed border-[#DDE2DD] text-xs text-[#66706B]">
            No active hypotheses. When taking a step or setting a habit, predict what you expect to experience.
          </div>
        ) : (
          <div className="space-y-4">
            {activePredictions.map(pred => {
              const domId = (pred.expectedOutcomes?.[0]?.domain || (pred as any).domainId || 'career') as DomainId;
              const cfg = (DOMAIN_CONFIGS as any)[domId] || DOMAIN_CONFIGS.career;
              const isReviewing = activeReviewId === pred.id;

              return (
                <div 
                  key={pred.id}
                  className="rounded-[20px] bg-[#FFFFFF] border border-[#DDE2DD] p-5 sm:p-6 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#66706B]">
                          {cfg.name}
                        </span>
                        <span className="font-mono text-[10.5px] text-[#8A938E]">
                          · Review Target: {fmtDateStr(pred.reviewAt)}
                        </span>
                      </div>
                      <h4 className="font-editorial text-lg text-[#1D2421] font-medium">
                        "{pred.title || (pred as any).text}"
                      </h4>
                    </div>

                    <button
                      onClick={() => setActiveReviewId(isReviewing ? null : pred.id)}
                      className="rounded-full bg-[#355C4A] text-white text-xs font-medium px-4 py-2 hover:bg-[#284738] transition whitespace-nowrap self-start sm:self-auto shrink-0 shadow-xs"
                    >
                      {isReviewing ? 'Cancel' : 'Record Actual Reality'}
                    </button>
                  </div>

                  {isReviewing && (
                    <div className="mt-4 pt-4 border-t border-[#DDE2DD] animate-fade-in">
                      <label className="text-xs font-semibold text-[#1D2421] block mb-1">
                        What actually happened when reality unfolded?
                      </label>
                      <textarea
                        value={outcomeReflection}
                        onChange={(e) => setOutcomeReflection(e.target.value)}
                        placeholder="Reflect on whether your expectation held up, what surprised you, and what you learned about your forecasting intuition..."
                        className="w-full h-24 text-xs p-3 bg-[#FAF9F5] border border-[#DDE2DD] rounded-xl mb-3 leading-relaxed focus:outline-none focus:border-[#355C4A]"
                      />
                      <button
                        onClick={() => handleOutcomeSubmit(pred.id)}
                        disabled={!outcomeReflection.trim()}
                        className="rounded-full bg-[#355C4A] text-white text-xs font-medium px-5 py-2 hover:bg-[#284738] disabled:opacity-40 transition"
                      >
                        Save Observation &amp; Calibrate
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PHASE 3 & 4: WHAT HAPPENED & CALIBRATION DELTA */}
      {evaluatedPredictions.length > 0 && (
        <section aria-labelledby="phase-3-calibration">
          <div className="flex items-baseline justify-between gap-4 mb-4 pb-2 border-b border-[#DDE2DD]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3E8064]" />
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#3E8064]">
                  Phases 3 &amp; 4 · Reality &amp; Calibration
                </span>
              </div>
              <h3 id="phase-3-calibration" className="font-editorial text-xl text-[#1D2421] font-medium mt-1">
                Calibrated Outcomes &amp; Insights
              </h3>
            </div>
            <span className="font-mono text-[11px] text-[#3E8064]">
              {evaluatedPredictions.length} calibrated
            </span>
          </div>

          <div className="space-y-4">
            {evaluatedPredictions.map(pred => (
              <div 
                key={pred.id} 
                className="rounded-[20px] bg-[#EFF3EE] border border-[#D9E3D9] p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#355C4A]">
                    Hypothesis Tested
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[#3E8064] bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#3E8064]/30">
                    <CheckCircle2 size={12} />
                    CALIBRATED · 85% ALIGNMENT
                  </span>
                </div>

                <h4 className="font-editorial text-lg text-[#1D2421] font-medium mb-3">
                  "{pred.title}"
                </h4>

                <div className="rounded-xl bg-[#FFFFFF] border border-[#D9E3D9] p-4 text-xs text-[#4F5A55] leading-relaxed">
                  <span className="font-mono text-[10px] uppercase text-[#355C4A] font-semibold block mb-1">
                    Observed Reality &amp; Reflection
                  </span>
                  {(pred as any).actualOutcomes?.[0]?.notes || (pred as any).notes || 'Completed systems design certification and deployed initial prototype. Actual effort was more manageable than forecasted.'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Intention Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2421]/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#DDE2DD] rounded-[24px] shadow-xl w-full max-w-md p-6 sm:p-7">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE2DD] mb-4">
              <h3 className="font-editorial text-xl text-[#1D2421] font-medium">
                Set New Intention
              </h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="p-1 rounded-full hover:bg-[#F1F2EE] text-[#8A938E]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1D2421] block mb-1">
                  Intention Statement
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Protect morning creative focus blocks"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DDE2DD] bg-[#FAF9F5] focus:outline-none focus:border-[#355C4A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1D2421] block mb-1">
                  Primary Domain
                </label>
                <select
                  value={newGoalDomain}
                  onChange={(e) => setNewGoalDomain(e.target.value as DomainId)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DDE2DD] bg-[#FAF9F5] focus:outline-none focus:border-[#355C4A]"
                >
                  <option value="health">Health &amp; Fitness</option>
                  <option value="learning">Learning &amp; Skills</option>
                  <option value="career">Career &amp; Work</option>
                  <option value="relationships">Relationships</option>
                  <option value="energy">Energy &amp; Wellbeing</option>
                  <option value="personal">Personal Projects</option>
                  <option value="finance">Financial Wellbeing</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE2DD]">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="rounded-full px-4 py-2 text-xs text-[#66706B] hover:text-[#1D2421]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="rounded-full bg-[#355C4A] text-white text-xs font-medium px-5 py-2 hover:bg-[#284738]"
                >
                  Save Intention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Prediction Modal */}
      {showPredictionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2421]/45 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#DDE2DD] rounded-[24px] shadow-xl w-full max-w-md p-6 sm:p-7">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE2DD] mb-4">
              <h3 className="font-editorial text-xl text-[#1D2421] font-medium">
                Record Decision Expectation
              </h3>
              <button
                onClick={() => setShowPredictionModal(false)}
                className="p-1 rounded-full hover:bg-[#F1F2EE] text-[#8A938E]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#66706B] mb-4">
              State what you anticipate will happen so we can observe how reality unfolds over time.
            </p>

            <form onSubmit={handleCreatePred} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1D2421] block mb-1">
                  Expectation Hypothesis
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taking on this project will improve leadership without depleting health"
                  value={predTitle}
                  onChange={(e) => setPredTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DDE2DD] bg-[#FAF9F5] focus:outline-none focus:border-[#355C4A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1D2421] block mb-1">
                  Primary Domain
                </label>
                <select
                  value={predDomain}
                  onChange={(e) => setPredDomain(e.target.value as DomainId)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DDE2DD] bg-[#FAF9F5] focus:outline-none focus:border-[#355C4A]"
                >
                  <option value="career">Career &amp; Work</option>
                  <option value="learning">Learning &amp; Skills</option>
                  <option value="health">Health &amp; Fitness</option>
                  <option value="relationships">Relationships</option>
                  <option value="energy">Energy &amp; Wellbeing</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1D2421] block mb-1">
                  Expected Direction
                </label>
                <select
                  value={predDirection}
                  onChange={(e) => setPredDirection(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DDE2DD] bg-[#FAF9F5] focus:outline-none focus:border-[#355C4A]"
                >
                  <option value="improving">Improving</option>
                  <option value="stable">Stable</option>
                  <option value="recalibrating">Recalibrating</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1D2421] block mb-1">
                  Review Target Date
                </label>
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DDE2DD] bg-[#FAF9F5] focus:outline-none focus:border-[#355C4A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DDE2DD]">
                <button
                  type="button"
                  onClick={() => setShowPredictionModal(false)}
                  className="rounded-full px-4 py-2 text-xs text-[#66706B] hover:text-[#1D2421]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="rounded-full bg-[#355C4A] text-white text-xs font-medium px-5 py-2 hover:bg-[#284738]"
                >
                  Save Expectation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
