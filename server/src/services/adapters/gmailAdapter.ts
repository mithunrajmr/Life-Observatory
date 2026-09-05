import { google, gmail_v1 } from 'googleapis';
import crypto from 'crypto';
import { DomainId, LifeEvent } from '../../types';
import { getAuthenticatedOAuth2Client } from '../oauthService';
import { IDataSourceAdapter, SyncResult } from './baseAdapter';

export interface GmailMetadataRecord {
  id: string;
  threadId: string;
  internalDate: string; // Epoch ms string
  subjectSnippet?: string;
  labels: string[];
}

/**
 * Privacy-First Gmail Adapter:
 * Operates strictly with least-privilege `gmail.metadata` scope.
 * Never fetches or retains email message bodies.
 * Extracts:
 * - Communication intensity & frequency by time-of-day (e.g., late night email bursts)
 * - Workload pressure & communication cadence signals
 * - Category classification from thread labels and headers
 */
export class GmailAdapter implements IDataSourceAdapter {
  readonly provider = 'gmail' as const;
  readonly scopes = ['https://www.googleapis.com/auth/gmail.metadata'];

  async sync(uid: string, syncToken?: string | null): Promise<SyncResult> {
    const authClient = await getAuthenticatedOAuth2Client(uid, 'gmail');
    const gmail = google.gmail({ version: 'v1', auth: authClient as any });

    let messageSummaries: GmailMetadataRecord[] = [];
    let nextHistoryId: string | null = null;

    try {
      if (syncToken) {
        // Incremental sync using historyId
        try {
          const historyRes = await gmail.users.history.list({
            userId: 'me',
            startHistoryId: syncToken,
            historyTypes: ['messageAdded'],
            maxResults: 100,
          });

          const histories = historyRes.data.history || [];
          nextHistoryId = historyRes.data.historyId || syncToken;

          const addedMessageIds = new Set<string>();
          for (const h of histories) {
            if (h.messagesAdded) {
              for (const m of h.messagesAdded) {
                if (m.message?.id) addedMessageIds.add(m.message.id);
              }
            }
          }

          // Fetch metadata headers only
          for (const msgId of Array.from(addedMessageIds).slice(0, 50)) {
            try {
              const msg = await gmail.users.messages.get({
                userId: 'me',
                id: msgId,
                format: 'metadata',
                metadataHeaders: ['Subject', 'Date', 'From'],
              });

              messageSummaries.push({
                id: msg.data.id || msgId,
                threadId: msg.data.threadId || msgId,
                internalDate: msg.data.internalDate || Date.now().toString(),
                subjectSnippet: msg.data.snippet || undefined,
                labels: msg.data.labelIds || [],
              });
            } catch {
              // Ignore single message lookup error
            }
          }
        } catch (err: any) {
          if (err?.code === 404 || err?.message?.includes('historyId')) {
            console.warn(`[Gmail Sync] HistoryId invalid, falling back to recent sync for user ${uid}.`);
            return this.sync(uid, null);
          }
          throw err;
        }
      } else {
        // Initial sync: fetch recent message metadata without query (gmail.metadata scope does not allow 'q')
        const listRes = await gmail.users.messages.list({
          userId: 'me',
          maxResults: 60,
        });

        const profileRes = await gmail.users.getProfile({ userId: 'me' });
        nextHistoryId = profileRes.data.historyId || null;

        const thirtyDaysAgo = Date.now() - 30 * 86400000;
        const messages = listRes.data.messages || [];
        for (const m of messages.slice(0, 50)) {
          if (!m.id) continue;
          try {
            const msg = await gmail.users.messages.get({
              userId: 'me',
              id: m.id,
              format: 'metadata',
              metadataHeaders: ['Subject', 'Date', 'From'],
            });

            const internalTime = parseInt(msg.data.internalDate || `${Date.now()}`, 10);
            if (isNaN(internalTime) || internalTime >= thirtyDaysAgo) {
              messageSummaries.push({
                id: msg.data.id || m.id,
                threadId: msg.data.threadId || m.id,
                internalDate: msg.data.internalDate || Date.now().toString(),
                subjectSnippet: msg.data.snippet || undefined,
                labels: msg.data.labelIds || [],
              });
            }
          } catch {
            // Ignore individual fetch errors
          }
        }
      }
    } catch (err: any) {
      throw new Error(`Gmail metadata sync failed: ${err.message}`);
    }

    const events = this.normalizeToLifeEvents(uid, messageSummaries);

    return {
      events,
      itemCount: events.length,
      nextSyncToken: nextHistoryId,
      syncedAt: new Date().toISOString(),
    };
  }

