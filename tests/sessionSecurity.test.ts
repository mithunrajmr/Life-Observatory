import { createSessionToken, verifySessionToken } from '../server/src/services/sessionTokenService';

describe('Session Security & Cryptographic Token Verification', () => {
  const mockUser = {
    uid: 'victim_user_12345',
    email: 'victim@example.com',
    name: 'Victim User',
  };

  test('creates valid HMAC-SHA256 session token', () => {
    const token = createSessionToken(mockUser);
    expect(token.startsWith('lo_sec_')).toBe(true);

    const decoded = verifySessionToken(token);
    expect(decoded.uid).toBe('victim_user_12345');
    expect(decoded.email).toBe('victim@example.com');
    expect(decoded.exp).toBeGreaterThan(Date.now());
  });

  test('detects and rejects tampered payload (attacker modifies UID)', () => {
    const token = createSessionToken(mockUser);
    const raw = token.replace('lo_sec_', '');
    const [header, payload, sig] = raw.split('.');

    // Attacker modifies victim_user_12345 to admin_user_99999
    const tamperedPayloadObj = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    tamperedPayloadObj.uid = 'admin_user_99999';
    const tamperedPayload = Buffer.from(JSON.stringify(tamperedPayloadObj)).toString('base64url');

    const tamperedToken = `lo_sec_${header}.${tamperedPayload}.${sig}`;

    expect(() => verifySessionToken(tamperedToken)).toThrow('Cryptographic signature verification failed.');
  });

  test('detects and rejects forged token with fake signature', () => {
    const fakeHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const fakePayload = Buffer.from(JSON.stringify({
      uid: 'impersonated_user',
      exp: Date.now() + 100000,
    })).toString('base64url');
    const fakeSig = Buffer.from('fakesignature1234567890abcdef123456').toString('base64url');

    const forgedToken = `lo_sec_${fakeHeader}.${fakePayload}.${fakeSig}`;

    expect(() => verifySessionToken(forgedToken)).toThrow('Cryptographic signature verification failed.');
  });

  test('rejects expired session tokens', () => {
    const expiredToken = createSessionToken({
      ...mockUser,
      durationMs: -5000, // Expired 5 seconds ago
    });

    expect(() => verifySessionToken(expiredToken)).toThrow('Session token has expired.');
  });

  test('unconditionally rejects insecure legacy unsigned tokens', () => {
    const legacyToken = 'real_google_user_eyuidSIvictim_user_12345In0';
    expect(() => verifySessionToken(legacyToken)).toThrow('Insecure legacy token format rejected.');
  });
});
