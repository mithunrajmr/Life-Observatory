import { GoogleCalendarAdapter } from './calendarAdapter';
import { GmailAdapter } from './adapters/gmailAdapter';
import { GoogleDriveAdapter } from './adapters/driveAdapter';
import { IDataSourceAdapter, SyncResult } from './adapters/baseAdapter';
import { SupportedProvider } from './oauthService';
import { getUserSubcollection, getServerCredentialsSubcollection } from './firebaseAdmin';
import { computeLifeHorizon } from './lifeModelEngine';
import { synthesizeProactiveInsights } from './insightEngine';
import { Connection, LifeSnapshot } from '../types';

export class IngestionPipeline {
  private adapters: Map<SupportedProvider, IDataSourceAdapter> = new Map();

  constructor() {
    this.adapters.set('google_calendar', new GoogleCalendarAdapter());
    this.adapters.set('gmail', new GmailAdapter());
    this.adapters.set('google_drive', new GoogleDriveAdapter());
  }

  /**
   * Allows injecting fake adapters during unit testing.
   */
  setAdapter(provider: SupportedProvider, adapter: IDataSourceAdapter): void {
    this.adapters.set(provider, adapter);
  }

  /**
   * Synchronizes a single provider for a user with error boundary isolation.
   */
  async syncProvider(
    uid: string,
    provider: SupportedProvider
  ): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`No adapter registered for provider: ${provider}`);
    }

    const connRef = getUserSubcollection(uid, 'connections').doc(provider);
    const syncCredRef = getServerCredentialsSubcollection(uid, 'sync').doc(provider);

    try {
      // Mark connection as syncing
      await connRef.set({ status: 'syncing' }, { merge: true });

      // Retrieve stored sync token
      const syncDoc = await syncCredRef.get();
      const lastSyncToken = syncDoc.data()?.syncToken || null;

      // Execute adapter sync
      const result: SyncResult = await adapter.sync(uid, lastSyncToken);

      // Persist normalized events into user's events subcollection
      const eventsCol = getUserSubcollection(uid, 'events');
      for (const ev of result.events) {
        await eventsCol.doc(ev.id).set(ev);
      }
      for (const delId of result.deletedEventIds || []) {
        await eventsCol.doc(delId).delete();
      }

      // Save new syncToken to server credentials
      if (result.nextSyncToken) {
        await syncCredRef.set({
          provider,
          syncToken: result.nextSyncToken,
          lastSyncedAt: result.syncedAt,
        }, { merge: true });
      }

      // Update public connection status
      const updatedConn: Partial<Connection> = {
        status: 'connected',
        lastSyncAt: result.syncedAt,
        itemCount: result.itemCount,
        lastError: null as any,
      };
      await connRef.set(updatedConn, { merge: true });

      return {
        success: true,
        syncedCount: result.events.length,
      };
    } catch (err: any) {
      console.error(`[Ingestion] Failed to sync ${provider} for user ${uid}:`, err.message);
      await connRef.set({
        status: 'sync_failed',
        lastError: err.message || 'Synchronization failed',
      }, { merge: true });

      return {
        success: false,
        syncedCount: 0,
        error: err.message,
      };
    }
  }

  /**
   * Synchronizes all connected providers for a user and updates the Life Horizon.
   */
  async syncAllConnected(
    uid: string
  ): Promise<{ results: Record<SupportedProvider, any>; snapshot: LifeSnapshot }> {
    const connectionsCol = getUserSubcollection(uid, 'connections');
    const snap = await connectionsCol.get();
    
    const results: Record<string, any> = {};

    for (const doc of snap.docs) {
      const conn = doc.data() as Connection;
      const provider = doc.id as SupportedProvider;
      if (conn.status === 'connected' && this.adapters.has(provider)) {
        results[provider] = await this.syncProvider(uid, provider);
      }
    }

    // Recalculate Life Horizon and synthesize real insights
    const snapshot = await computeLifeHorizon(uid);
    const insights = await synthesizeProactiveInsights(uid, snapshot);
    snapshot.insights = insights;

    return { results, snapshot };
  }
}

export const defaultIngestionPipeline = new IngestionPipeline();
