import crypto from 'crypto';
import { DomainId, LifeEvent } from '../types';
import { getUserSubcollection } from './firebaseAdmin';

export interface CalendarRawEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

export interface ICalendarAdapter {
  fetchRecentEvents(uid: string, accessToken?: string): Promise<CalendarRawEvent[]>;
  normalizeToLifeEvents(uid: string, rawEvents: CalendarRawEvent[]): LifeEvent[];
}

/**
 * Production Google Calendar Adapter:
 * Uses Google Calendar API to fetch user events when authenticated with valid OAuth token.
 */
export class GoogleCalendarAdapter implements ICalendarAdapter {
  async fetchRecentEvents(uid: string, accessToken?: string): Promise<CalendarRawEvent[]> {
    if (!accessToken) {
      // Check stored connection in Firestore for user
      const connDoc = await getUserSubcollection(uid, 'connections').doc('google_calendar').get();
      const connData = connDoc.data();
      if (!connData || connData.status !== 'connected' || !connData.accessToken) {
        throw new Error('Google Calendar is not connected. Re-authentication required.');
      }
      accessToken = connData.accessToken;
    }

    const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=50`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Calendar API error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    return data.items || [];
  }

  normalizeToLifeEvents(uid: string, rawEvents: CalendarRawEvent[]): LifeEvent[] {
    return rawEvents.map(raw => {
      const occurredAt = raw.start.dateTime || raw.start.date || new Date().toISOString();
      const contentHash = crypto.createHash('sha256').update(raw.id + raw.summary).digest('hex');

      // Semantic domain mapping based on title/description keywords
      const summaryLower = (raw.summary + ' ' + (raw.description || '')).toLowerCase();
      const domains: DomainId[] = [];

      if (summaryLower.includes('gym') || summaryLower.includes('workout') || summaryLower.includes('run') || summaryLower.includes('doctor') || summaryLower.includes('meditation')) {
        domains.push('health');
      }
      if (summaryLower.includes('study') || summaryLower.includes('course') || summaryLower.includes('lecture') || summaryLower.includes('read') || summaryLower.includes('coding')) {
        domains.push('learning');
      }
      if (summaryLower.includes('meeting') || summaryLower.includes('sync') || summaryLower.includes('interview') || summaryLower.includes('sprint') || summaryLower.includes('deadline')) {
        domains.push('career');
      }
      if (summaryLower.includes('dinner') || summaryLower.includes('lunch') || summaryLower.includes('family') || summaryLower.includes('coffee') || summaryLower.includes('birthday')) {
        domains.push('relationships');
      }
      if (domains.length === 0) {
        domains.push('personal');
      }

      return {
        id: `cal_${raw.id}`,
        userId: uid,
        type: 'activity',
        domainIds: domains,
        title: raw.summary || 'Calendar Session',
        summary: raw.description ? `${raw.summary}: ${raw.description.slice(0, 100)}` : raw.summary,
        occurredAt,
        createdAt: new Date().toISOString(),
        source: {
          type: 'calendar',
          ref: raw.id,
          externalId: raw.id,
        },
        confidence: 0.9,
        sentiment: 'neutral',
        intensity: 2,
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
  private fixtures: CalendarRawEvent[] = [];

  constructor(fixtures?: CalendarRawEvent[]) {
    if (fixtures) this.fixtures = fixtures;
  }

  setFixtures(fixtures: CalendarRawEvent[]): void {
    this.fixtures = fixtures;
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
    }));
  }
}
