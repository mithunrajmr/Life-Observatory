import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

async function run() {
  const targetsRes = await fetch('http://localhost:9222/json');
  const targets = await targetsRes.json();
  const target = targets.find(t => t.url.includes('life-observatory-app')) || targets[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const handler = (raw) => {
      const data = JSON.parse(raw.toString());
      if (data.id === curId) {
        ws.off('message', handler);
        res(data.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  // Navigate to Data & Privacy
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const btn = btns.find(b => b.textContent.includes('Data & Privacy'));
        if (btn) btn.click();
      })()
    `
  });

  await new Promise(r => setTimeout(r, 2000));
  const snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(process.cwd(), 'docs', 'screenshots', '03-connections-live.png'), Buffer.from(snap.data, 'base64'));
  console.log('Saved 03-connections-live.png');
  ws.close();
}

run().catch(console.error);