  normalizeToLifeEvents(uid: string, records: GmailMetadataRecord[]): LifeEvent[] {
    if (records.length === 0) return [];

    // Group records by calendar day to extract daily communication rhythms
    const dayGroups = new Map<string, GmailMetadataRecord[]>();
    for (const r of records) {
      const epoch = parseInt(r.internalDate, 10);
      const d = isNaN(epoch) ? new Date() : new Date(epoch);
      const dayKey = d.toISOString().split('T')[0];
      if (!dayGroups.has(dayKey)) {
        dayGroups.set(dayKey, []);
      }
      dayGroups.get(dayKey)!.push(r);
    }

    const events: LifeEvent[] = [];

    for (const [dayKey, dayRecords] of dayGroups.entries()) {
      // Analyze off-hours activity (emails sent/received between 10 PM and 6 AM)
      let offHoursCount = 0;
      let workLabelCount = 0;
      let learningCount = 0;

      for (const rec of dayRecords) {
        const d = new Date(parseInt(rec.internalDate, 10));
        const hour = d.getHours();
        if (hour >= 22 || hour < 6) {
          offHoursCount++;
        }
        const text = (rec.subjectSnippet || '').toLowerCase();
        if (text.includes('sprint') || text.includes('review') || text.includes('project') || text.includes('client') || (rec.labels && rec.labels.includes('IMPORTANT'))) {
          workLabelCount++;
        }
        if (text.includes('course') || text.includes('newsletter') || text.includes('learning') || text.includes('digest')) {
          learningCount++;
        }
      }

      const totalCount = dayRecords.length;
      const domains: DomainId[] = [];
      if (workLabelCount > 0 || totalCount >= 5) domains.push('career');
      if (learningCount > 0) domains.push('learning');
      if (offHoursCount >= 2) domains.push('energy');
      if (domains.length === 0) domains.push('personal');

      const isHighIntensity = totalCount >= 15 || offHoursCount >= 3;
      const sentiment = offHoursCount >= 3 ? 'negative' : (learningCount > 0 ? 'positive' : 'neutral');
      const contentHash = crypto.createHash('sha256').update(`gmail_${dayKey}_${totalCount}_${offHoursCount}`).digest('hex');

      const summaryParts = [`Observed ${totalCount} communication interactions on this date.`];
      if (offHoursCount > 0) {
        summaryParts.push(`${offHoursCount} occurred during off-hours (late evening/early morning), affecting recovery time.`);
      }

      events.push({
        id: `gmail_${dayKey}`,
        userId: uid,
        type: 'activity',
        domainIds: domains,
        title: isHighIntensity ? 'High Communication Intensity & Cadence' : 'Normal Communication Activity',
        summary: summaryParts.join(' '),
        occurredAt: `${dayKey}T12:00:00.000Z`,
        createdAt: new Date().toISOString(),
        source: {
          type: 'gmail',
          ref: `gmail_${dayKey}`,
          externalId: `gmail_${dayKey}`,
        },
        confidence: 0.88,
        sentiment,
        intensity: isHighIntensity ? 4 : (totalCount >= 5 ? 3 : 2),
        isTurningPointCandidate: offHoursCount >= 4,
        contentHash,
        metadata: {
          totalCount,
          offHoursCount,
          isHighIntensity,
        },
      });
    }

    return events;
  }
}

/**
 * Test Fake Adapter:
 * For automated unit & integration testing.
 */
export class FakeGmailAdapter implements IDataSourceAdapter {
  readonly provider = 'gmail' as const;
  readonly scopes = ['https://www.googleapis.com/auth/gmail.metadata'];
  private fixtures: GmailMetadataRecord[] = [];

  constructor(fixtures?: GmailMetadataRecord[]) {
    if (fixtures) this.fixtures = fixtures;
  }

  setFixtures(fixtures: GmailMetadataRecord[]): void {
    this.fixtures = fixtures;
  }

  async sync(uid: string, _syncToken?: string | null): Promise<SyncResult> {
    const adapter = new GmailAdapter();
    const events = adapter.normalizeToLifeEvents(uid, this.fixtures);
    return {
      events,
      itemCount: events.length,
      nextSyncToken: 'fake_history_123',
      syncedAt: new Date().toISOString(),
    };
  }
}
