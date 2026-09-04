import { getIdToken } from './firebase';

const BASE_URL = '/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // ignore
    }
    const message = errorData.error?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  // Observatory / Life Horizon
  getHorizon: (weeks: number = 12) => apiRequest<{ snapshot: any }>(`/observatory/horizon?weeks=${weeks}`),
  recomputeHorizon: (weeks: number = 12) => apiRequest<{ snapshot: any }>('/observatory/recompute', {
    method: 'POST',
    body: JSON.stringify({ weeks }),
  }),

  // Reflections
  submitReflection: (content: string, occurredAt?: string) => 
    apiRequest<{ reflection: any; events: any[]; followUpQuestion: string | null }>('/reflections', {
      method: 'POST',
      body: JSON.stringify({ content, occurredAt }),
    }),
  getReflections: () => apiRequest<{ reflections: any[] }>('/reflections'),

  // Chat (Companion & Advisor)
  sendMessage: (message: string, conversationId?: string) =>
    apiRequest<{ conversationId: string; reply: any; mode: 'companion' | 'advisor' }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    }),
  getChatHistory: (conversationId?: string) =>
    apiRequest<{ messages: any[] }>(`/chat/history${conversationId ? `?conversationId=${conversationId}` : ''}`),

  // Insights
  getInsights: () => apiRequest<{ insights: any[] }>('/insights'),
  getInvisibleProgress: () => apiRequest<{ invisibleProgress: any }>('/insights/invisible-progress'),

  // Goals
  getGoals: () => apiRequest<{ goals: any[] }>('/goals'),
  createGoal: (goal: { title: string; domainId: string; targetDate?: string; notes?: string }) =>
    apiRequest<{ goal: any }>('/goals', { method: 'POST', body: JSON.stringify(goal) }),
  updateGoal: (id: string, updates: any) =>
    apiRequest<{ goal: any }>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteGoal: (id: string) =>
    apiRequest<{ success: boolean }>(`/goals/${id}`, { method: 'DELETE' }),

  // Predictions & Outcomes
  getPredictions: () => apiRequest<{ predictions: any[] }>('/predictions'),
  createPrediction: (prediction: any) =>
    apiRequest<{ prediction: any }>('/predictions', { method: 'POST', body: JSON.stringify(prediction) }),
  recordOutcome: (id: string, outcome: any) =>
    apiRequest<{ outcome: any }>(`/predictions/${id}/outcome`, { method: 'POST', body: JSON.stringify(outcome) }),

  // Turning Points
  getTurningPoints: () => apiRequest<{ turningPoints: any[] }>('/turning-points'),
  updateTurningPoint: (id: string, updates: any) =>
    apiRequest<{ turningPoint: any }>(`/turning-points/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  // Connections & Privacy
  getConnections: () => apiRequest<{ connections: any[] }>('/connections'),
  syncGoogleCalendar: (accessToken?: string) =>
    apiRequest<{ success: boolean; syncedCount: number; snapshot: any }>('/connections/google_calendar/sync', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    }),
  deleteConnectionData: (provider: string) =>
    apiRequest<{ success: boolean }>(`/connections/${provider}/data`, { method: 'DELETE' }),
  deleteAllUserData: () =>
    apiRequest<{ success: boolean; message: string }>('/connections/user/all-data', { method: 'DELETE' }),
};
