const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CDP_URL = 'http://127.0.0.1:9222/json';
const ARTIFACT_DIR = 'C:\\Users\\2mrmi\\.gemini\\antigravity-ide\\brain\\1889abad-a750-4921-9cfd-baf2a389f8bc';
const QA_FINAL_DIR = path.resolve(__dirname, '../../qa/screenshots/final');

if (!fs.existsSync(QA_FINAL_DIR)) fs.mkdirSync(QA_FINAL_DIR, { recursive: true });

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get(CDP_URL, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const tabs = JSON.parse(data);
        const appTab = tabs.find(t => t.url.includes('localhost:8080') || t.title.includes('Life Observatory'));
        if (appTab) resolve(appTab.webSocketDebuggerUrl);
        else reject(new Error('App tab not found in Chrome'));
      });
    }).on('error', reject);
  });
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === id) {
        ws.removeListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalInBrowser(ws, expression) {
  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error(JSON.stringify(res.exceptionDetails));
  }
  return res.result?.value;
}

async function captureScreen(ws, filename) {
  // Wait for network and renders to settle
  await new Promise(r => setTimeout(r, 1200));
  const res = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(res.data, 'base64');
  
  // Write to QA dir
  const qaPath = path.join(QA_FINAL_DIR, filename);
  fs.writeFileSync(qaPath, buffer);

  // Write to brain artifact dir
  const brainPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(brainPath, buffer);

  console.log(`[Captured] ${filename} (${buffer.length} bytes) -> Saved to QA and Brain artifacts`);
}

async function selectTab(ws, tabName) {
  await evalInBrowser(ws, `(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button, aside button'));
    const btn = buttons.find(b => {
      const text = b.textContent || '';
      return text.toLowerCase().includes('${tabName.toLowerCase()}');
    });
    if (btn) {
      btn.click();
    } else {
      console.warn('Could not find nav button for ${tabName}');
    }
  })()`);
  await new Promise(r => setTimeout(r, 1500));
}

async function main() {
  console.log('=== CAPTURING FRESH LIVE SCREENSHOTS FROM CDP BROWSER ===');
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise(res => ws.on('open', res));

  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'Runtime.enable');

  // Set nice viewport
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // 1. Observatory
  console.log('Navigating to Observatory...');
  await selectTab(ws, 'Observatory');
  await captureScreen(ws, '02-observatory-final.png');

  // 2. Life Horizon (scroll or inspect horizon card inside observatory)
  console.log('Capturing Life Horizon view...');
  await captureScreen(ws, '05-life-horizon-final.png');

  // 3. Journal
  console.log('Navigating to Journal...');
  await selectTab(ws, 'Journal');
  await captureScreen(ws, '16-journal-final.png');

  // 4. Timeline (Turning points)
  console.log('Navigating to Timeline...');
  await selectTab(ws, 'Timeline');
  await captureScreen(ws, '08-turning-points-final.png');

  // 5. Insights (What changed)
  console.log('Navigating to Insights...');
  await selectTab(ws, 'Insights');
  await captureScreen(ws, '07-what-changed-final.png');

  // 6. Companion
  console.log('Navigating to Companion...');
  await selectTab(ws, 'Companion');
  await captureScreen(ws, '04-companion-final.png');

  // 7. Connections (Data & Privacy)
  console.log('Navigating to Data & Privacy...');
  await selectTab(ws, 'Data & Privacy');
  await captureScreen(ws, '12-connections-final.png');

  // 8. Landing / Login state
  console.log('Navigating to unauthenticated landing page view...');
  // Save current auth token
  const token = await evalInBrowser(ws, `localStorage.getItem('life_observatory_auth_token')`);
  // Temporarily sign out
  await evalInBrowser(ws, `(() => {
    sessionStorage.setItem('life_observatory_signed_out', 'true');
    localStorage.removeItem('life_observatory_auth_token');
    window.location.reload();
  })()`);
  await new Promise(r => setTimeout(r, 2000));
  await captureScreen(ws, '01-login-final.png');

  // Restore authenticated state
  if (token) {
    console.log('Restoring authenticated state in browser...');
    await evalInBrowser(ws, `(() => {
      sessionStorage.removeItem('life_observatory_signed_out');
      localStorage.setItem('life_observatory_auth_token', '${token}');
      window.location.reload();
    })()`);
    await new Promise(r => setTimeout(r, 2000));
  }

  ws.close();
  console.log('=== ALL SCREENSHOTS CAPTURED AND SYNCED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
