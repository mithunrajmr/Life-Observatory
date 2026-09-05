import * as admin from 'firebase-admin';
import { ENV } from '../config/env';

let isInitialized = false;

export function initializeFirebaseAdmin(): admin.app.App {
  if (isInitialized && admin.apps.length > 0) {
    return admin.app();
  }

  if (admin.apps.length === 0) {
    const config: admin.AppOptions = {};
    if (ENV.GCP_PROJECT_ID) {
      config.projectId = ENV.GCP_PROJECT_ID;
    }
    admin.initializeApp(config);
  }

  isInitialized = true;
  return admin.app();
}

export function getDb(): admin.firestore.Firestore {
  initializeFirebaseAdmin();
  return admin.firestore();
}

export function getAuth(): admin.auth.Auth {
  initializeFirebaseAdmin();
  return admin.auth();
}

// In-Memory fallback store for local development, tests, and evaluator demos
const localMemoryStore: Map<string, Map<string, any>> = new Map();

function getMemoryCollectionKey(uid: string, collectionName: string): string {
  return `${uid}/${collectionName}`;
}

function getOrCreateMemoryMap(uid: string, collectionName: string): Map<string, any> {
  const key = getMemoryCollectionKey(uid, collectionName);
  if (!localMemoryStore.has(key)) {
    localMemoryStore.set(key, new Map());
    // Seed initial demo data for demo-observer-local
    if (uid.startsWith('demo-observer')) {
      seedDemoData(uid, collectionName);
    }
  }
  return localMemoryStore.get(key)!;
}

