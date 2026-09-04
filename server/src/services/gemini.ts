import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '../config/secrets';
import { ENV } from '../config/env';
import { INJECTION_SYSTEM_GUARD } from './promptInjectionGuard';

let aiClient: GoogleGenAI | null = null;
let lastApiKey: string = '';

async function getClient(): Promise<GoogleGenAI> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  if (!aiClient || lastApiKey !== apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
    lastApiKey = apiKey;
  }

  return aiClient;
}

/**
 * Robust text generation supporting multi-turn conversations and system instructions.
 */
export async function generateGeminiText(params: {
  model?: string;
  systemInstruction?: string;
  prompt: string;
  history?: Array<{ role: 'user' | 'model'; content: string }>;
}): Promise<string> {
  const modelName = params.model || ENV.CONVERSATION_MODEL;
  const apiKey = await getGeminiApiKey();

  const fullSystemInstruction = `${INJECTION_SYSTEM_GUARD}\n${params.systemInstruction || ''}`.trim();

  // If apiKey is empty (e.g. In mock test mode), return clean fallback
  if (!apiKey) {
    if (process.env.NODE_ENV === 'test') {
      return 'Test response: Gemini text generation verified.';
    }
    throw new Error('Gemini API key is not configured.');
  }

  try {
    const client = await getClient();
    
    // Prepare contents array
    const contents: any[] = [];
    if (params.history && params.history.length > 0) {
      for (const msg of params.history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: params.prompt }],
    });

    const response = await client.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
      },
    });

    return response.text?.trim() || '';
  } catch (error: any) {
    // REST API fallback for ultra-resilience
    try {
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const payload = {
        systemInstruction: {
          parts: [{ text: fullSystemInstruction }],
        },
        contents: [
          ...(params.history || []).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
          { role: 'user', parts: [{ text: params.prompt }] },
        ],
      };

      const restRes = await fetch(restUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!restRes.ok) {
        const errText = await restRes.text();
        throw new Error(`Gemini REST error (${restRes.status}): ${errText}`);
      }

      const restData: any = await restRes.json();
      const text = restData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (restErr: any) {
      console.error('[Gemini Service Error]', restErr.message);
    }

    throw new Error('Unable to generate response from Gemini at this moment.');
  }
}

/**
 * Robust JSON extraction ensuring strict JSON schema adherence.
 */
export async function generateGeminiJson<T>(params: {
  model?: string;
  systemInstruction?: string;
  prompt: string;
  jsonSchema?: Record<string, any>;
}): Promise<T> {
  const modelName = params.model || ENV.EXTRACTION_MODEL;
  const apiKey = await getGeminiApiKey();

  const fullSystemInstruction = `${INJECTION_SYSTEM_GUARD}\n${params.systemInstruction || ''}\nYou MUST return ONLY a valid, parseable JSON object matching the requested schema. Do not enclose in markdown ticks if possible, or return strictly valid JSON.`.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV === 'test') {
      return {} as T;
    }
    throw new Error('Gemini API key is not configured.');
  }

  try {
    const client = await getClient();
    const config: any = {
      systemInstruction: fullSystemInstruction,
      responseMimeType: 'application/json',
    };
    if (params.jsonSchema) {
      config.responseSchema = params.jsonSchema;
    }

    const response = await client.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
      config,
    });

    const rawText = response.text || '{}';
    return cleanAndParseJson<T>(rawText);
  } catch (error: any) {
    // REST API fallback
    try {
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const payload: any = {
        systemInstruction: {
          parts: [{ text: fullSystemInstruction }],
        },
        contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      };

      const restRes = await fetch(restUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (restRes.ok) {
        const restData: any = await restRes.json();
        const text = restData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return cleanAndParseJson<T>(text);
        }
      }
    } catch {
      // Ignored
    }

    throw new Error('Failed to parse structured response from Gemini.');
  }
}

function cleanAndParseJson<T>(raw: string): T {
  let cleaned = raw.trim();
  // Strip ```json and ``` if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return JSON.parse(cleaned);
}
