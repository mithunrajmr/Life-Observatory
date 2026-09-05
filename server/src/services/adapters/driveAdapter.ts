import { google, drive_v3 } from 'googleapis';
import crypto from 'crypto';
import { DomainId, LifeEvent } from '../../types';
import { getAuthenticatedOAuth2Client } from '../oauthService';
import { IDataSourceAdapter, SyncResult } from './baseAdapter';

export interface DriveMetadataRecord {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

/**
 * Privacy-First Google Drive Adapter:
 * Operates strictly with `drive.metadata.readonly`.
 * Never reads or downloads file contents.
 * Extracts:
 * - Creative focus, document authoring, and learning project cadences
 * - Focus domain classification based on document topics and MIME types
 */
export class GoogleDriveAdapter implements IDataSourceAdapter {
  readonly provider = 'google_drive' as const;
  readonly scopes = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

  async sync(uid: string, syncToken?: string | null): Promise<SyncResult> {
    const authClient = await getAuthenticatedOAuth2Client(uid, 'google_drive');
    const drive = google.drive({ version: 'v3', auth: authClient as any });

    let files: drive_v3.Schema$File[] = [];
    let nextStartPageToken: string | null = null;

    try {
      if (syncToken) {
        // Incremental sync using changes.list
        let pageToken: string | undefined = syncToken;
        do {
          const res: any = await drive.changes.list({
            pageToken,
            fields: 'nextPageToken, newStartPageToken, changes(file(id, name, mimeType, modifiedTime, trashed))',
            pageSize: 100,
          });

          const changes = res.data.changes || [];
          for (const c of changes) {
            if (c.file && !c.file.trashed && c.file.id) {
              files.push(c.file);
            }
          }

          pageToken = res.data.nextPageToken || undefined;
          if (res.data.newStartPageToken) {
            nextStartPageToken = res.data.newStartPageToken;
          }
        } while (pageToken);
      } else {
        // Initial sync: fetch last 60 days of modified files
        const timeMin = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
        const res = await drive.files.list({
          q: `modifiedTime > '${timeMin}' and trashed = false`,
          fields: 'files(id, name, mimeType, modifiedTime)',
          pageSize: 100,
          orderBy: 'modifiedTime desc',
        });

        files = res.data.files || [];

        // Acquire new start page token for subsequent incremental syncs
        const tokenRes = await drive.changes.getStartPageToken();
        nextStartPageToken = tokenRes.data.startPageToken || null;
      }
    } catch (err: any) {
      if (err?.code === 404 || err?.message?.includes('startPageToken')) {
        console.warn(`[Drive Sync] PageToken expired for user ${uid}, re-syncing.`);
        return this.sync(uid, null);
      }
      throw new Error(`Google Drive metadata sync failed: ${err.message}`);
    }

    const records: DriveMetadataRecord[] = files
      .filter(f => f.id && f.name)
      .map(f => ({
        id: f.id!,
        name: f.name!,
        mimeType: f.mimeType || 'application/octet-stream',
        modifiedTime: f.modifiedTime || new Date().toISOString(),
      }));

    const events = this.normalizeToLifeEvents(uid, records);

    return {
      events,
      itemCount: events.length,
      nextSyncToken: nextStartPageToken,
      syncedAt: new Date().toISOString(),
    };
  }

  normalizeToLifeEvents(uid: string, records: DriveMetadataRecord[]): LifeEvent[] {
    if (records.length === 0) return [];

    // Group files by day to surface deliberate document work sessions
    const dayMap = new Map<string, DriveMetadataRecord[]>();
    for (const r of records) {
      const day = r.modifiedTime.split('T')[0];
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day)!.push(r);
    }

    const events: LifeEvent[] = [];

    for (const [dayKey, dayFiles] of dayMap.entries()) {
      const domains: DomainId[] = [];
      let learningCount = 0;
      let careerCount = 0;

      for (const f of dayFiles) {
        const nameLower = f.name.toLowerCase();
        if (
          nameLower.includes('notes') ||
          nameLower.includes('study') ||
          nameLower.includes('book') ||
          nameLower.includes('course') ||
          nameLower.includes('thesis') ||
          nameLower.includes('research')
        ) {
          learningCount++;
        }
        if (
          nameLower.includes('pitch') ||
          nameLower.includes('strategy') ||
          nameLower.includes('spec') ||
          nameLower.includes('roadmap') ||
          nameLower.includes('proposal') ||
          nameLower.includes('architecture') ||
          nameLower.includes('budget')
        ) {
          careerCount++;
        }
      }

      if (learningCount > 0) domains.push('learning');
      if (careerCount > 0 || dayFiles.length >= 3) domains.push('career');
      if (domains.length === 0) domains.push('personal');

      const count = dayFiles.length;
      const contentHash = crypto.createHash('sha256').update(`drive_${dayKey}_${count}`).digest('hex');

      events.push({
        id: `drive_${dayKey}`,
        userId: uid,
        type: 'activity',
        domainIds: domains,
        title: count > 3 ? 'Active Document Production & Deep Work' : 'Document Editing Session',
        summary: `Observed activity on ${count} document${count === 1 ? '' : 's'} (metadata only) in Drive.`,
        occurredAt: `${dayKey}T16:00:00.000Z`,
        createdAt: new Date().toISOString(),
        source: {
          type: 'drive',
          ref: `drive_${dayKey}`,
          externalId: `drive_${dayKey}`,
        },
        confidence: 0.9,
        sentiment: 'positive',
        intensity: count >= 5 ? 4 : (count >= 2 ? 3 : 2),
        isTurningPointCandidate: false,
        contentHash,
      });
    }

    return events;
  }
}

/**
 * Test Fake Adapter:
 * For automated unit & integration testing.
 */
export class FakeDriveAdapter implements IDataSourceAdapter {
  readonly provider = 'google_drive' as const;
  readonly scopes = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
  private fixtures: DriveMetadataRecord[] = [];

  constructor(fixtures?: DriveMetadataRecord[]) {
    if (fixtures) this.fixtures = fixtures;
  }

  setFixtures(fixtures: DriveMetadataRecord[]): void {
    this.fixtures = fixtures;
  }

  async sync(uid: string, _syncToken?: string | null): Promise<SyncResult> {
    const adapter = new GoogleDriveAdapter();
    const events = adapter.normalizeToLifeEvents(uid, this.fixtures);
    return {
      events,
      itemCount: events.length,
      nextSyncToken: 'fake_drive_token_123',
      syncedAt: new Date().toISOString(),
    };
  }
}
