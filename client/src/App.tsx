import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { LifeHorizon } from './components/LifeHorizon';
import { InvisibleProgressCard } from './components/InvisibleProgressCard';
import { WhatChangedView } from './components/WhatChangedView';
import { DriftCard } from './components/DriftCard';
import { TurningPointsTimeline } from './components/TurningPointsTimeline';
import { PredictionTracker } from './components/PredictionTracker';
import { ReflectionInput } from './components/ReflectionInput';
import { CompanionChat } from './components/CompanionChat';
import { ConnectionsSettings } from './components/ConnectionsSettings';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithGoogle, 
  signInAsDemo, 
  signOutUser 
} from './services/firebase';
import { api } from './services/api';
import { LifeSnapshot, LifeInsight, TurningPoint, Goal, Prediction } from './types';
import { User } from 'firebase/auth';
import { Target, Plus } from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('observatory');
  const [snapshot, setSnapshot] = useState<LifeSnapshot | null>(null);
  const [insights, setInsights] = useState<LifeInsight[]>([]);
  const [turningPoints, setTurningPoints] = useState<TurningPoint[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Goal modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDomain, setGoalDomain] = useState('career');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadAllData();
      } else {
        // Automatically support local demo user if not logged in
        try {
          const demoUser = await signInAsDemo();
          setUser(demoUser);
          await loadAllData();
        } catch {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [horizonRes, insightsRes, tpRes, goalsRes, predsRes] = await Promise.all([
        api.getHorizon(12),
        api.getInsights(),
        api.getTurningPoints(),
        api.getGoals(),
        api.getPredictions(),
      ]);

      setSnapshot(horizonRes.snapshot);
      setInsights(insightsRes.insights || []);
      setTurningPoints(tpRes.turningPoints || []);
      setGoals(goalsRes.goals || []);
      setPredictions(predsRes.predictions || []);
    } catch (err: any) {
      console.warn('Initial data load warning:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshObservatory = async () => {
    try {
      const res = await api.recomputeHorizon(12);
      setSnapshot(res.snapshot);
      const insRes = await api.getInsights();
      setInsights(insRes.insights || []);
    } catch {
      // Ignored
    }
  };

  const handleUpdateTurningPointStatus = async (id: string, status: 'confirmed' | 'rejected') => {
    try {
      await api.updateTurningPoint(id, { status });
      setTurningPoints(prev => prev.map(tp => tp.id === id ? { ...tp, status } : tp));
    } catch (err: any) {
      alert(err.message || 'Failed to update turning point.');
    }
  };

  const handleCreatePrediction = async (predictionData: any) => {
    const res = await api.createPrediction(predictionData);
    setPredictions(prev => [res.prediction, ...prev]);
  };

  const handleRecordOutcome = async (predictionId: string, outcomeData: any) => {
    await api.recordOutcome(predictionId, outcomeData);
    setPredictions(prev => prev.map(p => p.id === predictionId ? { ...p, status: 'evaluated' } : p));
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    try {
      const res = await api.createGoal({
        title: goalTitle.trim(),
        domainId: goalDomain,
      });
      setGoals(prev => [res.goal, ...prev]);
      setGoalTitle('');
      setShowGoalModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save goal.');
    }
  };

  const invisibleProgressInsight = insights.find(i => i.type === 'invisible_progress') || null;
  const driftInsights = insights.filter(i => i.type === 'drift');

  return (
    <div className="min-h-screen bg-canvas text-slate-100 flex flex-col">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
      />

      <main className="flex-1 app-container">
        {isLoading && !snapshot && (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading your Life Observatory...</p>
          </div>
        )}

        {/* OBSERVATORY TAB (MAIN HERO) */}
        {currentTab === 'observatory' && (
          <div className="animate-fade-in">
            {/* Daily Reflection Input */}
            <ReflectionInput onReflectionProcessed={loadAllData} />

            {/* Proactive Highest Priority Insight: Invisible Progress */}
            <InvisibleProgressCard insight={invisibleProgressInsight} />

            {/* Goal Drift Notice (if detected) */}
            <DriftCard driftInsights={driftInsights} />

            {/* Central Defining Visualization: Life Horizon */}
            <LifeHorizon 
              snapshot={snapshot} 
              onSelectTurningPoint={() => setCurrentTab('timeline')} 
            />

            {/* What Changed? Period Transition */}
            <WhatChangedView 
              insights={insights} 
              onTriggerRecompute={handleRefreshObservatory} 
            />
          </div>
        )}

        {/* TALK TAB */}
        {currentTab === 'talk' && (
          <div className="animate-fade-in">
            <CompanionChat />
          </div>
        )}

        {/* TIMELINE TAB */}
        {currentTab === 'timeline' && (
          <div className="animate-fade-in">
            <TurningPointsTimeline 
              turningPoints={turningPoints}
              onUpdateStatus={handleUpdateTurningPointStatus}
            />
          </div>
        )}

        {/* INSIGHTS TAB */}
        {currentTab === 'insights' && (
          <div className="animate-fade-in space-y-6">
            <InvisibleProgressCard insight={invisibleProgressInsight} />
            <WhatChangedView 
              insights={insights} 
              onTriggerRecompute={handleRefreshObservatory} 
            />
            <DriftCard driftInsights={driftInsights} />
          </div>
        )}

        {/* GOALS & PREDICTIONS TAB */}
        {currentTab === 'goals' && (
          <div className="animate-fade-in space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-indigo-400" />
                  <h2 className="text-xl font-bold text-white">Stated Life Goals & Priorities</h2>
                </div>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="btn-primary text-xs"
                >
                  <Plus size={14} /> Add Goal
                </button>
              </div>

              {goals.length === 0 ? (
                <p className="text-xs text-slate-500">No active goals registered yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {goals.map(g => (
                    <div key={g.id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{g.title}</h4>
                        <span className="text-xs text-slate-400">Domain: {g.domainId}</span>
                      </div>
                      <span className="badge bg-indigo-500/20 text-indigo-300 text-[10px]">
                        {g.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <PredictionTracker
              predictions={predictions}
              onCreatePrediction={handleCreatePrediction}
              onRecordOutcome={handleRecordOutcome}
            />
          </div>
        )}

        {/* CONNECTIONS & PRIVACY TAB */}
        {currentTab === 'connections' && (
          <div className="animate-fade-in">
            <ConnectionsSettings />
          </div>
        )}

        {/* Add Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="card w-full max-w-md animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-4">Set Stated Life Goal</h3>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Goal Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Consistent 3x weekly workout routine"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Domain</label>
                  <select
                    value={goalDomain}
                    onChange={(e) => setGoalDomain(e.target.value)}
                    className="w-full text-sm"
                  >
                    <option value="career">Career & Work</option>
                    <option value="learning">Learning & Skills</option>
                    <option value="health">Health & Fitness</option>
                    <option value="relationships">Relationships</option>
                    <option value="energy">Energy & Wellbeing</option>
                    <option value="personal">Personal Projects</option>
                    <option value="finance">Financial Wellbeing</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs">
                    Save Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <p>Life Observatory • Private, longitudinal self-reflection model powered by Gemini on Cloud Run.</p>
        <p className="mt-1 text-[11px] text-slate-600">Built for Google Cloud Run AI Hackathon • #AccelerateAIwithCloudRun</p>
      </footer>
    </div>
  );
};
