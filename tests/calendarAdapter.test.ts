import { describe, it, expect } from 'vitest';
import { FakeCalendarAdapter, GoogleCalendarAdapter } from '../server/src/services/calendarAdapter';

describe('Calendar Adapter & Test Fake (Section 3.5 & 22)', () => {
  it('FakeCalendarAdapter returns normalized events for test fixtures without network calls', async () => {
    const fakeAdapter = new FakeCalendarAdapter([
      {
        id: 'cal_event_001',
        summary: 'Morning 5km Run',
        description: 'Zone 2 running session',
        start: { dateTime: '2026-09-04T07:00:00Z' },
      },
      {
        id: 'cal_event_002',
        summary: 'Deep Learning Lecture',
        description: 'Transformer architectures chapter 4',
        start: { dateTime: '2026-09-04T10:00:00Z' },
      },
    ]);

    const raw = await fakeAdapter.fetchRecentEvents('test_user_cal');
    expect(raw.length).toBe(2);

    const normalized = fakeAdapter.normalizeToLifeEvents('test_user_cal', raw);
    expect(normalized.length).toBe(2);
    expect(normalized[0].source.type).toBe('calendar');
    expect(normalized[0].source.externalId).toBe('cal_event_001');
    expect(normalized[0].userId).toBe('test_user_cal');
  });

  it('GoogleCalendarAdapter correctly maps keywords to semantic domains', () => {
    const adapter = new GoogleCalendarAdapter();
    const rawEvents = [
      {
        id: 'ev_gym',
        summary: 'Gym Workout - Upper Body',
        start: { dateTime: '2026-09-04T08:00:00Z' },
      },
      {
        id: 'ev_study',
        summary: 'Coding Rust Project & Study',
        start: { dateTime: '2026-09-04T14:00:00Z' },
      },
      {
        id: 'ev_meet',
        summary: 'Team Sprint Planning Meeting',
        start: { dateTime: '2026-09-04T16:00:00Z' },
      },
    ];

    const normalized = adapter.normalizeToLifeEvents('user_kw_test', rawEvents);
    expect(normalized[0].domainIds).toContain('health');
    expect(normalized[1].domainIds).toContain('learning');
    expect(normalized[2].domainIds).toContain('career');
    expect(normalized[0].contentHash).toBeDefined();
  });
});
