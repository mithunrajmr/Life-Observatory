import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { aiRateLimiter, validatePayloadSize } from '../middleware/rateLimit';
import { generateGeminiText } from '../services/gemini';
import { wrapUntrustedData } from '../services/promptInjectionGuard';
import { getUserSubcollection } from '../services/firebaseAdmin';
import { ChatMessage, Conversation, LifeSnapshot } from '../types';

const router = Router();

function isStrategicQuestion(query: string): boolean {
  const lower = query.toLowerCase();
  return (
    lower.includes('how can i grow') ||
    lower.includes('how should i') ||
    lower.includes('what should i do') ||
    lower.includes('strategic advice') ||
    lower.includes('career advice') ||
    lower.includes('options for') ||
    lower.includes('tradeoffs') ||
    lower.includes('what do you recommend') ||
    lower.includes('how to decide')
  );
}

router.post(
  '/',
  requireAuth,
  aiRateLimiter,
  validatePayloadSize(5000),
  async (req: AuthenticatedRequest, res: Response) => {
    const uid = req.user!.uid;
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        error: {
          code: 'EMPTY_MESSAGE',
          message: 'Message cannot be empty.',
        },
      });
      return;
    }

    try {
      const convCol = getUserSubcollection(uid, 'conversations');
      const targetConvId = conversationId || 'active_companion_session';
      const convDocRef = convCol.doc(targetConvId);
      const convSnap = await convDocRef.get();

      let conversation: Conversation;
      if (convSnap.exists) {
        conversation = convSnap.data() as Conversation;
      } else {
        conversation = {
          id: targetConvId,
          userId: uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        };
      }

      // Fetch latest Life Model snapshot for relevant context (not full DB dump)
      const snapshotSnap = await getUserSubcollection(uid, 'snapshots').doc('latest').get();
      const snapshot = snapshotSnap.exists ? (snapshotSnap.data() as LifeSnapshot) : null;

      let contextSummary = 'No prior life model data recorded yet.';
      if (snapshot) {
        const domainTrends = Object.entries(snapshot.domainStates)
          .map(([dom, state]) => `${dom}: ${state.direction} (${state.summary})`)
          .join('; ');
        contextSummary = `Current Life Horizon State: ${domainTrends}`;
      }

      const isAdvisor = isStrategicQuestion(message);

      let systemInstruction = `
You are the companion for Life Observatory.
You have access to the user's recent Life Observatory context:
[Context Summary]: ${contextSummary}

Behavioral Guidelines:
- Tone: Warm, calm, familiar, concise, emotionally aware, honest.
- Do NOT be sycophantic or use fake cheerleading.
- Do NOT claim to be human, conscious, or capable of feeling feelings.
- If you don't have enough evidence or context, simply say "I don't have enough evidence to know yet."
`;

      if (isAdvisor) {
        systemInstruction += `
The user is asking for strategic advice. Switch to Analytical Advisor Behavior.
Do NOT give generic motivational filler.
Structure your reply with the following sections clearly labeled:
1. What I see (based on observed signals)
2. What may be limiting you
3. Options
4. Tradeoffs
5. What I would test next
`;
      } else {
        systemInstruction += `
The user is reflecting or having a conversational exchange.
Keep responses concise, empathetic, and thoughtful. Avoid interrogating with lists of questions. Ask at most one gentle follow-up if helpful.
`;
      }

      // Prepare multi-turn history (last 10 turns)
      const history = conversation.messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const wrappedUserMessage = wrapUntrustedData(message.trim(), 'user_chat_message');

      const replyText = await generateGeminiText({
        systemInstruction,
        prompt: wrappedUserMessage,
        history,
      });

      const userMsg: ChatMessage = {
        id: `msg_u_${Date.now()}`,
        role: 'user',
        content: message.trim(),
        timestamp: new Date().toISOString(),
        mode: isAdvisor ? 'advisor' : 'companion',
      };

      const modelMsg: ChatMessage = {
        id: `msg_m_${Date.now() + 1}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toISOString(),
        mode: isAdvisor ? 'advisor' : 'companion',
      };

      conversation.messages.push(userMsg, modelMsg);
      conversation.updatedAt = new Date().toISOString();

      await convDocRef.set(conversation);

      res.json({
        conversationId: conversation.id,
        reply: modelMsg,
        mode: isAdvisor ? 'advisor' : 'companion',
      });
    } catch (error: any) {
      res.status(500).json({
        error: {
          code: 'CHAT_FAILED',
          message: 'Unable to process conversation at this time.',
        },
      });
    }
  }
);

router.get('/history', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const targetConvId = (req.query.conversationId as string) || 'active_companion_session';

  try {
    const convDoc = await getUserSubcollection(uid, 'conversations').doc(targetConvId).get();
    if (!convDoc.exists) {
      res.json({ messages: [] });
      return;
    }
    const data = convDoc.data() as Conversation;
    res.json({ messages: data.messages || [] });
  } catch {
    res.status(500).json({
      error: {
        code: 'HISTORY_FETCH_FAILED',
        message: 'Could not fetch conversation history.',
      },
    });
  }
});

export default router;