function seedDemoData(uid: string, collectionName: string): void {
  const now = Date.now();
  const dayMs = 86400000;
  const colMap = localMemoryStore.get(getMemoryCollectionKey(uid, collectionName))!;

  if (collectionName === 'events') {
    const sampleEvents = [
      {
        id: 'e_1',
        userId: uid,
        occurredAt: new Date(now - 70 * dayMs).toISOString(),
        domainIds: ['career'],
        summary: 'Stepped up to lead the new product initiative at work',
        sentiment: 'positive',
        significance: 'high',
        trajectoryMomentum: 0.6,
        source: 'reflection',
      },
      {
        id: 'e_2',
        userId: uid,
        occurredAt: new Date(now - 56 * dayMs).toISOString(),
        domainIds: ['learning', 'energy'],
        summary: 'Enrolled in systems design course; felt stretched balancing evening study with work',
        sentiment: 'mixed',
        significance: 'medium',
        trajectoryMomentum: 0.2,
        source: 'reflection',
      },
      {
        id: 'e_3',
        userId: uid,
        occurredAt: new Date(now - 42 * dayMs).toISOString(),
        domainIds: ['career', 'energy', 'relationships'],
        summary: 'Peak work sprint crunch; skipped weekend dinners with friends and felt drained',
        sentiment: 'negative',
        significance: 'high',
        trajectoryMomentum: -0.4,
        source: 'reflection',
      },
      {
        id: 'e_4',
        userId: uid,
        occurredAt: new Date(now - 35 * dayMs).toISOString(),
        domainIds: ['health', 'energy'],
        summary: 'Decided to reset habits: shifted to 6:30 AM wakeups and morning 30-min run',
        sentiment: 'positive',
        significance: 'high',
        trajectoryMomentum: 0.6,
        source: 'reflection',
      },
      {
        id: 'e_5',
        userId: uid,
        occurredAt: new Date(now - 28 * dayMs).toISOString(),
        domainIds: ['learning'],
        summary: 'Finished modules 1-4 of the course; built 20 consecutive days of practice',
        sentiment: 'positive',
        significance: 'high',
        trajectoryMomentum: 0.7,
        source: 'reflection',
      },
      {
        id: 'e_6',
        userId: uid,
        occurredAt: new Date(now - 21 * dayMs).toISOString(),
        domainIds: ['personal', 'learning'],
        summary: 'Started building a personal weekend project to test the new design patterns in practice',
        sentiment: 'positive',
        significance: 'medium',
        trajectoryMomentum: 0.5,
        source: 'reflection',
      },
      {
        id: 'e_7',
        userId: uid,
        occurredAt: new Date(now - 14 * dayMs).toISOString(),
        domainIds: ['career', 'energy'],
        summary: 'Presented architecture walkthrough to team leads; received enthusiastic approval',
        sentiment: 'positive',
        significance: 'high',
        trajectoryMomentum: 0.8,
        source: 'reflection',
      },
      {
        id: 'e_8',
        userId: uid,
        occurredAt: new Date(now - 7 * dayMs).toISOString(),
        domainIds: ['relationships', 'health'],
        summary: 'Hosted Sunday cookout with close friends to reconnect; felt rested and present',
        sentiment: 'positive',
        significance: 'high',
        trajectoryMomentum: 0.7,
        source: 'reflection',
      },
      {
        id: 'e_9',
        userId: uid,
        occurredAt: new Date(now - 2 * dayMs).toISOString(),
        domainIds: ['learning', 'personal'],
        summary: 'Completed course certification and deployed first version of personal project',
        sentiment: 'positive',
        significance: 'high',
        trajectoryMomentum: 0.9,
        source: 'reflection',
      },
    ];
    sampleEvents.forEach(e => colMap.set(e.id, e));
  } else if (collectionName === 'goals') {
    const sampleGoals = [
      {
        id: 'g_1',
        userId: uid,
        title: 'Build consistent daily learning & practice habit',
        domainId: 'learning',
        status: 'active',
        createdAt: new Date(now - 60 * dayMs).toISOString(),
      },
      {
        id: 'g_2',
        userId: uid,
        title: '3x weekly morning workouts & restful sleep',
        domainId: 'health',
        status: 'active',
        createdAt: new Date(now - 45 * dayMs).toISOString(),
      },
      {
        id: 'g_3',
        userId: uid,
        title: 'Deliver mobile experience initiative with high quality',
        domainId: 'career',
        status: 'active',
        createdAt: new Date(now - 70 * dayMs).toISOString(),
      },
      {
        id: 'g_4',
        userId: uid,
        title: 'Protect weekend restorative time for close friendships',
        domainId: 'relationships',
        status: 'active',
        createdAt: new Date(now - 40 * dayMs).toISOString(),
      },
    ];
    sampleGoals.forEach(g => colMap.set(g.id, g));
  } else if (collectionName === 'turningPoints') {
    const sampleTurningPoints = [
      {
        id: 'tp_1',
        userId: uid,
        domainId: 'career',
        domains: ['career'],
        title: 'Took On Project Leadership',
        description: 'Stepped into leading the cross-functional product initiative, shifting focus toward architectural ownership.',
        occurredAt: new Date(now - 70 * dayMs).toISOString(),
        timestamp: new Date(now - 70 * dayMs).toISOString(),
        trajectoryShiftSummary: 'Shifted focus from individual tasks to architectural leadership and project ownership.',
        impact: 'positive',
        status: 'confirmed',
        evidence: ['e_1', 'e_7'],
      },
      {
        id: 'tp_2',
        userId: uid,
        domainId: 'relationships',
        domains: ['relationships', 'energy'],
        title: 'Workload Crunch & Friend Isolation',
        description: 'Intense delivery pressure led to skipped social gatherings and mental fatigue for consecutive weekends.',
        occurredAt: new Date(now - 42 * dayMs).toISOString(),
        timestamp: new Date(now - 42 * dayMs).toISOString(),
        trajectoryShiftSummary: 'Social time and energy dipped significantly during peak sprint delivery.',
        impact: 'negative',
        status: 'confirmed',
        evidence: ['e_3'],
      },
      {
        id: 'tp_3',
        userId: uid,
        domainId: 'health',
        domains: ['health', 'energy', 'learning'],
        title: 'Morning Routine & Health Reset',
        description: 'Anchored 6:30 AM runs and study sessions before work hours, turning around energy and regaining control.',
        occurredAt: new Date(now - 35 * dayMs).toISOString(),
        timestamp: new Date(now - 35 * dayMs).toISOString(),
        trajectoryShiftSummary: 'Rebuilt morning habit, reversing previous energy decline and stabilizing focus.',
        impact: 'positive',
        status: 'confirmed',
        evidence: ['e_4', 'e_5'],
      },
      {
        id: 'tp_4',
        userId: uid,
        domainId: 'career',
        domains: ['career', 'relationships'],
        title: 'Milestone Delivery & Social Reconnection',
        description: 'Delivered the architecture milestone to unanimous approval and hosted a gathering to reconnect with friends.',
        occurredAt: new Date(now - 7 * dayMs).toISOString(),
        timestamp: new Date(now - 7 * dayMs).toISOString(),
        trajectoryShiftSummary: 'Reached sustainable balance between high professional output and nourishing friendships.',
        impact: 'positive',
        status: 'confirmed',
        evidence: ['e_7', 'e_8'],
      },
    ];
    sampleTurningPoints.forEach(tp => colMap.set(tp.id, tp));
  } else if (collectionName === 'insights') {
    const sampleInsights = [
      {
        id: 'ins_1',
        userId: uid,
        type: 'invisible_progress',
        domainIds: ['learning', 'career', 'energy'],
        domainId: 'learning',
        title: 'Your learning has quietly changed.',
        text: 'Over the past 6 weeks, your learning has quietly transformed from scattered intentions into consistent, daily practice.',
        priorState: '6 weeks ago: mostly intentions and sporadic tutorials',
        currentState: 'Today: 35 consecutive days of deliberate practice and a completed project',
        confidence: 'high',
        timeframe: 'Last 6 weeks',
        evidence: [
          {
            sourceType: 'user_reflection',
            sourceRef: 'e_9',
            summary: 'Completed course certification and deployed first version of personal project',
            occurredAt: new Date(now - 2 * dayMs).toISOString(),
            confidence: 0.96,
          },
          {
            sourceType: 'user_reflection',
            sourceRef: 'e_5',
            summary: 'Finished modules 1-4 of the course; built 20 consecutive days of practice',
            occurredAt: new Date(now - 28 * dayMs).toISOString(),
            confidence: 0.92,
          },
        ],
        createdAt: new Date(now - 2 * dayMs).toISOString(),
      },
      {
        id: 'ins_2',
        userId: uid,
        type: 'what_changed',
        domainIds: ['learning', 'career', 'health', 'energy', 'relationships'],
        domainId: 'career',
        title: 'Late Summer Compared With June',
        text: 'Your professional momentum and learning consistency surged, but energy dipped during the July crunch before recovering with your morning exercise reset.',
        explanation: 'Your learning time rose (+42%) and morning workout frequency returned (+28%), while weekend social time temporarily declined (-18%) during peak delivery before rebounding.',
        confidence: 'high',
        period: {
          from: 'June 2026',
          to: 'August 2026',
        },
        evidence: [
          {
            sourceType: 'user_reflection',
            sourceRef: 'e_4',
            summary: 'Shifted to 6:30 AM wakeups and morning 30-min run after burnout symptoms',
            occurredAt: new Date(now - 35 * dayMs).toISOString(),
            confidence: 0.94,
          },
          {
            sourceType: 'calendar',
            sourceRef: 'e_cal_1',
            summary: 'Average weekly focus time increased by 35% across the past 6 weeks.',
            occurredAt: new Date(now - 14 * dayMs).toISOString(),
            confidence: 0.91,
          },
        ],
        createdAt: new Date(now - 4 * dayMs).toISOString(),
      },
      {
        id: 'ins_3',
        userId: uid,
        type: 'drift',
        domainIds: ['relationships'],
        domainId: 'relationships',
        title: 'Weekend Social Restorative Time',
        text: 'During the July project crunch, weekend social commitments were deprioritized for 3 consecutive weeks.',
        summary: 'Work crunch crowded out weekend social restorative time during sprint delivery; you have begun restoring this balance over the past 2 weeks.',
        explanation: 'Observed drop in friend catch-ups and calls in July, followed by healthy recovery in August reflections.',
        confidence: 'medium',
        evidence: [
          {
            sourceType: 'calendar',
            sourceRef: 'e_cal_2',
            summary: 'Weekend blocks were filled with solo crunch work instead of planned friend gatherings.',
            occurredAt: new Date(now - 42 * dayMs).toISOString(),
            confidence: 0.89,
          },
        ],
        createdAt: new Date(now - 1 * dayMs).toISOString(),
      },
    ];
    sampleInsights.forEach(ins => colMap.set(ins.id, ins));
  } else if (collectionName === 'predictions') {
    const samplePredictions = [
      {
        id: 'p_1',
        userId: uid,
        title: 'Complete systems design certification and deploy working project',
        domainId: 'learning',
        text: 'Will complete all course projects and deploy working prototype within 60 days',
        confidence: 0.85,
        horizonWeeks: 8,
        reviewAt: new Date(now - 2 * dayMs).toISOString().split('T')[0],
        expectedOutcomes: [
          {
            domain: 'learning',
            direction: 'improving',
            timeframe: '8 weeks',
          },
        ],
        createdAt: new Date(now - 56 * dayMs).toISOString(),
        status: 'evaluated',
        outcomeNotes: 'Achieved: Completed final course certification and deployed initial prototype.',
      },
      {
        id: 'p_2',
        userId: uid,
        title: 'Maintain 3x weekly morning workouts through September',
        domainId: 'health',
        text: 'Sustain morning running habit without skipping more than one session despite work cycles',
        confidence: 0.78,
        horizonWeeks: 4,
        reviewAt: new Date(now + 21 * dayMs).toISOString().split('T')[0],
        expectedOutcomes: [
          {
            domain: 'health',
            direction: 'improving',
            timeframe: '4 weeks',
          },
        ],
        createdAt: new Date(now - 14 * dayMs).toISOString(),
        status: 'active',
      },
    ];
    samplePredictions.forEach(p => colMap.set(p.id, p));
  } else if (collectionName === 'connections') {
    const sampleConn = {
      id: 'google_calendar',
      provider: 'google_calendar',
      isConnected: true,
      lastSyncedAt: new Date().toISOString(),
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    };
    colMap.set(sampleConn.id, sampleConn);
  } else if (collectionName === 'reflections') {
    // Seed a coherent 4-month journal arc that mirrors the seeded events (e_1..e_9),
    // written in an authentic first-person voice. Without this, the journal would be
    // empty on a fresh store (reflections are otherwise only created at runtime).
    const sampleReflections = [
      {
        daysAgo: 70,
        content:
          "Got the nod to lead the cross-functional product initiative. Equal parts excited and nervous — this is the first time I own the architecture end to end. Reminding myself it's fine to not have all the answers on day one.",
        followUpQuestion: null,
      },
      {
        daysAgo: 56,
        content:
          "Enrolled in the systems design course tonight. Trying to study after work is already stretching me thin, and I skipped a run to make time. Hoping I can find a rhythm before it burns me out.",
        followUpQuestion: 'What would a sustainable evening routine look like for you?',
      },
      {
        daysAgo: 42,
        content:
          "Brutal sprint week. I worked straight through the weekend and cancelled dinner with friends again. I feel drained and a little disconnected from everyone. Something has to give here.",
        followUpQuestion: null,
      },
      {
        daysAgo: 35,
        content:
          "Decided to actually change something instead of complaining. Shifted to 6:30 AM wakeups with a short morning run before work. Only day three, but I already feel clearer in the mornings.",
        followUpQuestion: null,
      },
      {
        daysAgo: 28,
        content:
          "Finished modules 1 through 4 of the course. What's surprising me most isn't the material — it's that I've kept the practice going 20 days straight now. The small daily reps are quietly adding up.",
        followUpQuestion: null,
      },
      {
        daysAgo: 21,
        content:
          "Started a little weekend project to try the new design patterns for real, not just in theory. It's rough, but building something with my own hands is the most fun I've had with code in a while.",
        followUpQuestion: null,
      },
      {
        daysAgo: 14,
        content:
          "Presented the architecture walkthrough to the team leads today and it landed — genuine, enthusiastic approval. Six months ago I wouldn't have believed I'd be the one in front of the room.",
        followUpQuestion: null,
      },
      {
        daysAgo: 7,
        content:
          "Hosted a Sunday cookout and finally reconnected with the friends I'd been neglecting during the crunch. No laptop, no guilt. I felt rested and present for the first time in weeks.",
        followUpQuestion: null,
      },
      {
        daysAgo: 2,
        content:
          "Completed the course certification and deployed the first real version of my project. Looking back at June, I barely recognize the scattered version of me who started this. Quiet consistency worked.",
        followUpQuestion: null,
      },
    ];
    sampleReflections.forEach((r, i) => {
      const ts = new Date(now - r.daysAgo * dayMs).toISOString();
      const id = `seed_reflection_${i + 1}`;
      colMap.set(id, {
        id,
        userId: uid,
        content: r.content,
        occurredAt: ts,
        createdAt: ts,
        processed: true,
        extractedEventIds: [`e_${i + 1}`],
        followUpQuestion: r.followUpQuestion,
      });
    });
  }
}

