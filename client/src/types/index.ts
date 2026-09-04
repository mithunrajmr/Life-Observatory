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
  career: { id: 'career', name: 'Career & Work', description: 'Professional progress & projects', color: '#818CF8', defaultActive: true },
  learning: { id: 'learning', name: 'Learning & Skills', description: 'Acquiring knowledge & capabilities', color: '#2DD4BF', defaultActive: true },
  health: { id: 'health', name: 'Health & Fitness', description: 'Physical energy, workouts, sleep', color: '#34D399', defaultActive: true },
  relationships: { id: 'relationships', name: 'Relationships', description: 'Family, friends & community', color: '#FBBF24', defaultActive: true },
  energy: { id: 'energy', name: 'Energy & Wellbeing', description: 'Mental clarity & stamina', color: '#C084FC', defaultActive: true },
  personal: { id: 'personal', name: 'Personal Projects', description: 'Creative pursuits & hobbies', color: '#38BDF8', defaultActive: true },
  finance: { id: 'finance', name: 'Financial Wellbeing', description: 'Budgeting & financial milestones', color: '#4ADE80', defaultActive: true },
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
  type: 'invisible_progress' | 'what_changed' | 'drift' | 'turning_point' | 'pattern' | 'stagnation';
  title: string;
  summary: string;
  explanation: string;
  domainIds: DomainId[];
  fingerprint: string;
  period: { from: string; to: string };
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
  eventId: string;
  title: string;
  description: string;
  occurredAt: string;
  status: 'candidate' | 'confirmed' | 'rejected';
  trajectoryShiftSummary: string;
  evidenceRefs: string[];
  domains: DomainId[];
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
  provider: 'google_calendar' | 'local_demo';
  status: 'connected' | 'disconnected';
  scopes: string[];
  lastSyncAt: string;
  itemCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  mode?: 'companion' | 'advisor';
}
