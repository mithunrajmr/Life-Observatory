import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import app from '../server/src/index';
import { Server } from 'http';

const inMemoryStore: Record<string, any[]> = {};

vi.mock('../server/src/services/firebaseAdmin', () => ({
  getUserSubcollection: (uid: string, colName: string) => {
    const key = `${uid}/${colName}`;
    return {
      get: async () => ({
        empty: (inMemoryStore[key] || []).length === 0,
        forEach: (cb: any) => (inMemoryStore[key] || []).forEach(item => cb({ id: item.id, data: () => item, ref: { delete: async () => {} } })),
      }),
      doc: (docId?: string) => {
        const id = docId || `doc_${Date.now()}`;
        return {
          id,
          get: async () => {
            const item = (inMemoryStore[key] || []).find(i => i.id === id);
            return { exists: !!item, data: () => item || null };
          },
          set: async (data: any, opts?: any) => {
            if (!inMemoryStore[key]) inMemoryStore[key] = [];
            const idx = inMemoryStore[key].findIndex(i => i.id === id);
            if (idx >= 0 && opts?.merge) {
              inMemoryStore[key][idx] = { ...inMemoryStore[key][idx], ...data };
            } else if (idx >= 0) {
              inMemoryStore[key][idx] = { ...data, id };
            } else {
              inMemoryStore[key].push({ ...data, id });
            }
          },
        };
      },
      firestore: {
        batch: () => {
          const ops: Array<() => void> = [];
          return {
            delete: (ref: any) => {
              ops.push(() => {});
            },
            commit: async () => {
              ops.forEach(op => op());
            },
          };
        },
      },
    };
  },
  getServerCredentialsSubcollection: (uid: string, colName: string) => {
    const key = `CRED_${uid}/${colName}`;
    return {
      get: async () => ({
        empty: (inMemoryStore[key] || []).length === 0,
        forEach: (cb: any) => (inMemoryStore[key] || []).forEach(item => cb({ id: item.id, data: () => item, ref: { delete: async () => {} } })),
      }),
      doc: (docId?: string) => {
        const id = docId || `doc_${Date.now()}`;
        return {
          id,
          get: async () => ({ exists: false, data: () => null }),
          set: async (data: any) => {
            if (!inMemoryStore[key]) inMemoryStore[key] = [];
            inMemoryStore[key].push({ ...data, id });
          },
          delete: async () => {},
        };
      },
      firestore: {
        batch: () => ({
          delete: () => {},
          commit: async () => {},
        }),
      },
    };
  },
}));

describe('Connection Routes & Multi-User OAuth Isolation', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr: any = server.address();
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/connections returns all 3 supported providers in disconnected state for fresh user', async () => {
    const res = await fetch(`${baseUrl}/api/connections`, {
      headers: { Authorization: 'Bearer test_token_for_user_alice' },
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.connections).toBeDefined();
    expect(body.connections.length).toBe(3);

    const providers = body.connections.map((c: any) => c.provider);
    expect(providers).toContain('google_calendar');
    expect(providers).toContain('gmail');
    expect(providers).toContain('google_drive');

    expect(body.connections.every((c: any) => c.status === 'disconnected')).toBe(true);
  });

  it('GET /api/connections/google/auth-url requires valid provider parameter', async () => {
    const res = await fetch(`${baseUrl}/api/connections/google/auth-url?provider=invalid_provider`, {
      headers: { Authorization: 'Bearer test_token_for_user_alice' },
    });

    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error.code).toBe('INVALID_PROVIDER');
  });

  it('GET /api/connections/google/auth-url generates valid Google OAuth URL for Calendar', async () => {
    const res = await fetch(`${baseUrl}/api/connections/google/auth-url?provider=google_calendar`, {
      headers: { Authorization: 'Bearer test_token_for_user_alice' },
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.url).toBeDefined();
    expect(body.url).toContain('accounts.google.com');
    expect(body.url).toContain('access_type=offline');
    expect(body.provider).toBe('google_calendar');
  });

  it('POST /api/connections/google/exchange-code rejects code exchange when state UID does not match authenticated user', async () => {
    // Fabricate an OAuth state created for User Bob
    const forgedState = Buffer.from(JSON.stringify({
      uid: 'user_bob',
      provider: 'google_calendar',
      nonce: 'random123',
    })).toString('base64');

    // Alice tries to exchange Bob's OAuth code
    const res = await fetch(`${baseUrl}/api/connections/google/exchange-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test_token_for_user_alice',
      },
      body: JSON.stringify({
        code: 'mock_auth_code',
        state: forgedState,
      }),
    });

    // Must be rejected with 403 Forbidden or 400
    expect(res.status).toBe(403);
    const body: any = await res.json();
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('DELETE /api/connections/:provider rejects invalid provider', async () => {
    const res = await fetch(`${baseUrl}/api/connections/unsupported_service`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer test_token_for_user_alice' },
    });

    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error.code).toBe('INVALID_PROVIDER');
  });

  it('DELETE /api/connections/user/all-data allows sovereign erasure of all personal data', async () => {
    const res = await fetch(`${baseUrl}/api/connections/user/all-data`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer test_token_for_user_alice' },
    });

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain('erased');
  });
});
