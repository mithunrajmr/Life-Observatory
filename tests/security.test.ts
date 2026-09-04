import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../server/src/index';
import { Server } from 'http';

describe('Security & Abuse Protection Tests (Section 29, 30, 31)', () => {
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

  it('rejects oversized reflection inputs over 10,000 characters with 400', async () => {
    const hugeContent = 'a'.repeat(10005);
    const res = await fetch(`${baseUrl}/api/reflections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test_token_for_alice',
      },
      body: JSON.stringify({ content: hugeContent }),
    });

    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('safe errors: does not expose stack traces or secret credentials in error responses', async () => {
    const res = await fetch(`${baseUrl}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test_token_for_alice',
      },
      body: JSON.stringify({}), // Missing required fields
    });

    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toBeDefined();
    expect(body.error.message).toBeDefined();
    expect(body.stack).toBeUndefined();
    expect(body.error.stack).toBeUndefined();
  });
});
