import { LifeEvent } from '../../types';
import { SupportedProvider } from '../oauthService';

export interface SyncResult {
  events: LifeEvent[];
  deletedEventIds?: string[];
  itemCount: number;
  nextSyncToken?: string | null;
  syncedAt: string;
}

export interface IDataSourceAdapter {
  readonly provider: SupportedProvider;
  readonly scopes: string[];

  /**
   * Performs an incremental sync if syncToken is available, or initial sync if not.
   * Never stores raw emails or full document contents.
   */
  sync(uid: string, syncToken?: string | null): Promise<SyncResult>;
}
