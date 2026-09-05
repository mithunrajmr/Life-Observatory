async function verify() {
  const base = 'https://life-observatory-app-92008039582.us-central1.run.app';
  const urls = [
    '/',
    '/api/health',
    '/logo.png',
    '/favicon.png'
  ];
  console.log('--- Checking HTTP Endpoints ---');
  for (const u of urls) {
    const res = await fetch(base + u);
    console.log(u, '=> Status:', res.status, '| Content-Type:', res.headers.get('content-type'), '| Size:', res.headers.get('content-length'));
  }

  console.log('\n--- Checking Client Asset References ---');
  const htmlRes = await fetch(base + '/');
  const html = await htmlRes.text();
  const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (jsMatch) {
    console.log('Main JS bundle path:', jsMatch[1]);
    const jsRes = await fetch(base + jsMatch[1]);
    const jsText = await jsRes.text();
    console.log('Main JS bundle status:', jsRes.status);
    
    // Find bundled logo in the JS
    const logoMatch = jsText.match(/\/assets\/logo-[a-zA-Z0-9_-]+\.png/);
    if (logoMatch) {
      console.log('Bundled logo referenced in JS:', logoMatch[0]);
      const logoRes = await fetch(base + logoMatch[0]);
      console.log('Bundled logo HTTP status:', logoRes.status, '| Content-Type:', logoRes.headers.get('content-type'), '| Size:', logoRes.headers.get('content-length'));
    } else {
      console.log('No bundled logo path regex matched in JS bundle');
    }
  }

  console.log('\n--- Testing Authentication Gate ---');
  const unauthRes = await fetch(base + '/api/reflections');
  console.log('Unauthenticated /api/reflections => Status:', unauthRes.status, '(Expected: 401)');
}

verify().catch(console.error);
