import React, { useState, useEffect } from 'react';
import { Calendar, ShieldAlert, Trash2, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
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
      setStatusMessage(`Successfully synced ${res.syncedCount} calendar events into Life Horizon.`);
      await loadConnections();
    } catch (err: any) {
      setStatusMessage(err.message || 'Calendar sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteCalendarData = async () => {
    if (!window.confirm('Are you sure you want to delete derived Google Calendar events? Manual reflections will be preserved.')) {
      return;
    }

    try {
      await api.deleteConnectionData('google_calendar');
      setStatusMessage('Google Calendar derived records successfully deleted.');
      await loadConnections();
    } catch (err: any) {
      setStatusMessage(err.message || 'Deletion failed.');
    }
  };

  const handleDeleteAllData = async () => {
    const confirmation = window.prompt(
      'DANGER: This will permanently delete your entire Life Observatory database, all reflections, snapshots, goals, and insights. Type "DELETE" to confirm:'
    );

    if (confirmation !== 'DELETE') return;

    try {
      await api.deleteAllUserData();
      alert('All your data has been permanently deleted from Life Observatory.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to complete complete data erasure.');
    }
  };

  const calConn = connections.find(c => c.provider === 'google_calendar');
  const isConnected = calConn?.status === 'connected';

  return (
    <div className="space-y-6 mb-8">
      {/* Privacy Notice Card */}
      <div className="card border-indigo-500/20 bg-slate-900/50">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 mt-1">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Your Privacy & Connected Data</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Life Observatory uses user-authorized data strictly to calculate your longitudinal life model.
              Raw calendar entries and reflections are extracted into structured events and isolated to your verified Firebase UID.
              We never sell your data or train external public models on your personal reflections.
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-indigo-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Data Sources Grid */}
      <div className="card">
        <h3 className="text-base font-bold text-white mb-4">Data Source Connections</h3>

        <div className="space-y-4">
          {/* Daily Reflections (Built-in) */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Daily Reflections</h4>
                <p className="text-xs text-slate-400">Natural-language notes and check-ins</p>
              </div>
            </div>
            <span className="badge bg-teal-500/20 text-teal-300">
              Active / Always On
            </span>
          </div>

          {/* Google Calendar */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Google Calendar</h4>
                  {isConnected && (
                    <span className="badge bg-emerald-500/20 text-emerald-300 text-[10px]">
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Read-only access to meetings, workouts, and learning events to observe schedule consistency.
                </p>
                {calConn?.lastSyncAt && (
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Last synced: {new Date(calConn.lastSyncAt).toLocaleString()} ({calConn.itemCount} items)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleCalendarSync}
                disabled={isSyncing}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Calendar'}</span>
              </button>

              {isConnected && (
                <button
                  onClick={handleDeleteCalendarData}
                  className="btn-secondary text-xs py-1.5 px-3 text-slate-400 hover:text-red-300"
                  title="Delete calendar-derived events without deleting reflections"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Complete Data Erasure */}
      <div className="card border-red-900/40 bg-red-950/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-400 mb-1 font-bold text-sm">
              <ShieldAlert size={18} />
              <span>Right to Erasure & Complete Account Data Deletion</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Permanently delete all your reflections, life events, conversation history, goals, turning points, and generated snapshots from Cloud Firestore. This operation cannot be undone.
            </p>
          </div>

          <button
            onClick={handleDeleteAllData}
            className="btn-danger text-xs whitespace-nowrap self-start"
          >
            Delete All My Data
          </button>
        </div>
      </div>
    </div>
  );
};
