# Life Model Schema Specification

The Life Model is a structured, longitudinal representation of a user's life stored in isolated Firestore subcollections under `/users/{uid}/`.

## Subcollections

### 1. `reflections` (`/users/{uid}/reflections/{id}`)
- `id`: string
- `userId`: string (verified UID)
- `content`: string (raw input)
- `occurredAt`: string (ISO 8601)
- `createdAt`: string (ISO 8601)
- `processed`: boolean
- `extractedEventIds`: string[]

### 2. `events` (`/users/{uid}/events/{id}`)
- `id`: string
- `userId`: string
- `type`: 'achievement' | 'setback' | 'activity' | 'routine' | 'social' | 'milestone'
- `domainIds`: string[] (e.g. `['career', 'learning', 'health', 'relationships', 'energy', 'personal', 'finance']`)
- `title`: string
- `summary`: string
- `occurredAt`: string (ISO 8601)
- `source`:
  - `type`: 'reflection' | 'calendar' | 'conversation'
  - `ref`: string
- `confidence`: number (0.0 - 1.0)
- `sentiment`: 'positive' | 'neutral' | 'negative' | 'mixed'
- `intensity`: number (1 - 5)
- `isTurningPointCandidate`: boolean

### 3. `conversations` (`/users/{uid}/conversations/{id}`)
- `id`: string
- `userId`: string
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)
- `messages`: Array<{
    `id`: string;
    `role`: 'user' | 'model';
    `content`: string;
    `timestamp`: string;
    `extractedSignals`?: string[];
  }>

### 4. `goals` (`/users/{uid}/goals/{id}`)
- `id`: string
- `userId`: string
- `title`: string
- `domainId`: string
- `status`: 'active' | 'completed' | 'paused' | 'archived'
- `targetDate`?: string
- `createdAt`: string
- `updatedAt`: string
- `evidenceRefs`: string[]

### 5. `decisions` (`/users/{uid}/decisions/{id}`)
- `id`: string
- `userId`: string
- `title`: string
- `options`: string[]
- `chosenOption`?: string
- `factors`: string[]
- `createdAt`: string
- `status`: 'pending' | 'decided' | 'reviewed'

### 6. `predictions` (`/users/{uid}/predictions/{id}`)
- `id`: string
- `userId`: string
- `decisionId`?: string
- `title`: string
- `expectedOutcomes`: Array<{
    `domain`: string;
    `direction`: 'up' | 'down' | 'stable';
    `confidence`: number;
    `timeframe`: string;
  }>
- `reviewAt`: string
- `status`: 'active' | 'evaluated'
- `actualOutcomeId`?: string

### 7. `outcomes` (`/users/{uid}/outcomes/{id}`)
- `id`: string
- `userId`: string
- `predictionId`: string
- `actualOutcomes`: Array<{
    `domain`: string;
    `observedDirection`: 'up' | 'down' | 'stable';
    `notes`: string;
  }>
- `alignmentScore`: number (0.0 - 1.0)
- `userReflection`: string
- `evaluatedAt`: string

### 8. `patterns` (`/users/{uid}/patterns/{id}`)
- `id`: string
- `userId`: string
- `title`: string
- `description`: string
- `domainIds`: string[]
- `frequency`: string
- `evidenceRefs`: string[]
- `firstDetectedAt`: string
- `lastObservedAt`: string

### 9. `turningPoints` (`/users/{uid}/turningPoints/{id}`)
- `id`: string
- `userId`: string
- `eventId`: string
- `title`: string
- `description`: string
- `occurredAt`: string
- `status`: 'candidate' | 'confirmed' | 'rejected'
- `trajectoryShiftSummary`: string
- `evidenceRefs`: string[]

### 10. `insights` (`/users/{uid}/insights/{id}`)
- `id`: string
- `userId`: string
- `type`: 'invisible_progress' | 'what_changed' | 'drift' | 'turning_point' | 'pattern' | 'stagnation'
- `title`: string
- `summary`: string
- `explanation`: string
- `domainIds`: string[]
- `fingerprint`: string (for deduplication)
- `period`: {
    `from`: string;
    `to`: string;
  }
- `confidence`: 'high' | 'medium' | 'low' | 'insufficient_evidence'
- `evidence`: Array<{
    `sourceType`: string;
    `sourceRef`: string;
    `occurredAt`: string;
    `summary`: string;
  }>
- `createdAt`: string

### 11. `snapshots` (`/users/{uid}/snapshots/{id}`)
- `id`: string
- `userId`: string
- `period`: {
    `from`: string;
    `to`: string;
  }
- `domainStates`: Record<string, {
    `direction`: 'up' | 'down' | 'stable' | 'emerging' | 'mixed' | 'insufficient_evidence';
    `trendScore`: number; // -1.0 to 1.0
    `eventCount`: number;
    `confidence`: 'high' | 'medium' | 'low' | 'insufficient_evidence';
    `points`: Array<{ date: string; value: number }>;
  }>
- `turningPointIds`: string[]
- `insightIds`: string[]
- `createdAt`: string

### 12. `connections` (`/users/{uid}/connections/{id}`)
- `id`: string (e.g. 'google_calendar')
- `userId`: string
- `provider`: 'google_calendar' | 'local_demo'
- `status`: 'connected' | 'disconnected'
- `scopes`: string[]
- `lastSyncAt`: string
