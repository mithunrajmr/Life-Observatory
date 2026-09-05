import { GoogleGenAI } from '@google/genai';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

async function main() {
  console.log('Testing Vertex AI and Gemini API...');
  
  // 1. Test Vertex AI with ADC
  try {
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const tokenRes = await client.getAccessToken();
    const token = tokenRes.token;
    console.log('Vertex token obtained:', !!token);
    
    for (const model of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']) {
      const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/life-observatory-507712/locations/us-central1/publishers/google/models/${model}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Say hello in 3 words' }] }]
        })
      });
      console.log(`Vertex AI ${model}: status ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`Vertex AI ${model} response:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
      } else {
        const errText = await res.text();
        console.log(`Vertex AI ${model} error:`, errText);
      }
    }
  } catch (err) {
    console.error('Vertex test error:', err.message);
  }

  // 2. Test Gemini API with key
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Local GEMINI_API_KEY present:', !!apiKey);
  if (apiKey) {
    for (const model of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model,
          contents: 'Say hello in 3 words'
        });
        console.log(`Gemini API ${model} response:`, res.text);
      } catch (err) {
        console.log(`Gemini API ${model} error:`, err.message);
      }
    }
  }
}

main().catch(console.error);
