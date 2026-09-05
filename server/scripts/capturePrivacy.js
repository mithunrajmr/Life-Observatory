import WebSocket from 'ws';
import fs from 'fs';

const BASE_DIR = 'C:\\Users\\2mrmi\\.gemini\\antigravity-ide\\brain\\1889abad-a750-4921-9cfd-baf2a389f8bc';

async function capturePrivacy() {
  const targetsRes = await fetch('http://localhost:9222/json');
  const targets = await targetsRes.json();
  const target = targets.find(t => t.id === 'E47E8757856F7913AF17A5801010BF58') || targets[0];

  const ws = new WebSocket(target.webSocketDebuggerUrl);

  ws.on('open', async () => {
    // Click Data & Privacy in sidebar
    const expr = `
      const buttons = Array.from(document.querySelectorAll("button"));
      const privacyBtn = buttons.find(b => b.textContent.includes("Data & Privacy") || b.textContent.includes("Sources & control"));
      if (privacyBtn) privacyBtn.click();
    `;
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression: expr }
    }));

    await new Promise(r => setTimeout(r, 2000));

    ws.send(JSON.stringify({
      id: 2,
      method: 'Page.captureScreenshot',
      params: { format: 'png' }
    }));
  });

  ws.on('message', (data) => {
    const res = JSON.parse(data.toString());
    if (res.id === 2 && res.result?.data) {
      const outPath = `${BASE_DIR}\\cloudrun_privacy_live.png`;
      fs.writeFileSync(outPath, Buffer.from(res.result.data, 'base64'));
      console.log(`Saved ${outPath}`);
      ws.close();
      process.exit(0);
    }
  });
}

capturePrivacy().catch(console.error);
