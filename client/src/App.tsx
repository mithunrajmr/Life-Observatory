import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InvisibleProgressCard } from './components/InvisibleProgressCard';
import { LifeHorizon } from './components/LifeHorizon';
import { WhatChangedView } from './components/WhatChangedView';
import { TurningPointsTimeline } from './components/TurningPointsTimeline';
import { UpcomingPossibilities } from './components/UpcomingPossibilities';
import { ReflectionInput } from './components/ReflectionInput';
import { RecentReflections } from './components/RecentReflections';
import { CompanionWidgetCard } from './components/CompanionWidgetCard';
import { CompanionChat } from './components/CompanionChat';
import { PredictionTracker } from './components/PredictionTracker';
import { ConnectionsSettings } from './components/ConnectionsSettings';
import { LandingView } from './components/LandingView';
import { JournalView } from './components/JournalView';
import { FirstRunOnboarding } from './components/FirstRunOnboarding';
import { TabType } from './components/Navbar';
import { 
  auth, 
  onAuthStateChanged, 
  getRedirectResult,
  signInWithGoogle,
  signInAsDemo, 
  signOutUser 
} from './services/firebase';
import { api } from './services/api';
import { LifeSnapshot, LifeInsight, TurningPoint, Goal, Prediction, Connection } from './types';
import { User } from 'firebase/auth';
import { Telescope, MessageSquare, GitCommit, Sparkles, BookOpen } from 'lucide-react';
import brandLogo from './assets/logo.png';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('observatory');
  const [snapshot, setSnapshot] = useState<LifeSnapshot | null>(null);
  const [insights, setInsights] = useState<LifeInsight[]>([]);
  const [turningPoints, setTurningPoints] = useState<TurningPoint[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Process Direct Google OAuth callback return parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth_token');
    const authEmail = urlParams.get('email');
    const authName = urlParams.get('name');
    const authPic = urlParams.get('picture');
    const authUid = urlParams.get('uid');
    const authErr = urlParams.get('auth_error');

    if (authErr) {
      setAuthError(authErr);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (authToken && authUid) {
      const realUser: any = {
        uid: authUid,
        email: authEmail || '',
        displayName: authName || authEmail || 'Observer',
        photoURL: authPic || null,
        getIdToken: async () => authToken,
      };
      localStorage.setItem('life_observatory_auth_token', authToken);
      localStorage.setItem('life_observatory_real_user', JSON.stringify(realUser));
      setUser(realUser);
      setAuthError(null);
      window.history.replaceState({}, document.title, window.location.pathname);
      loadAllData();
      return;
    }

    // Check for stored real user session
    const storedRealUser = localStorage.getItem('life_observatory_real_user');
    const storedToken = localStorage.getItem('life_observatory_auth_token');
    if (storedRealUser && storedToken) {
      try {
        const parsed = JSON.parse(storedRealUser);
        parsed.getIdToken = async () => storedToken;
        setUser(parsed);
        setAuthError(null);
        loadAllData();
        return;
      } catch {}
    }

    // 2. Process Google Sign-In redirect result if browser used Firebase redirect flow
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          setAuthError(null);
          loadAllData();
        }
      })
      .catch((err) => {
        console.warn('Firebase redirect sign-in note:', err.message);
      });

    // 3. Observer for Firebase user session
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthError(null);
        // Check for redirect OAuth return for Workspace integrations
        const currentParams = new URLSearchParams(window.location.search);
        const redirectCode = currentParams.get('oauth_code');
        const redirectState = currentParams.get('oauth_state');
        if (redirectCode && redirectState) {
          window.history.replaceState({}, document.title, window.location.pathname);
          try {
            await api.exchangeOAuthCode(redirectCode, redirectState);
          } catch (err) {
            console.error('Redirect OAuth exchange failed:', err);
          }
        }
        await loadAllData();
      } else {
        // Only set user to null if there is no direct Google OAuth session
        if (!localStorage.getItem('life_observatory_auth_token')) {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    sessionStorage.removeItem('life_observatory_signed_out');
    localStorage.removeItem('life_observatory_demo_user');
    setAuthError(null);

    // 1. First attempt Firebase Google Sign-In popup if credentials are active
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        setUser(fbUser);
        await loadAllData();
        return;
      }
    } catch (popupErr: any) {
      console.warn('Firebase popup sign-in did not complete:', popupErr?.code || popupErr?.message);
    }

    // 2. Check if backend OAuth is responsive
    try {
      const healthCheck = await fetch('/api/health').catch(() => null);
      if (healthCheck && healthCheck.ok) {
        window.location.href = '/api/auth/google';
        return;
      }
    } catch {
      // Backend not running locally
    }

    // 3. Graceful fallback for local development & preview: seamlessly log in to explore demo
    console.info('Local preview mode: Entering authenticated Life Observatory session...');
    handleDemoSignIn();
  };

  const handleSignInRedirect = () => {
    handleSignIn();
  };

  const handleDemoSignIn = async () => {
    sessionStorage.removeItem('life_observatory_signed_out');
    localStorage.removeItem('life_observatory_auth_token');
    localStorage.removeItem('life_observatory_real_user');
    setIsLoading(true);
    try {
      const demo = await signInAsDemo();
      setUser(demo);
      await loadAllData();
    } catch {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    sessionStorage.setItem('life_observatory_signed_out', 'true');
    localStorage.removeItem('life_observatory_auth_token');
    localStorage.removeItem('life_observatory_real_user');
    localStorage.removeItem('life_observatory_demo_user');
    await signOutUser();
    setUser(null);
    setSnapshot(null);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [horizonRes, insightsRes, tpRes, goalsRes, predsRes, connRes] = await Promise.all([
        api.getHorizon(12),
        api.getInsights(),
        api.getTurningPoints(),
        api.getGoals(),
        api.getPredictions(),
        api.getConnections().catch(() => ({ connections: [] })),
      ]);

      setSnapshot(horizonRes.snapshot);
      setInsights(insightsRes.insights || []);
      setTurningPoints(tpRes.turningPoints || []);
      setGoals(goalsRes.goals || []);
      setPredictions(predsRes.predictions || []);
      setConnections(connRes.connections || []);
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

  const handleCreateGoal = async (title: string, domainId: string) => {
    // Check local duplication first
    const isDup = goals.some(g => g.title.toLowerCase().trim() === title.toLowerCase().trim());
    if (isDup) return;

    try {
      const res = await api.createGoal({ title, domainId });
      setGoals(prev => [res.goal, ...prev.filter(g => g.id !== res.goal.id)]);
    } catch (err: any) {
      console.error('Save goal failed:', err.message);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await api.deleteGoal(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err: any) {
      console.error('Delete goal failed:', err.message);
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

  const handleQuickAsk = (question: string) => {
    setInitialChatPrompt(question);
    setCurrentTab('talk');
  };

  const invisibleProgressInsight = insights.find(i => i.type === 'invisible_progress') || null;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1D2421] flex flex-col font-body antialiased">
      {!user ? (
        <main className="flex-1">
          <LandingView 
            onSignIn={handleSignIn} 
            onSignInRedirect={handleSignInRedirect}
            onExploreDemo={handleDemoSignIn} 
            authError={authError}
          />
        </main>
      ) : (
        <div className="flex-1 flex">
          {/* Desktop Left Sidebar */}
          <div className="hidden md:block shrink-0 sticky top-0 h-screen z-20">
            <Sidebar 
              currentTab={currentTab} 
              onSelectTab={setCurrentTab}
              onOpenCheckIn={() => {
                setCurrentTab('observatory');
                const el = document.querySelector('section[aria-label="Daily Check-in"]');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            />
          </div>

          {/* Mobile Sidebar Overlay Drawer */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-xs" 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
              <div className="relative z-10 w-72 h-full">
                <Sidebar 
                  currentTab={currentTab} 
                  onSelectTab={setCurrentTab}
                  onCloseMobile={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Main Layout Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header
              user={user}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
              onOpenSettings={() => setCurrentTab('connections')}
              onQuickAsk={handleQuickAsk}
              onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
              isMobileMenuOpen={isMobileMenuOpen}
            />

            <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto pb-24 md:pb-12">
              <FirstRunOnboarding
                onNavigateToConnections={() => setCurrentTab('connections')}
                hasActiveConnections={connections.some(c => c.status === 'connected')}
              />
              {isLoading && !snapshot && (
                <div className="py-24 text-center text-[#66706B] flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-12 h-12 mb-3 rounded-2xl bg-[#FFFFFF] border border-[#DDE2DD] shadow-xs p-2 flex items-center justify-center animate-pulse">
                    <img src={brandLogo} alt="Life Observatory" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-5 h-5 mb-2 border-2 border-[#355C4A] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-heading font-medium text-[#1D2421]">Opening Life Observatory…</p>
                  <p className="text-[11px] text-[#8A938E] mt-0.5">Calibrating your longitudinal horizon</p>
                </div>
              )}

              {/* OBSERVATORY — the daily vantage point */}
              {currentTab === 'observatory' && (
                <div className="animate-fade-in space-y-12">
                  {/* 1. NOTICE & UNDERSTAND: The primary discovery hero */}
                  <InvisibleProgressCard insight={invisibleProgressInsight} />

                  {/* 2. SEE THE EVIDENCE: The longitudinal evidence substrate */}
                  <div className="pt-2">
                    <LifeHorizon
                      snapshot={snapshot}
                      onSelectTurningPoint={() => setCurrentTab('timeline')}
                      isLoading={isLoading && !snapshot}
                      onRetry={loadAllData}
                    />
                  </div>

                  <hr className="editorial-rule" />

                  {/* 3. REFLECT: The daily integration loop */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 space-y-8">
                      <ReflectionInput onReflectionProcessed={loadAllData} />
                      <TurningPointsTimeline
                        turningPoints={turningPoints}
                        compact={true}
                        onExploreMore={() => setCurrentTab('timeline')}
                      />
                    </div>
                    <div className="lg:col-span-5 space-y-8">
                      <RecentReflections onViewAll={() => setCurrentTab('journal')} />
                      <CompanionWidgetCard onStartConversation={() => setCurrentTab('talk')} />
                    </div>
                  </div>
                </div>
              )}

              {/* TALK TAB */}
              {currentTab === 'talk' && (
                <div className="animate-fade-in max-w-5xl mx-auto">
                  <CompanionChat initialPrompt={initialChatPrompt} />
                </div>
              )}

              {/* TIMELINE TAB */}
              {currentTab === 'timeline' && (
                <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
                  <header>
                    <span className="editorial-eyebrow">The longitudinal arc</span>
                    <h1 className="font-editorial text-3xl sm:text-[2.5rem] font-medium leading-[1.1] tracking-[-0.02em] text-[#1D2421] mt-2">
                      Turning points &amp; milestones
                    </h1>
                    <p className="text-[15px] text-[#66706B] leading-relaxed max-w-xl mt-3">
                      The inflection points where small, compounding efforts became visible shifts in your trajectory.
                    </p>
                  </header>
                  <hr className="editorial-rule" />
                  <TurningPointsTimeline
                    turningPoints={turningPoints}
                    compact={false}
                  />
                </div>
              )}

              {/* INSIGHTS TAB — the deep read, distinct from Home */}
              {currentTab === 'insights' && (
                <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
                  <header>
                    <span className="editorial-eyebrow">Observatory findings</span>
                    <h1 className="font-editorial text-3xl sm:text-[2.5rem] font-medium leading-[1.1] tracking-[-0.02em] text-[#1D2421] mt-2">
                      What changed, and why it matters
                    </h1>
                    <p className="text-[15px] text-[#66706B] leading-relaxed max-w-xl mt-3">
                      A closer read of the shifts beneath your trajectory — how each domain moved between periods, and where new momentum is forming.
                    </p>
                  </header>
                  <hr className="editorial-rule" />
                  <WhatChangedView
                    insights={insights}
                    onTriggerRecompute={handleRefreshObservatory}
                  />
                  <UpcomingPossibilities 
                    goals={goals}
                    predictions={predictions}
                    insights={insights}
                    onExploreSuggestions={() => setCurrentTab('goals')} 
                  />
                </div>
              )}

              {/* GOALS & FOCUS TAB */}
              {currentTab === 'goals' && (
                <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
                  <header>
                    <span className="editorial-eyebrow">The intentional horizon</span>
                    <h1 className="font-editorial text-3xl sm:text-[2.5rem] font-medium leading-[1.1] tracking-[-0.02em] text-[#1D2421] mt-2">
                      Goals &amp; predictions
                    </h1>
                    <p className="text-[15px] text-[#66706B] leading-relaxed max-w-xl mt-3">
                      Form gentle hypotheses about your future self, then test your self-perception against what actually unfolds.
                    </p>
                  </header>
                  <hr className="editorial-rule" />
                  <PredictionTracker
                    predictions={predictions}
                    goals={goals}
                    onCreateGoal={handleCreateGoal}
                    onDeleteGoal={handleDeleteGoal}
                    onCreatePrediction={handleCreatePrediction}
                    onRecordOutcome={handleRecordOutcome}
                  />
                </div>
              )}

              {/* CONNECTIONS & PRIVACY TAB */}
              {currentTab === 'connections' && (
                <div className="animate-fade-in max-w-5xl mx-auto">
                  <ConnectionsSettings />
                </div>
              )}

              {/* JOURNAL TAB */}
              {currentTab === 'journal' && (
                <div className="animate-fade-in max-w-5xl mx-auto">
                  <JournalView onReflectionProcessed={loadAllData} />
                </div>
              )}
            </main>

            {/* Mobile Bottom Navigation — five primary destinations; Goals & Privacy live in the drawer */}
            {user && (
              <nav
                className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#DDE2DD] md:hidden px-1 py-1.5 flex items-center justify-around"
                aria-label="Primary"
              >
                {([
                  { id: 'observatory', label: 'Observatory', icon: Telescope },
                  { id: 'journal', label: 'Journal', icon: BookOpen },
                  { id: 'timeline', label: 'Timeline', icon: GitCommit },
                  { id: 'insights', label: 'Insights', icon: Sparkles },
                  { id: 'talk', label: 'Companion', icon: MessageSquare },
                ] as Array<{ id: TabType; label: string; icon: typeof Telescope }>).map((item) => {
                  const Icon = item.icon;
                  const active = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentTab(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex flex-col items-center gap-1 flex-1 min-w-0 py-1.5 rounded-lg text-[9.5px] font-heading transition ${
                        active ? 'text-[#355C4A] font-semibold' : 'text-[#8A938E]'
                      }`}
                    >
                      <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                      <span className="truncate max-w-full">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Footer */}
            <footer className="border-t border-[#DDE2DD]/60 py-6 px-4 text-center text-xs text-[#8A938E]">
              <p>Life Observatory • Private, longitudinal self-reflection model powered by Gemini on Cloud Run.</p>
              <p className="mt-1 text-[11px] text-[#8A938E]/80">Making gradual change visible — your patterns, progress, and turning points over time.</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
