import WebSocket from 'ws';
import fs from 'fs';

const BASE_DIR = 'C:\\Users\\2mrmi\\.gemini\\antigravity-ide\\brain\\1889abad-a750-4921-9cfd-baf2a389f8bc';

async function captureViews() {
  const targetsRes = await fetch('http://localhost:9222/json');
  const targets = await targetsRes.json();
  const target = targets.find(t => t.id === 'E47E8757856F7913AF17A5801010BF58') || targets[0];

  const ws = new WebSocket(target.webSocketDebuggerUrl);

  const views = [
    { name: 'cloudrun_horizon_live.png', action: 'window.scrollTo(0, 700);' },
    { name: 'cloudrun_companion_live.png', action: 'document.querySelectorAll("nav button, aside button")[5]?.click();' },
    { name: 'cloudrun_connections_live.png', action: 'document.querySelectorAll("aside button")[6]?.click();' },
  ];

  ws.on('open', async () => {
    for (const view of views) {
      console.log(`Navigating to ${view.name}...`);
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: view.action }
      }));
      await new Promise(r => setTimeout(r, 2500));

      const screenshotPromise = new Promise((resolve) => {
        const handler = (data) => {
          const res = JSON.parse(data.toString());
          if (res.id === 2 && res.result?.data) {
            ws.off('message', handler);
            resolve(res.result.data);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({
          id: 2,
          method: 'Page.captureScreenshot',
          params: { format: 'png' }
        }));
      });

      const b64 = await screenshotPromise;
      const outPath = `${BASE_DIR}\\${view.name}`;
      fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
      console.log(`Saved ${outPath}`);
    }

    ws.close();
    process.exit(0);
  });
}

captureViews().catch(console.error);
