import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function test() {
  const sm = new SecretManagerServiceClient();
  const [v] = await sm.accessSecretVersion({ name: 'projects/life-observatory-507712/secrets/GEMINI_API_KEY/versions/latest' });
  const key = v.payload.data.toString().trim();
  for (const m of ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite']) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello in 2 words' }] }] })
    });
    const d = await res.json();
    console.log(m, res.status, d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || d.error?.message);
  }
}
test().catch(console.error);
