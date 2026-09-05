import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Mail, 
  HardDrive, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ExternalLink,
  Trash2,
  PowerOff
} from 'lucide-react';
import { api } from '../services/api';
import { Connection } from '../types';

interface InstrumentConfig {
  provider: 'google_calendar' | 'gmail' | 'google_drive';
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  scopeSummary: string;
  privacyGuarantee: string;
}

const INSTRUMENTS: InstrumentConfig[] = [
  {
    provider: 'google_calendar',
    title: 'Google Calendar',
    icon: <Calendar size={16} />,
    color: '#C58A45',
    bgColor: '#FAF3E8',
    scopeSummary: 'Read-only calendar schedule',
    privacyGuarantee: 'Observes event duration, meeting density, and restorative blocks. Never modifies your calendar.',
  },
  {
    provider: 'gmail',
    title: 'Gmail Communication Signals',
    icon: <Mail size={16} />,
    color: '#3A5A78',
    bgColor: '#EDF3F8',
    scopeSummary: 'Metadata-only (header timestamps & labels)',
    privacyGuarantee: 'Extracts communication volume and off-hours messaging cadence. Email body contents are NEVER accessed or stored.',
  },
  {
    provider: 'google_drive',
    title: 'Google Drive Deep Work Signals',
    icon: <HardDrive size={16} />,
    color: '#355C4A',
    bgColor: '#EFF3EE',
    scopeSummary: 'Metadata-only (file modified timestamps)',
    privacyGuarantee: 'Detects active document creation & project writing sessions. File contents are NEVER downloaded or read.',
  },
];

