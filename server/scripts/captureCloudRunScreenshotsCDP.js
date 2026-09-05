import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

async function main() {
  const screenshotsDir = path.join(process.cwd(), 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const targetsRes = await fetch('http://localhost:9222/json');
  const targets = await targetsRes.json();
  const target = targets.find(t => t.url.includes('life-observatory-app')) || targets[0];
  console.log('Attaching to target:', target.id, target.url);

  const ws = new WebSocket(target.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.on('message', (raw) => {
    const data = JSON.parse(raw.toString());
    if (data.id && pending.has(data.id)) {
      const resolve = pending.get(data.id);
      pending.delete(data.id);
      resolve(data.result);
    }
  });

  await new Promise(r => ws.on('open', r));
  console.log('Connected to Chrome via CDP.');

  // 1. Clear session to view Landing page cleanly
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Runtime.evaluate', {
    expression: `
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = 'https://life-observatory-app-92008039582.us-central1.run.app/';
    `
  });

  console.log('Reloading live Cloud Run landing page...');
  await new Promise(r => setTimeout(r, 3000));

  // Verify logo loaded on Landing Page
  const logoEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const img = document.querySelector('header img');
        return {
          found: !!img,
          src: img ? img.src : null,
          complete: img ? img.complete : false,
          naturalWidth: img ? img.naturalWidth : 0,
          naturalHeight: img ? img.naturalHeight : 0,
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Landing Page Logo Status:', logoEval.result.value);

  // Capture Screenshot 1: Landing Page
  const snap1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, '01-landing-live.png'), Buffer.from(snap1.data, 'base64'));
  console.log('Saved 01-landing-live.png');

  // Click "Explore Demo" or "Demo Preview"
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const demoBtn = btns.find(b => b.textContent.includes('Demo') || b.textContent.includes('Explore Demo'));
        if (demoBtn) demoBtn.click();
      })()
    `
  });
  console.log('Clicked Demo Preview, waiting for data load...');
  await new Promise(r => setTimeout(r, 4000));

  // Check Observatory Logo
  const obsLogoEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const img = document.querySelector('aside img');
        return {
          found: !!img,
          src: img ? img.src : null,
          complete: img ? img.complete : false,
          naturalWidth: img ? img.naturalWidth : 0,
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Observatory Sidebar Logo Status:', obsLogoEval.result.value);

  // Capture Screenshot 2: Observatory Dashboard
  const snap2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, '02-observatory-live.png'), Buffer.from(snap2.data, 'base64'));
  console.log('Saved 02-observatory-live.png');

  // Click "Open Connections Settings" to dismiss modal and go to Connections
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const openConn = btns.find(b => b.textContent.includes('Open Connections Settings') || b.textContent.includes('Skip for now'));
        if (openConn) openConn.click();
      })()
    `
  });
  console.log('Dismissed onboarding modal, waiting for render...');
  await new Promise(r => setTimeout(r, 1500));

  // Capture Screenshot 3: Connections Settings View
  const snap3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, '03-connections-live.png'), Buffer.from(snap3.data, 'base64'));
  console.log('Saved 03-connections-live.png');

  // Navigate back to Observatory to capture unobstructed Horizon & Invisible Progress
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const obsBtn = btns.find(b => b.textContent.includes('Observatory') && b.textContent.includes('vantage point'));
        if (obsBtn) obsBtn.click();
      })()
    `
  });
  console.log('Navigated back to Observatory, waiting for render...');
  await new Promise(r => setTimeout(r, 2000));

  // Capture Screenshot 2b: Unobstructed Observatory Dashboard
  const snap2b = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, '02-observatory-live.png'), Buffer.from(snap2b.data, 'base64'));
  console.log('Saved updated 02-observatory-live.png');

  // Click "What Changed" (Insights tab)
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const insBtn = btns.find(b => b.textContent.includes('Insights') || b.textContent.includes('What changed'));
        if (insBtn) insBtn.click();
      })()
    `
  });
  console.log('Navigated to Insights tab, waiting for render...');
  await new Promise(r => setTimeout(r, 2000));

  // Capture Screenshot 4: Insights
  const snap4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, '04-insights-live.png'), Buffer.from(snap4.data, 'base64'));
  console.log('Saved 04-insights-live.png');

  // Click "Companion"
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const chatBtn = btns.find(b => b.textContent.includes('Companion') || b.textContent.includes('Talk it through'));
        if (chatBtn) chatBtn.click();
      })()
    `
  });
  console.log('Navigated to Companion tab, waiting for render...');
  await new Promise(r => setTimeout(r, 2000));

  // Capture Screenshot 5: Companion
  const snap5 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, '05-companion-live.png'), Buffer.from(snap5.data, 'base64'));
  console.log('Saved 05-companion-live.png');

  ws.close();
  console.log('Finished capturing all real live Cloud Run screenshots.');
}

main().catch(console.error);
