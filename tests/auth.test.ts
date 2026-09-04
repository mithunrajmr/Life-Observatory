import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import app from '../server/src/index';
import { Server } from 'http';

const inMemoryStore: Record<string, any[]> = {};

vi.mock('../server/src/services/firebaseAdmin', () => ({
  getUserSubcollection: (uid: string, colName: string) => ({
    get: async () => ({
      empty: (inMemoryStore[`${uid}/${colName}`] || []).length === 0,
      forEach: (cb: any) => (inMemoryStore[`${uid}/${colName}`] || []).forEach(item => cb({ data: () => item })),
    }),
    doc: (docId?: string) => {
      const id = docId || `doc_${Date.now()}`;
      return {
        id,
        get: async () => ({ exists: false, data: () => null }),
        set: async (data: any) => {
          const key = `${uid}/${colName}`;
          if (!inMemoryStore[key]) inMemoryStore[key] = [];
          inMemoryStore[key].push({ ...data, id });
        },
      };
    },
  }),
}));

describe('Authentication & Authorization Tests (Section 28 & 32)', () => {
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

  it('rejects requests missing an Authorization header with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects requests with malformed non-Bearer headers with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Basic 123456' },
    });
    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body.error.code).toBe('UNAUTHENTICATED');
  });

  it('prevents UID spoofing: client cannot forge ownership by passing body.uid', async () => {
    const res = await fetch(`${baseUrl}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test_token_for_real_user',
      },
      body: JSON.stringify({
        title: 'Malicious Goal',
        domainId: 'career',
        uid: 'victim_user_spoofed',
      }),
    });

    expect(res.status).toBe(201);
    const body: any = await res.json();
    // The created goal must belong to real_user, NOT victim_user_spoofed
    expect(body.goal.userId).toBe('real_user');
    expect(body.goal.userId).not.toBe('victim_user_spoofed');
  });

  it('allows health check without authentication', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.status).toBe('healthy');
  });
});
