import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

async function testPrompt() {
  const googleAuth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await googleAuth.getClient();
  const tokenRes = await client.getAccessToken();
  const token = tokenRes.token;
  const projectId = 'life-observatory-507712';
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`;

  const prompt = 'What specific evidence from my records are you using when you discuss my focus time?';
  const systemInstruction = 'You are the Companion for Life Observatory. User records: [2026-09-05] Focused time working on AI project. Struggled to protect uninterrupted work time.';

  const payload = {
    contents: [
      { role: 'user', parts: [{ text: prompt }] }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response body:', text);
}

testPrompt().catch(console.error);
