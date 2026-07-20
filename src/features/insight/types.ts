export interface EmotionTrendPoint {
  date: string;
  label: string;
  anxiety: number | null;
  fomo: number | null;
  impulse: number | null;
}

export interface EmotionCompositionPoint {
  name: string;
  value: number;
}

export interface HighScoreDate {
  date: string;
  emotions: string[];
  anxiety: number | null;
  fomo: number | null;
  impulse: number | null;
}

export type EmotionRiskLevel = "low" | "medium" | "high";

export interface EmotionInsightSummary {
  totalRecords: number;
  mostFrequentEmotion: string | null;
  averageAnxiety: number | null;
  averageFomo: number | null;
  averageImpulse: number | null;
  highAnxietyDays: number;
  highFomoDays: number;
  riskLevel: EmotionRiskLevel;
}

export interface EmotionInsightData {
  summary: EmotionInsightSummary;
  trend: EmotionTrendPoint[];
  composition: EmotionCompositionPoint[];
  highScoreDates: HighScoreDate[];
}

export type BehavioralPatternType =
  | "rising_anxiety"
  | "frequent_checking"
  | "emotion_action_link";

export type BehavioralPatternSeverity = "low" | "medium" | "high";

export interface BehavioralPattern {
  type: BehavioralPatternType;
  title: string;
  evidence: string;
  severity: BehavioralPatternSeverity;
  confidence: number;
}