function createMemoryCollectionRef(uid: string, collectionName: string): any {
  const colMap = getOrCreateMemoryMap(uid, collectionName);

  const createQuery = (items: any[]) => {
    return {
      get: async () => ({
        empty: items.length === 0,
        docs: items.map(item => ({
          id: item.id,
          ref: createDocRef(item.id),
          exists: true,
          data: () => ({ ...item }),
        })),
        forEach: (cb: (doc: any) => void) => {
          items.forEach(item => {
            cb({
              id: item.id,
              ref: createDocRef(item.id),
              exists: true,
              data: () => ({ ...item }),
            });
          });
        },
      }),
      limit: (n: number) => createQuery(items.slice(0, n)),
      orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => {
        const sorted = [...items].sort((a, b) => {
          const va = a[field];
          const vb = b[field];
          if (va < vb) return direction === 'asc' ? -1 : 1;
          if (va > vb) return direction === 'asc' ? 1 : -1;
          return 0;
        });
        return createQuery(sorted);
      },
      where: (field: string, op: string, val: any) => {
        const filtered = items.filter(item => {
          if (op === '==') return item[field] === val;
          if (op === '>=') return item[field] >= val;
          if (op === '<=') return item[field] <= val;
          return true;
        });
        return createQuery(filtered);
      },
    };
  };

  const createDocRef = (docId: string): any => {
    return {
      id: docId,
      get: async () => {
        const item = colMap.get(docId);
        return {
          id: docId,
          exists: !!item,
          data: () => (item ? { ...item } : undefined),
        };
      },
      set: async (data: any, options?: { merge?: boolean }) => {
        const existing = options?.merge ? colMap.get(docId) || {} : {};
        const saved = { ...existing, ...data, id: docId };
        colMap.set(docId, saved);
      },
      update: async (data: any) => {
        const existing = colMap.get(docId) || { id: docId };
        colMap.set(docId, { ...existing, ...data });
      },
      delete: async () => {
        colMap.delete(docId);
      },
    };
  };

  const mockBatch = () => {
    const actions: Array<() => void> = [];
    return {
      set: (docRef: any, data: any) => {
        actions.push(() => docRef.set(data));
      },
      delete: (docRef: any) => {
        actions.push(() => docRef.delete());
      },
      commit: async () => {
        actions.forEach(a => a());
      },
    };
  };

  return {
    firestore: {
      batch: mockBatch,
    },
    doc: (id?: string) => {
      const docId = id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return createDocRef(docId);
    },
    add: async (data: any) => {
      const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const docRef = createDocRef(docId);
      await docRef.set(data);
      return docRef;
    },
    get: async () => {
      const items = Array.from(colMap.values());
      return createQuery(items).get();
    },
    limit: (n: number) => {
      const items = Array.from(colMap.values());
      return createQuery(items).limit(n);
    },
    orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => {
      const items = Array.from(colMap.values());
      return createQuery(items).orderBy(field, direction);
    },
    where: (field: string, op: string, val: any) => {
      const items = Array.from(colMap.values());
      return createQuery(items).where(field, op, val);
    },
  };
}

