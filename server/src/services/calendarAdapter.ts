import { google, calendar_v3 } from 'googleapis';
import crypto from 'crypto';
import { DomainId, LifeEvent } from '../types';
import { getAuthenticatedOAuth2Client } from './oauthService';
import { IDataSourceAdapter, SyncResult } from './adapters/baseAdapter';

export interface CalendarRawEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

export interface ICalendarAdapter extends IDataSourceAdapter {
  fetchRecentEvents(uid: string, accessToken?: string): Promise<CalendarRawEvent[]>;
  normalizeToLifeEvents(uid: string, rawEvents: CalendarRawEvent[]): LifeEvent[];
}

/**
 * Production Google Calendar Adapter:
 * Uses Google Calendar API v3 with OAuth2Client to fetch and normalize user calendar events.
 * Supports native incremental synchronization via syncToken.
 */
export class GoogleCalendarAdapter implements ICalendarAdapter {
  readonly provider = 'google_calendar' as const;
  readonly scopes = ['https://www.googleapis.com/auth/calendar.readonly'];

  /**
   * Performs an initial or incremental synchronization of user events.
   */
  async sync(uid: string, syncToken?: string | null): Promise<SyncResult> {
    const authClient = await getAuthenticatedOAuth2Client(uid, 'google_calendar');
    const calendar = google.calendar({ version: 'v3', auth: authClient as any });

    let items: calendar_v3.Schema$Event[] = [];
    let nextSyncToken: string | undefined | null = null;
    let pageToken: string | undefined = undefined;

    try {
      if (syncToken) {
        // Incremental sync using syncToken
        do {
          const res: any = await calendar.events.list({
            calendarId: 'primary',
            syncToken,
            pageToken,
            maxResults: 250,
            singleEvents: true,
          });
          if (res.data.items) {
            items.push(...res.data.items);
          }
          pageToken = res.data.nextPageToken || undefined;
          nextSyncToken = res.data.nextSyncToken;
        } while (pageToken);
      } else {
        // Initial sync: fetch last 90 days of events
        const timeMin = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
        do {
          const res: any = await calendar.events.list({
            calendarId: 'primary',
            timeMin,
            pageToken,
            maxResults: 250,
            singleEvents: true,
            orderBy: 'startTime',
          });
          if (res.data.items) {
            items.push(...res.data.items);
          }
          pageToken = res.data.nextPageToken || undefined;
          nextSyncToken = res.data.nextSyncToken;
        } while (pageToken);
      }
    } catch (err: any) {
      // If sync token is invalid/expired (HTTP 410 Gone), reset and do full sync
      if (err?.code === 410 || (err?.message && err.message.includes('Sync token is no longer valid'))) {
        console.warn(`[Calendar Sync] Sync token expired for user ${uid}, performing full sync.`);
        return this.sync(uid, null);
      }
      throw new Error(`Google Calendar sync failed: ${err.message}`);
    }

    const rawEvents: CalendarRawEvent[] = items
      .filter(ev => ev.id && ev.status !== 'cancelled' && (ev.summary || ev.description))
      .map(ev => ({
        id: ev.id!,
        summary: ev.summary || 'Scheduled Event',
        description: ev.description || undefined,
        start: { dateTime: ev.start?.dateTime || undefined, date: ev.start?.date || undefined },
        end: { dateTime: ev.end?.dateTime || undefined, date: ev.end?.date || undefined },
      }));

    const cancelledItemIds: string[] = items
      .filter(ev => ev.id && ev.status === 'cancelled')
      .map(ev => `cal_${ev.id}`);

    const events = this.normalizeToLifeEvents(uid, rawEvents);

    return {
      events,
      deletedEventIds: cancelledItemIds,
      itemCount: events.length,
      nextSyncToken: nextSyncToken || null,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Backwards-compatible fetcher used by existing code and direct tests.
   */
  async fetchRecentEvents(uid: string, accessToken?: string): Promise<CalendarRawEvent[]> {
    if (accessToken) {
      const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=50`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) {
        throw new Error(`Google Calendar API error (${res.status}): ${await res.text()}`);
      }
      const data: any = await res.json();
      return (data.items || []).map((ev: any) => ({
        id: ev.id,
        summary: ev.summary || 'Scheduled Event',
        description: ev.description,
        start: ev.start,
        end: ev.end,
      }));
    }

    const result = await this.sync(uid, null);
    return result.events.map(e => ({
      id: e.source.externalId || e.id,
      summary: e.title,
      description: e.summary,
      start: { dateTime: e.occurredAt },
    }));
  }

  normalizeToLifeEvents(uid: string, rawEvents: CalendarRawEvent[]): LifeEvent[] {
    return rawEvents.map(raw => {
      const occurredAt = raw.start.dateTime || raw.start.date || new Date().toISOString();
      const contentHash = crypto.createHash('sha256').update(raw.id + (raw.summary || '')).digest('hex');

      const summaryLower = ((raw.summary || '') + ' ' + (raw.description || '')).toLowerCase();
      const domains: DomainId[] = [];

      // Keyword and semantics extraction
      if (
        summaryLower.includes('gym') ||
        summaryLower.includes('workout') ||
        summaryLower.includes('run') ||
        summaryLower.includes('doctor') ||
        summaryLower.includes('meditation') ||
        summaryLower.includes('yoga') ||
        summaryLower.includes('physio') ||
        summaryLower.includes('walk')
      ) {
        domains.push('health');
      }

      if (
        summaryLower.includes('study') ||
        summaryLower.includes('course') ||
        summaryLower.includes('lecture') ||
        summaryLower.includes('read') ||
        summaryLower.includes('coding') ||
        summaryLower.includes('workshop') ||
        summaryLower.includes('tutorial')
      ) {
        domains.push('learning');
      }

      if (
        summaryLower.includes('meeting') ||
        summaryLower.includes('sync') ||
        summaryLower.includes('interview') ||
        summaryLower.includes('sprint') ||
        summaryLower.includes('deadline') ||
        summaryLower.includes('demo') ||
        summaryLower.includes('presentation') ||
        summaryLower.includes('client') ||
        summaryLower.includes('standup')
      ) {
        domains.push('career');
      }

      if (
        summaryLower.includes('dinner') ||
        summaryLower.includes('lunch') ||
        summaryLower.includes('family') ||
        summaryLower.includes('coffee') ||
        summaryLower.includes('birthday') ||
        summaryLower.includes('drinks') ||
        summaryLower.includes('catchup') ||
        summaryLower.includes('hangout')
      ) {
        domains.push('relationships');
      }

      if (domains.length === 0) {
        domains.push('personal');
      }

      // Determine activity sentiment and intensity from duration
      let intensity = 2;
      if (raw.start?.dateTime && raw.end?.dateTime) {
        const startMs = new Date(raw.start.dateTime).getTime();
        const endMs = new Date(raw.end.dateTime).getTime();
        const durationHours = (endMs - startMs) / (1000 * 60 * 60);
        if (durationHours >= 3) intensity = 4;
        else if (durationHours >= 1.5) intensity = 3;
        else intensity = 2;
      }

      return {
        id: `cal_${raw.id}`,
        userId: uid,
        type: 'activity',
        domainIds: domains,
        title: raw.summary || 'Calendar Session',
        summary: raw.description ? `${raw.summary}: ${raw.description.slice(0, 140)}` : raw.summary,
        occurredAt,
        createdAt: new Date().toISOString(),
        source: {
          type: 'calendar',
          ref: raw.id,
          externalId: raw.id,
        },
        confidence: 0.92,
        sentiment: domains.includes('health') || domains.includes('learning') || domains.includes('relationships') ? 'positive' : 'neutral',
        intensity,
        isTurningPointCandidate: false,
        contentHash,
      };
    });
  }
}

/**
 * Test Fake Adapter:
 * Used in automated unit & integration testing to provide deterministic fixtures.
 */
export class FakeCalendarAdapter implements ICalendarAdapter {
  readonly provider = 'google_calendar' as const;
  readonly scopes = ['https://www.googleapis.com/auth/calendar.readonly'];
  private fixtures: CalendarRawEvent[] = [];

  constructor(fixtures?: CalendarRawEvent[]) {
    if (fixtures) this.fixtures = fixtures;
  }

  setFixtures(fixtures: CalendarRawEvent[]): void {
    this.fixtures = fixtures;
  }

  async sync(uid: string, _syncToken?: string | null): Promise<SyncResult> {
    const events = this.normalizeToLifeEvents(uid, this.fixtures);
    return {
      events,
      itemCount: events.length,
      nextSyncToken: 'fake_next_sync_token_123',
      syncedAt: new Date().toISOString(),
    };
  }

  async fetchRecentEvents(_uid: string, _accessToken?: string): Promise<CalendarRawEvent[]> {
    return this.fixtures;
  }

  normalizeToLifeEvents(uid: string, rawEvents: CalendarRawEvent[]): LifeEvent[] {
    return rawEvents.map(raw => ({
      id: `fake_cal_${raw.id}`,
      userId: uid,
      type: 'activity',
      domainIds: ['health'],
      title: raw.summary,
      summary: raw.description || raw.summary,
      occurredAt: raw.start.dateTime || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      source: {
        type: 'calendar',
        ref: raw.id,
        externalId: raw.id,
      },
      confidence: 0.95,
      sentiment: 'positive',
      intensity: 3,
      isTurningPointCandidate: false,
      contentHash: crypto.createHash('sha256').update(raw.id).digest('hex'),
    }));
  }
}
