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

  // Navigate to Observatory tab
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const btn = btns.find(b => b.textContent.includes('Observatory') && b.textContent.includes('vantage point'));
        if (btn) btn.click();
      })()
    `
  });

  await new Promise(r => setTimeout(r, 1500));

  // Find reflection textarea and type reflection
  const typed = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const textarea = document.querySelector('textarea');
        if (!textarea) return { found: false };
        textarea.value = 'Completed 4 hours of deep architectural coding today. Energy was high and feel really accomplished with the prototype.';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        return { found: true, val: textarea.value };
      })()
    `,
    returnByValue: true
  });
  console.log('Textarea evaluation:', typed.result.value);

  // Click Submit Reflection
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const submitBtn = btns.find(b => b.textContent.includes('Capture Reflection') || b.textContent.includes('Record Reflection') || b.textContent.includes('Save'));
        if (submitBtn) submitBtn.click();
      })()
    `
  });
  console.log('Submitted reflection, waiting for ingestion...');
  await new Promise(r => setTimeout(r, 5000));

  const snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(process.cwd(), 'docs', 'screenshots', '02-observatory-with-reflection.png'), Buffer.from(snap.data, 'base64'));
  console.log('Saved 02-observatory-with-reflection.png');
  ws.close();
}

run().catch(console.error);
