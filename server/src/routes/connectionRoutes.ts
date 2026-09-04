import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getUserSubcollection } from '../services/firebaseAdmin';
import { GoogleCalendarAdapter } from '../services/calendarAdapter';
import { computeLifeHorizon } from '../services/lifeModelEngine';
import { Connection } from '../types';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;

  try {
    const connCol = getUserSubcollection(uid, 'connections');
    const snap = await connCol.get();
    const connections: Connection[] = [];
    snap.forEach(d => connections.push(d.data() as Connection));
    res.json({ connections });
  } catch {
    res.status(500).json({ error: { code: 'FETCH_CONNECTIONS_FAILED', message: 'Failed to fetch connections.' } });
  }
});

/**
 * Sync Google Calendar events into Life Model
 */
router.post('/google_calendar/sync', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const { accessToken } = req.body;

  try {
    const adapter = new GoogleCalendarAdapter();
    const rawEvents = await adapter.fetchRecentEvents(uid, accessToken);
    const lifeEvents = adapter.normalizeToLifeEvents(uid, rawEvents);

    const eventsCol = getUserSubcollection(uid, 'events');
    for (const ev of lifeEvents) {
      await eventsCol.doc(ev.id).set(ev);
    }

    // Update connection status
    const connRef = getUserSubcollection(uid, 'connections').doc('google_calendar');
    const connRecord: Connection = {
      id: 'google_calendar',
      userId: uid,
      provider: 'google_calendar',
      status: 'connected',
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      lastSyncAt: new Date().toISOString(),
      itemCount: lifeEvents.length,
    };
    await connRef.set(connRecord);

    // Recompute Life Horizon with new calendar events
    const snapshot = await computeLifeHorizon(uid);

    res.json({
      success: true,
      syncedCount: lifeEvents.length,
      connection: connRecord,
      snapshot,
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'CALENDAR_SYNC_FAILED',
        message: error.message || 'Unable to sync Google Calendar.',
      },
    });
  }
});

/**
 * Disconnect and delete source-derived records
 */
router.delete('/:provider/data', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;
  const provider = (Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider) as string;

  try {
    // 1. Delete events originating from this source
    const eventsCol = getUserSubcollection(uid, 'events');
    const eventsSnap = await eventsCol.where('source.type', '==', provider === 'google_calendar' ? 'calendar' : provider).get();
    
    const batch = eventsCol.firestore.batch();
    eventsSnap.forEach(d => batch.delete(d.ref));
    await batch.commit();

    // 2. Mark connection as disconnected
    const connRef = getUserSubcollection(uid, 'connections').doc(provider);
    await connRef.update({ status: 'disconnected', itemCount: 0 });

    // 3. Recompute Life Horizon without the deleted source events
    await computeLifeHorizon(uid);

    res.json({ success: true, message: `Derived data for ${provider} successfully deleted.` });
  } catch {
    res.status(500).json({ error: { code: 'DATA_DELETION_FAILED', message: 'Failed to delete source-derived data.' } });
  }
});

/**
 * Complete Data Erasure (Privacy Rights / Delete All My Data)
 */
router.delete('/user/all-data', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid;

  const collections = [
    'reflections',
    'events',
    'conversations',
    'goals',
    'decisions',
    'predictions',
    'outcomes',
    'patterns',
    'turningPoints',
    'evidence',
    'insights',
    'snapshots',
    'connections',
  ];

  try {
    for (const colName of collections) {
      const col = getUserSubcollection(uid, colName);
      const snap = await col.get();
      const batch = col.firestore.batch();
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }

    res.json({ success: true, message: 'All user Life Observatory data has been permanently deleted.' });
  } catch {
    res.status(500).json({ error: { code: 'ERASURE_FAILED', message: 'Could not complete data erasure.' } });
  }
});

export default router;
