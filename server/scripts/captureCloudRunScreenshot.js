import WebSocket from 'ws';
import fs from 'fs';
import crypto from 'crypto';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });
const SIGNING_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.SESSION_SECRET || '';
const TEST_UID = 'test-synthetic-user-117071';
const TEST_EMAIL = 'synthetic_test_user@example.com';

function createSignedToken(uid, email = '', durationMs = 86400000 * 30) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    uid,
    email,
    name: 'Synthetic Test User',
    iat: Date.now(),
    exp: Date.now() + durationMs,
  };
  const encHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SIGNING_SECRET).update(`${encHeader}.${encPayload}`).digest('base64url');
  return `lo_sec_${encHeader}.${encPayload}.${sig}`;
}

async function captureAuthenticated() {
  const token = createSignedToken(TEST_UID, TEST_EMAIL);
  const targetsRes = await fetch('http://localhost:9222/json');
  const targets = await targetsRes.json();
  const target = targets.find(t => t.id === 'E47E8757856F7913AF17A5801010BF58') || targets[0];

  const ws = new WebSocket(target.webSocketDebuggerUrl);

  ws.on('open', () => {
    // 1. Inject token into localStorage
    const expr = `
      localStorage.setItem('life_observatory_auth_token', '${token}');
      localStorage.setItem('life_observatory_real_user', JSON.stringify({
        uid: '${TEST_UID}',
        email: '${TEST_EMAIL}',
        displayName: 'Synthetic Test User',
        photoURL: null
      }));
      window.location.href = 'https://life-observatory-app-92008039582.us-central1.run.app/';
    `;
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression: expr }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data.toString());
    if (res.id === 1) {
      console.log('Injected token. Waiting for page reload...');
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 2,
          method: 'Page.captureScreenshot',
          params: { format: 'png' }
        }));
      }, 3500);
    } else if (res.id === 2 && res.result?.data) {
      const buffer = Buffer.from(res.result.data, 'base64');
      const outPath = 'C:\\Users\\2mrmi\\.gemini\\antigravity-ide\\brain\\1889abad-a750-4921-9cfd-baf2a389f8bc\\cloudrun_authenticated_dashboard.png';
      fs.writeFileSync(outPath, buffer);
      console.log('Authenticated screenshot saved to:', outPath);
      ws.close();
      process.exit(0);
    }
  });
}

captureAuthenticated().catch(console.error);
