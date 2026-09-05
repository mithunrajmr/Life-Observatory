import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { Connection } from '../types';

export const ConnectionsSettings: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const res = await api.getConnections();
      setConnections(res.connections || []);
    } catch {
      // Ignored
    }
  };

  const handleCalendarSync = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const res = await api.syncGoogleCalendar();
      setStatusMessage(`Successfully observed ${res.syncedCount} calendar moments into your Life Horizon.`);
      await loadConnections();
    } catch (err: any) {
      setStatusMessage(err.message || 'Calendar observation failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteCalendarData = async () => {
    if (!window.confirm('Are you sure you want to remove derived Google Calendar observations? Your manual reflections will remain safe.')) {
      return;
    }

    try {
      await api.deleteConnectionData('google_calendar');
      setStatusMessage('Derived calendar observations have been deleted.');
      await loadConnections();
    } catch (err: any) {
      setStatusMessage(err.message || 'Deletion failed.');
    }
  };

  const handleDeleteAllData = async () => {
    const confirmation = window.prompt(
      'Permanent Erasure: Type "DELETE" to permanently erase your entire Life Observatory history, reflections, snapshots, and turning points:'
    );

    if (confirmation !== 'DELETE') return;

    try {
      await api.deleteAllUserData();
      alert('All your personal data has been erased.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to complete data erasure.');
    }
  };

  const calConn = connections.find(c => c.provider === 'google_calendar');
  const isConnected = calConn?.status === 'connected';

  return (
    <div className="space-y-12 animate-fade-in w-full mb-16">
      {/* Manifesto Masthead */}
      <section className="border-b border-[#DDE2DD] pb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#355C4A]" />
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#355C4A]">
            Architectural Guarantee &amp; Sovereignty
          </span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl text-[#1D2421] font-normal leading-tight">
          Your life belongs to you.
        </h1>
        <p className="text-[15px] text-[#66706B] font-light max-w-2xl mt-3 leading-relaxed">
          Life Observatory was engineered from inception as an intimate cognitive instrument, not an engagement platform. We extract high-level longitudinal momentum strictly to assist your self-awareness. Your narrative is never indexed for advertising and never used to train public models.
        </p>
      </section>

      {statusMessage && (
        <div className="p-4 bg-[#EDF7F2] border border-[#3E8064]/30 rounded-2xl text-xs text-[#355C4A] flex items-center gap-2.5 font-medium animate-fade-in">
          <CheckCircle2 size={16} className="text-[#3E8064] shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* The 3 Core Architectural Pillars — Editorial Grid */}
      <section>
        <h2 className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-[#8A938E] mb-4">
          Core Architectural Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="border-l-2 border-[#355C4A] pl-4 space-y-1.5">
            <h3 className="font-editorial text-base text-[#1D2421] font-medium">
              Zero Model Training
            </h3>
            <p className="text-xs text-[#66706B] leading-relaxed">
              Your written reflections and schedule details are processed ephemerally via Gemini on Cloud Run. They are never ingested into foundation model training datasets.
            </p>
          </div>

          <div className="border-l-2 border-[#C58A45] pl-4 space-y-1.5">
            <h3 className="font-editorial text-base text-[#1D2421] font-medium">
              Private Data Isolation
            </h3>
            <p className="text-xs text-[#66706B] leading-relaxed">
              All personal history is partitioned under your authenticated account in Cloud Firestore. No third-party data brokers or behavioral trackers exist in this stack.
            </p>
          </div>

          <div className="border-l-2 border-[#3E8064] pl-4 space-y-1.5">
            <h3 className="font-editorial text-base text-[#1D2421] font-medium">
              Unilateral Sovereignty
            </h3>
            <p className="text-xs text-[#66706B] leading-relaxed">
              You maintain total dominion over your history. Disconnect instruments at any time or execute a complete hard purge of your stored records in one step.
            </p>
          </div>
        </div>
      </section>

      {/* Connected Life Instruments */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4 border-b border-[#DDE2DD] pb-3">
          <div>
            <h2 className="font-editorial text-xl text-[#1D2421] font-medium">
              Connected Life Instruments
            </h2>
            <p className="text-xs text-[#66706B] mt-0.5">
              Sensors feeding behavioral signals into your longitudinal horizon.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[#8A938E]">
            2 instruments configured
          </span>
        </div>

        <div className="space-y-3">
          {/* Daily Reflections */}
          <div className="rounded-[18px] bg-[#FAF9F5] border border-[#DDE2DD] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#EFF3EE] text-[#355C4A] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-semibold text-sm text-[#1D2421]">
                    Personal Reflections
                  </h4>
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#355C4A] bg-[#EDF7F2] px-2 py-0.5 rounded-full">
                    Built-in
                  </span>
                </div>
                <p className="text-xs text-[#66706B] mt-1 leading-relaxed">
                  Reflective entries you compose in the daily prompt or journal. Only emotional intensity and domain themes are mapped to your horizon.
                </p>
              </div>
            </div>
            <span className="font-mono text-[11px] text-[#8A938E] self-start sm:self-auto shrink-0">
              Active Instrument
            </span>
          </div>

          {/* Google Calendar */}
          <div className="rounded-[18px] bg-[#FFFFFF] border border-[#DDE2DD] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-[#FAF3E8] text-[#C58A45] flex items-center justify-center shrink-0 mt-0.5">
                <Calendar size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-semibold text-sm text-[#1D2421]">
                    Google Calendar
                  </h4>
                  <span className={`font-mono text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isConnected ? 'text-[#3E8064] bg-[#EDF7F2]' : 'text-[#8A938E] bg-[#F1F2EE]'
                  }`}>
                    {isConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
                <p className="text-xs text-[#66706B] mt-1 leading-relaxed">
                  Read-only cadence extraction for focus blocks, workouts, and meetings to identify scheduling drift and recovery patterns.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={handleCalendarSync}
                disabled={isSyncing}
                className="rounded-full bg-[#355C4A] text-white text-xs font-medium px-4 py-2 hover:bg-[#284738] transition flex items-center gap-1.5 shadow-xs disabled:opacity-40"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Observing...' : 'Sync Now'}</span>
              </button>

              {isConnected && (
                <button
                  onClick={handleDeleteCalendarData}
                  className="rounded-full bg-[#FAF9F5] border border-[#DDE2DD] text-[#8A938E] hover:text-[#A95C58] text-xs font-medium px-3 py-2 transition"
                  title="Remove calendar observations"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sovereign Erasure Zone */}
      <section className="pt-6 border-t border-[#DDE2DD]">
        <div className="p-6 rounded-[22px] bg-[#FAF9F5] border border-[#DDE2DD] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-[#A95C58]" />
              <h3 className="font-editorial text-base text-[#1D2421] font-medium">
                Complete Personal Data Purge
              </h3>
            </div>
            <p className="text-xs text-[#66706B] leading-relaxed max-w-xl">
              Permanently and irreversibly erase your entire Life Observatory record from Cloud Firestore: all written reflections, turning points, longitudinal model snapshots, and companion dialogue.
            </p>
          </div>

          <button
            onClick={handleDeleteAllData}
            className="rounded-full border border-[#A95C58]/40 text-[#A95C58] hover:bg-[#A95C58] hover:text-white transition text-xs font-medium px-5 py-2.5 whitespace-nowrap self-start sm:self-auto shrink-0"
          >
            Erase All Personal Data
          </button>
        </div>
      </section>
    </div>
  );
};
