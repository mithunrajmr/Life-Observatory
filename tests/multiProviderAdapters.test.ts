import { describe, it, expect } from 'vitest';
import { GmailAdapter } from '../server/src/services/adapters/gmailAdapter';
import { GoogleDriveAdapter } from '../server/src/services/adapters/driveAdapter';
import { GoogleCalendarAdapter } from '../server/src/services/calendarAdapter';

describe('Multi-Provider Privacy-Preserving Adapters', () => {
  it('GoogleCalendarAdapter normalizes events and calculates contentHash', () => {
    const adapter = new GoogleCalendarAdapter();
    const rawEvents = [
      {
        id: 'cal_event_real_1',
        summary: 'Morning Meditation & Yoga',
        start: { dateTime: '2026-09-05T06:30:00Z' },
        end: { dateTime: '2026-09-05T07:15:00Z' },
      },
    ];

    const normalized = adapter.normalizeToLifeEvents('test_user_1', rawEvents);
    expect(normalized.length).toBe(1);
    expect(normalized[0].source.type).toBe('calendar');
    expect(normalized[0].source.externalId).toBe('cal_event_real_1');
    expect(normalized[0].domainIds).toContain('health');
    expect(normalized[0].contentHash).toBeDefined();
    expect(normalized[0].contentHash.length).toBe(64); // sha256 hex length
  });

  it('GmailAdapter extracts communication metadata without raw body contents', () => {
    const adapter = new GmailAdapter();
    const mockMessages = [
      {
        id: 'msg_99182',
        internalDate: String(Date.parse('2026-09-04T22:30:00Z')),
        subjectSnippet: 'Urgent: Production Deployment Q3 sprint review',
        senderDomain: 'company.com',
        labels: ['IMPORTANT', 'INBOX'],
      },
      {
        id: 'msg_99183',
        internalDate: String(Date.parse('2026-09-05T14:15:00Z')),
        subjectSnippet: 'Weekly Design Critique Notes',
        senderDomain: 'company.com',
        labels: ['INBOX'],
      },
    ];

    const normalized = adapter.normalizeToLifeEvents('user_gmail_test', mockMessages);
    expect(normalized.length).toBe(2);

    // Verify privacy: source type is gmail, daily rollup id matches
    expect(normalized[0].source.type).toBe('gmail');
    expect(normalized[0].source.externalId).toBe('gmail_2026-09-04');
    expect(normalized[0].domainIds).toContain('career');

    // Verify off-hours detection: 22:30 is counted as off-hours
    expect(normalized[0].metadata?.offHoursCount).toBe(1);
    expect(normalized[1].metadata?.offHoursCount).toBe(0);

    // Verify ZERO body text is present
    expect((normalized[0] as any).body).toBeUndefined();
    expect((normalized[0] as any).snippet).toBeUndefined();
    expect((normalized[0].metadata as any)?.body).toBeUndefined();
  });

  it('GoogleDriveAdapter tracks focus/creation sessions with zero file content stored', () => {
    const adapter = new GoogleDriveAdapter();
    const mockFiles = [
      {
        id: 'drive_doc_441',
        name: 'Distributed Systems Study & Research Notes',
        mimeType: 'application/vnd.google-apps.document',
        modifiedTime: '2026-09-04T15:00:00Z',
        createdTime: '2026-09-04T11:00:00Z',
      },
      {
        id: 'drive_sheet_442',
        name: 'Budget & Financial Planning 2026',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        modifiedTime: '2026-09-05T10:00:00Z',
        createdTime: '2026-09-01T09:00:00Z',
      },
    ];

    const normalized = adapter.normalizeToLifeEvents('user_drive_test', mockFiles);
    expect(normalized.length).toBe(2);

    // First file: study & research -> learning domain
    expect(normalized[0].source.type).toBe('drive');
    expect(normalized[0].domainIds).toContain('learning');
    expect(normalized[0].title).toBe('Document Editing Session');
    expect(normalized[0].summary).toContain('metadata only');

    // Second file: budget -> career domain
    expect(normalized[1].domainIds).toContain('career');

    // Verify privacy: ZERO file content or text bodies downloaded
    expect((normalized[0] as any).content).toBeUndefined();
    expect((normalized[0].metadata as any)?.content).toBeUndefined();
    expect(normalized[0].contentHash).toBeDefined();
  });
});
