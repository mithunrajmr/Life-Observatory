import { Router, Request, Response } from 'express';
import { ENV } from '../config/env';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'life-observatory-api',
    environment: ENV.NODE_ENV,
    models: {
      conversation: ENV.CONVERSATION_MODEL,
      extraction: ENV.EXTRACTION_MODEL,
      insight: ENV.INSIGHT_MODEL,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
