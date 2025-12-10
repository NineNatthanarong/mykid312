const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.delete.codes';

// Token management
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hogword_token');
}

export function setToken(token: string): void {
  localStorage.setItem('hogword_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('hogword_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// Auth header helper
function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

// API Response types
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export interface WordResponse {
  word: string;
  difficulty: 'easy' | 'intermediate' | 'advance';
  log_id: string;
  play: number;
}

export interface ValidationResponse {
  score: number;
  suggestion: string;
  corrected_sentence: string | null;
}

export interface TodayLogItem {
  datetime: string;
  word: string;
  user_sentence: string;
  score: number;
  suggestion: string;
}

export interface SummaryResponse {
  avg_score_today: number;
  avg_score_all: number;
  today_skip: number;
  word_per_day: Array<{
    date: string;
    words: Record<string, number>;
  }>;
  score_per_day: Array<{
    date: string;
    score: number;
  }>;
  avg_score_level: Array<{
    level: string;
    score: number;
  }>;
  score_count_data: Array<{
    count: number;
    score: number;
    difficulty: string;
  }>;
}

// API Functions
export async function authenticate(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/signin-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Authentication failed');
  }
  
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function getWord(state: 'fetch' | 'gen' = 'fetch'): Promise<WordResponse> {
  const res = await fetch(`${API_BASE}/api/word?state=${state}`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      throw new Error('Session expired');
    }
    const error = await res.json();
    throw new Error(error.detail || 'Failed to fetch word');
  }
  
  return res.json();
}

export async function validateSentence(word: string, user_sentence: string): Promise<ValidationResponse> {
  const res = await fetch(`${API_BASE}/api/validate-sentence`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ word, user_sentence }),
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      throw new Error('Session expired');
    }
    const error = await res.json();
    throw new Error(error.detail || 'Validation failed');
  }
  
  return res.json();
}

export async function getSummary(): Promise<SummaryResponse> {
  const res = await fetch(`${API_BASE}/api/summary`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      throw new Error('Session expired');
    }
    const error = await res.json();
    throw new Error(error.detail || 'Failed to fetch summary');
  }
  
  return res.json();
}

export async function getTodayLog(): Promise<TodayLogItem[]> {
  const res = await fetch(`${API_BASE}/api/today-log`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      throw new Error('Session expired');
    }
    const error = await res.json();
    throw new Error(error.detail || 'Failed to fetch today log');
  }
  
  return res.json();
}

export function logout(): void {
  clearToken();
  window.location.href = '/login';
}