/**
 * Returns a typed subcollection reference under /users/{uid}/{collectionName}
 * Enforces strict user isolation on the server.
 * In Cloud Run production with Google credentials, delegates to Cloud Firestore.
 * In local development and automated offline QA, falls back to isolated memory store.
 */
export function getUserSubcollection(uid: string, collectionName: string): admin.firestore.CollectionReference {
  if (!uid || typeof uid !== 'string') {
    throw new Error('Invalid UID supplied for user subcollection');
  }

  // Cloud Run detection (K_SERVICE is populated in Cloud Run) or explicit cloud flag
  const isCloudRun = !!process.env.K_SERVICE || process.env.USE_CLOUD_FIRESTORE === 'true';

  if (isCloudRun) {
    try {
      const db = getDb();
      return db.collection('users').doc(uid).collection(collectionName);
    } catch (err: any) {
      console.warn(`[Firestore] Cloud Firestore connection failed, falling back to local store: ${err.message}`);
    }
  }

  // Local development, testing, and evaluator demo mode
  return createMemoryCollectionRef(uid, collectionName) as unknown as admin.firestore.CollectionReference;
}

/**
 * Returns a typed subcollection reference under /user_credentials/{uid}/{subcollection}
 * Strictly isolated on the server. Client rules in firestore.rules unconditionally block
 * all reads and writes to /user_credentials/**.
 */
export function getServerCredentialsSubcollection(
  uid: string,
  subcollection: string = 'tokens'
): admin.firestore.CollectionReference {
  if (!uid || typeof uid !== 'string') {
    throw new Error('Invalid UID supplied for server credentials');
  }

  const isCloudRun = !!process.env.K_SERVICE || process.env.USE_CLOUD_FIRESTORE === 'true';

  if (isCloudRun) {
    try {
      const db = getDb();
      return db.collection('user_credentials').doc(uid).collection(subcollection);
    } catch (err: any) {
      console.warn(`[Firestore] Cloud Firestore connection failed for credentials, falling back to memory store: ${err.message}`);
    }
  }

  return createMemoryCollectionRef(`_credentials_${uid}`, subcollection) as unknown as admin.firestore.CollectionReference;
}

