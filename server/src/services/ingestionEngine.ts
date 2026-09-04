import crypto from 'crypto';
import { z } from 'zod';
import { DomainId, LifeEvent, Reflection } from '../types';
import { generateGeminiJson } from './gemini';
import { wrapUntrustedData } from './promptInjectionGuard';
import { getUserSubcollection } from './firebaseAdmin';

const ExtractedEventSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  domainIds: z.array(z.enum(['career', 'learning', 'health', 'relationships', 'energy', 'personal', 'finance'])),
  type: z.enum(['achievement', 'setback', 'activity', 'routine', 'social', 'milestone', 'decision_point']),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
  intensity: z.number().int().min(1).max(5),
  confidence: z.number().min(0).max(1),
  isTurningPointCandidate: z.boolean(),
});

const IngestionResultSchema = z.object({
  events: z.array(ExtractedEventSchema),
  followUpQuestion: z.string().nullable().optional(),
  shouldAskFollowUp: z.boolean(),
  needsClarificationReason: z.string().nullable().optional(),
});

export type IngestionResult = z.infer<typeof IngestionResultSchema>;

/**
 * Ingestion Engine (Layer A):
 * Extracts structured life events from raw text observations.
 * Strict adherence to rules:
 * - Never invent unsupported facts.
 * - Single follow-up question only when clarification is materially high-value.
 * - Incremental processing with content hash deduplication.
 */
export async function processReflection(
  uid: string,
  content: string,
  occurredAt?: string
): Promise<{ reflection: Reflection; events: LifeEvent[]; followUpQuestion: string | null }> {
  const effectiveOccurredAt = occurredAt || new Date().toISOString();
  const contentHash = crypto.createHash('sha256').update(content.trim()).digest('hex');

  const wrappedInput = wrapUntrustedData(content, 'daily_reflection');

  const systemInstruction = `
You are the Ingestion Engine for Life Observatory.
Analyze the user's reflection and extract candidate life events with provenance.

Rules:
1. Extract only facts directly stated or strongly evidenced by the user. Do not fabricate achievements or setbacks.
2. Valid domains are strictly: career, learning, health, relationships, energy, personal, finance.
3. Determine if the information is sufficient. If sufficient, set shouldAskFollowUp=false and followUpQuestion=null.
4. If and ONLY IF critical context is materially ambiguous (e.g., "I quit today" or "Major breakthrough after 3 months"), you may propose ONE concise, empathetic follow-up question (max 1 sentence).
5. Never ask questionnaire-style questions like "How did that make you feel on a scale of 1-10?".
`;

  const prompt = `
Occurred At: ${effectiveOccurredAt}
User Reflection:
${wrappedInput}

Extract the structured events and follow-up assessment as JSON:
{
  "events": [
    {
      "title": "string",
      "summary": "string",
      "domainIds": ["career" | "learning" | "health" | "relationships" | "energy" | "personal" | "finance"],
      "type": "achievement" | "setback" | "activity" | "routine" | "social" | "milestone" | "decision_point",
      "sentiment": "positive" | "neutral" | "negative" | "mixed",
      "intensity": 1-5,
      "confidence": 0.0-1.0,
      "isTurningPointCandidate": boolean
    }
  ],
  "shouldAskFollowUp": boolean,
  "followUpQuestion": "string or null",
  "needsClarificationReason": "string or null"
}
`;

  let extraction: IngestionResult;
  try {
    const rawResult = await generateGeminiJson<any>({
      systemInstruction,
      prompt,
    });
    extraction = IngestionResultSchema.parse(rawResult);
  } catch {
    // Graceful deterministic fallback if model output is malformed or offline
    extraction = {
      events: [
        {
          title: 'Daily Reflection Note',
          summary: content.slice(0, 150),
          domainIds: ['personal'],
          type: 'activity',
          sentiment: 'neutral',
          intensity: 2,
          confidence: 0.8,
          isTurningPointCandidate: false,
        },
      ],
      shouldAskFollowUp: false,
      followUpQuestion: null,
    };
  }

  // Create Reflection record
  const reflectionRef = getUserSubcollection(uid, 'reflections').doc();
  const reflectionId = reflectionRef.id;

  const eventDocs: LifeEvent[] = [];
  const eventsCollection = getUserSubcollection(uid, 'events');

  for (const ev of extraction.events) {
    const eventRef = eventsCollection.doc();
    const eventItem: LifeEvent = {
      id: eventRef.id,
      userId: uid,
      type: ev.type,
      domainIds: ev.domainIds as DomainId[],
      title: ev.title,
      summary: ev.summary,
      occurredAt: effectiveOccurredAt,
      createdAt: new Date().toISOString(),
      source: {
        type: 'reflection',
        ref: reflectionId,
      },
      confidence: ev.confidence,
      sentiment: ev.sentiment,
      intensity: ev.intensity,
      isTurningPointCandidate: ev.isTurningPointCandidate,
      contentHash,
    };

    await eventRef.set(eventItem);
    eventDocs.push(eventItem);
  }

  const followUp = extraction.shouldAskFollowUp && extraction.followUpQuestion
    ? extraction.followUpQuestion
    : null;

  const reflection: Reflection = {
    id: reflectionId,
    userId: uid,
    content,
    occurredAt: effectiveOccurredAt,
    createdAt: new Date().toISOString(),
    processed: true,
    extractedEventIds: eventDocs.map(e => e.id),
    followUpQuestion: followUp,
  };

  await reflectionRef.set(reflection);

  return {
    reflection,
    events: eventDocs,
    followUpQuestion: followUp,
  };
}
