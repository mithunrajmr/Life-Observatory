export type DomainId = 
  | 'career' 
  | 'learning' 
  | 'health' 
  | 'relationships' 
  | 'energy' 
  | 'personal' 
  | 'finance';

export interface LifeDomainConfig {
  id: DomainId;
  name: string;
  description: string;
  color: string;
  defaultActive: boolean;
}

export const DOMAIN_CONFIGS: Record<DomainId, LifeDomainConfig> = {
  career: { id: 'career', name: 'Career & Work', description: 'Professional progress & projects', color: '#3A5A78', defaultActive: true },
  learning: { id: 'learning', name: 'Learning & Skills', description: 'Acquiring knowledge & capabilities', color: '#355C4A', defaultActive: true },
  health: { id: 'health', name: 'Health & Fitness', description: 'Physical energy, workouts, sleep', color: '#D96B43', defaultActive: true },
  relationships: { id: 'relationships', name: 'Relationships', description: 'Family, friends & community', color: '#7A5B82', defaultActive: true },
  energy: { id: 'energy', name: 'Energy & Wellbeing', description: 'Mental clarity & stamina', color: '#C58A45', defaultActive: true },
  personal: { id: 'personal', name: 'Personal Projects', description: 'Creative pursuits & hobbies', color: '#4A7C59', defaultActive: true },
  finance: { id: 'finance', name: 'Financial Wellbeing', description: 'Budgeting & financial milestones', color: '#2E6F54', defaultActive: true },
};

export type TrendDirection = 
  | 'up' 
  | 'down' 
  | 'stable' 
  | 'emerging' 
  | 'mixed' 
  | 'insufficient_evidence'
  | 'sustained_up'
  | 'sustained_down';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'insufficient_evidence';

export interface EvidenceItem {
  sourceType: 'user_reflection' | 'calendar' | 'conversation' | 'user_correction';
  sourceRef: string;
  occurredAt: string;
  summary: string;
  confidence: number;
}

export interface LifeInsight {
  id: string;
  userId: string;
  type: 'invisible_progress' | 'what_changed' | 'drift' | 'turning_point' | 'pattern' | 'stagnation' | 'progress';
  title: string;
  summary: string;
  explanation: string;
  domainIds: DomainId[];
  domainId?: DomainId;
  fingerprint?: string;
  period?: { from: string; to: string };
  timeframe?: string;
  text?: string;
  magnitude?: string;
  confidence: ConfidenceLevel;
  evidence: EvidenceItem[];
  priorState?: string;
  currentState?: string;
  createdAt: string;
}

export interface DomainTrajectoryPoint {
  date: string;
  value: number; // -1.0 to 1.0
  eventCount: number;
}

export interface DomainState {
  domainId: DomainId;
  direction: TrendDirection;
  trendScore: number;
  eventCount: number;
  confidence: ConfidenceLevel;
  points: DomainTrajectoryPoint[];
  summary: string;
}

export interface TurningPoint {
  id: string;
  userId: string;
  eventId?: string;
  title: string;
  description: string;
  occurredAt?: string;
  timestamp?: string;
  status: 'candidate' | 'confirmed' | 'rejected';
  trajectoryShiftSummary?: string;
  impact?: 'positive' | 'negative' | 'neutral';
  evidenceRefs?: string[];
  evidence?: string[];
  domains?: DomainId[];
  domainId?: DomainId;
}

export interface LifeSnapshot {
  id: string;
  userId: string;
  period: { from: string; to: string };
  domainStates: Record<DomainId, DomainState>;
  turningPoints: TurningPoint[];
  insights: LifeInsight[];
  createdAt: string;
}

export interface LifeEvent {
  id: string;
  userId: string;
  type: string;
  domainIds: DomainId[];
  title: string;
  summary: string;
  occurredAt: string;
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  intensity: number;
  isTurningPointCandidate: boolean;
  source?: { type: string; ref: string; externalId?: string };
  metadata?: Record<string, any>;
}

export interface Reflection {
  id: string;
  userId: string;
  content: string;
  occurredAt: string;
  createdAt: string;
  processed: boolean;
  extractedEventIds: string[];
  followUpQuestion?: string | null;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  domainId: DomainId;
  status: 'active' | 'completed' | 'paused' | 'archived';
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
  evidenceRefs: string[];
  notes?: string;
}

export interface Prediction {
  id: string;
  userId: string;
  decisionId?: string;
  title: string;
  expectedOutcomes: Array<{
    domain: DomainId;
    direction: 'up' | 'down' | 'stable';
    confidence: number;
    timeframe: string;
  }>;
  reviewAt: string;
  status: 'active' | 'evaluated';
  actualOutcomeId?: string;
  createdAt: string;
}

export interface Outcome {
  id: string;
  userId: string;
  predictionId: string;
  actualOutcomes: Array<{
    domain: DomainId;
    observedDirection: 'up' | 'down' | 'stable';
    notes: string;
  }>;
  alignmentScore: number;
  userReflection: string;
  evaluatedAt: string;
}

export interface Connection {
  id: string;
  userId: string;
  provider: 'google_calendar' | 'gmail' | 'google_drive' | 'local_demo';
  status: 'connected' | 'disconnected' | 'syncing' | 'sync_failed' | 'revoked' | 'needs_reauthorization';
  scopes: string[];
  lastSyncAt: string | null;
  itemCount: number;
  lastError?: string | null;
  connectedAt?: string;
  disconnectedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  mode?: 'companion' | 'advisor';
}