export const ConnectionsSettings: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({});
  const [connectingMap, setConnectingMap] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();

    // Listen for OAuth completion messages from popup window
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        if (event.data.code && event.data.state) {
          try {
            setStatusMessage('Completing initial sync…');
            const res = await api.exchangeOAuthCode(event.data.code, event.data.state);
            setStatusMessage(`Successfully connected ${res.provider}! Observed ${res.syncedCount} signals.`);
            await loadConnections();
          } catch (err: any) {
            setErrorMessage(err.message || 'OAuth exchange failed.');
          } finally {
            setConnectingMap({});
          }
        } else {
          setStatusMessage(`Successfully connected ${event.data.provider || 'Google Workspace'}! Signals synchronized.`);
          await loadConnections();
          setConnectingMap({});
        }
      } else if (event.data?.type === 'GOOGLE_OAUTH_ERROR') {
        setErrorMessage(`OAuth authorization cancelled or failed: ${event.data.error}`);
        setConnectingMap({});
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadConnections = async () => {
    try {
      const res = await api.getConnections();
      setConnections(res.connections || []);
    } catch {
      // Ignored
    }
  };

  const handleConnect = async (provider: string) => {
    setConnectingMap(prev => ({ ...prev, [provider]: true }));
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.getOAuthUrl(provider);
      // Open popup for user consent
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        res.url,
        `Connect_${provider}`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      if (!popup) {
        // If popup blocker intervened, fallback to full page redirect
        window.location.href = res.url;
      } else {
        const timer = setInterval(async () => {
          if (popup.closed) {
            clearInterval(timer);
            setTimeout(async () => {
              await loadConnections();
              setConnectingMap(prev => ({ ...prev, [provider]: false }));
            }, 800);
          }
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate OAuth flow.');
      setConnectingMap(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSync = async (provider: string) => {
    setSyncingMap(prev => ({ ...prev, [provider]: true }));
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.syncProvider(provider);
      setStatusMessage(`Synced ${res.syncedCount} observation${res.syncedCount === 1 ? '' : 's'} from ${provider}.`);
      await loadConnections();
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to sync ${provider}.`);
    } finally {
      setSyncingMap(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (!window.confirm(`Disconnect ${provider}? This will stop future observations from this source.`)) {
      return;
    }

    try {
      await api.disconnectProvider(provider);
      setStatusMessage(`Disconnected ${provider}.`);
      await loadConnections();
    } catch (err: any) {
      setErrorMessage(err.message || 'Disconnection failed.');
    }
  };

  const handleDeleteData = async (provider: string) => {
    if (!window.confirm(`Permanently remove derived observations from ${provider}? Your manual reflections remain safe.`)) {
      return;
    }

    try {
      const res = await api.deleteConnectionData(provider);
      setStatusMessage(res.message);
      await loadConnections();
    } catch (err: any) {
      setErrorMessage(err.message || 'Deletion failed.');
    }
  };

  const handleDeleteAllData = async () => {
    const confirmation = window.prompt(
      'Permanent Erasure: Type "DELETE" to permanently erase your entire Life Observatory record (all reflections, turning points, longitudinal model snapshots, companion history, and credentials):'
    );

    if (confirmation !== 'DELETE') return;

    try {
      await api.deleteAllUserData();
      alert('All personal data has been permanently erased.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to complete data erasure.');
    }
  };

  const getConnRecord = (prov: string) => connections.find(c => c.provider === prov);

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
          Life Observatory is an intimate cognitive instrument, not an engagement platform. We observe high-level longitudinal momentum strictly for your self-awareness. Your narrative is never indexed for advertising, never sold, and never used to train foundation models.
        </p>
      </section>

      {statusMessage && (
        <div className="p-4 bg-[#EDF7F2] border border-[#3E8064]/30 rounded-2xl text-xs text-[#355C4A] flex items-center gap-2.5 font-medium animate-fade-in">
          <CheckCircle2 size={16} className="text-[#3E8064] shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-[#FAF0F0] border border-[#A95C58]/30 rounded-2xl text-xs text-[#A95C58] flex items-center gap-2.5 font-medium animate-fade-in">
          <AlertTriangle size={16} className="text-[#A95C58] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Core Architectural Principles */}
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
              Reflections and activity signals are processed ephemerally via Gemini. They are never ingested into foundation model training datasets.
            </p>
          </div>

          <div className="border-l-2 border-[#C58A45] pl-4 space-y-1.5">
            <h3 className="font-editorial text-base text-[#1D2421] font-medium">
              Metadata-First Privacy
            </h3>
            <p className="text-xs text-[#66706B] leading-relaxed">
              Workspace integrations observe cadence and timestamps. Email body text and document contents are strictly excluded from storage.
            </p>
          </div>

          <div className="border-l-2 border-[#3E8064] pl-4 space-y-1.5">
            <h3 className="font-editorial text-base text-[#1D2421] font-medium">
              Unilateral Sovereignty
            </h3>
            <p className="text-xs text-[#66706B] leading-relaxed">
              You maintain total dominion over your data. Disconnect instruments anytime or execute a permanent hard purge of your records in one step.
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
            {connections.filter(c => c.status === 'connected').length + 1} active
          </span>
        </div>

        <div className="space-y-3">
          {/* Instrument 1: Personal Reflections */}
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
                  Reflective entries you compose in the daily prompt or journal. Only emotional intensity, domain themes, and candidate events are mapped to your horizon.
                </p>
              </div>
            </div>
            <span className="font-mono text-[11px] text-[#355C4A] self-start sm:self-auto shrink-0 font-medium">
              Active Instrument
            </span>
          </div>

          {/* Instrument 2, 3, 4: Google Calendar, Gmail, Google Drive */}
          {INSTRUMENTS.map(inst => {
            const conn = getConnRecord(inst.provider);
            const isConnected = conn?.status === 'connected';
            const isSyncing = syncingMap[inst.provider] || conn?.status === 'syncing';
            const isConnecting = connectingMap[inst.provider];

            return (
              <div 
                key={inst.provider}
                className="rounded-[18px] bg-[#FFFFFF] border border-[#DDE2DD] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-[#C4CCC3]"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: inst.bgColor, color: inst.color }}
                  >
                    {inst.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading font-semibold text-sm text-[#1D2421]">
                        {inst.title}
                      </h4>
                      <span className={`font-mono text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isConnected 
                          ? 'text-[#3E8064] bg-[#EDF7F2]' 
                          : conn?.status === 'sync_failed'
                          ? 'text-[#A95C58] bg-[#FAF0F0]'
                          : 'text-[#8A938E] bg-[#F1F2EE]'
                      }`}>
                        {isConnected ? 'Connected' : (conn?.status === 'sync_failed' ? 'Sync Issue' : 'Disconnected')}
                      </span>
                      {conn?.itemCount !== undefined && conn.itemCount > 0 && (
                        <span className="font-mono text-[9.5px] text-[#8A938E]">
                          · {conn.itemCount} observations
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#66706B] mt-1 leading-relaxed">
                      {inst.privacyGuarantee}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10.5px] text-[#8A938E] font-mono">
                      <Lock size={11} className="text-[#355C4A]" />
                      <span>{inst.scopeSummary}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                  {!isConnected ? (
                    <button
                      onClick={() => handleConnect(inst.provider)}
                      disabled={isConnecting}
                      className="rounded-full bg-[#355C4A] text-white text-xs font-medium px-4 py-2 hover:bg-[#284738] transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <ExternalLink size={12} />
                      <span>{isConnecting ? 'Connecting…' : 'Connect with Google'}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSync(inst.provider)}
                        disabled={isSyncing}
                        className="rounded-full bg-[#FAF9F5] border border-[#DDE2DD] text-[#1D2421] hover:bg-[#F1F2EE] text-xs font-medium px-3.5 py-2 transition flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <RefreshCw size={12} className={isSyncing ? 'animate-spin text-[#355C4A]' : ''} />
                        <span>{isSyncing ? 'Observing…' : 'Sync'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteData(inst.provider)}
                        className="rounded-full bg-[#FAF9F5] border border-[#DDE2DD] text-[#8A938E] hover:text-[#A95C58] text-xs font-medium px-3 py-2 transition"
                        title="Delete derived data from this source"
                      >
                        <Trash2 size={12} />
                      </button>

                      <button
                        onClick={() => handleDisconnect(inst.provider)}
                        className="rounded-full bg-[#FAF9F5] border border-[#DDE2DD] text-[#8A938E] hover:text-[#A95C58] text-xs font-medium px-3 py-2 transition"
                        title="Disconnect source"
                      >
                        <PowerOff size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
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
              Permanently and irreversibly erase your entire Life Observatory record from Cloud Firestore: all reflections, turning points, longitudinal model snapshots, companion history, and connected OAuth credentials.
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
