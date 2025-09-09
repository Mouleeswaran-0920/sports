export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  sportInterest?: string;
  experience?: string;
  region?: string;
  createdAt: string;
}

export interface PerformanceData {
  id: string;
  userId: string;
  testType: string;
  score: number;
  repCount?: number;
  jumpHeight?: number;
  runTime?: number;
  posture: number;
  technique: number;
  suitability: SportSuitability[];
  injuryRisk: string;
  createdAt: string;
}

export interface SportSuitability {
  sport: string;
  score: number;
  recommendation: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  endDate: string;
  participants: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  rank: number;
}