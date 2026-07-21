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

export type ActionableObservationType =
  | BehavioralPatternType
  | "no_clear_pattern";

export interface ActionableReviewEvidence {
  label: string;
  value: string;
  dates: string[];
}

export interface ActionableReviewObservation {
  type: ActionableObservationType;
  title: string;
  severity: BehavioralPatternSeverity;
  confidence: number;
  evidence: ActionableReviewEvidence[];
}

export interface ActionableReviewWatchSignal {
  title: string;
  evidence: string;
}

export interface ActionableReviewStatistics {
  recordCount: number;
  mostFrequentEmotion: string | null;
  averageAnxiety: number | null;
  averageFomo: number | null;
  averageImpulse: number | null;
  highAnxietyDays: number;
  highFomoDays: number;
  highRiskDateCount: number;
  riskLevel: EmotionRiskLevel;
}

export interface DeterministicReviewContext {
  observation: ActionableReviewObservation;
  statistics: ActionableReviewStatistics;
  watchSignals: ActionableReviewWatchSignal[];
  hasSufficientPatternData: boolean;
}

export interface AiReviewRecentContext {
  date: string;
  impulseSource: string | null;
  note: string | null;
}

export interface AiReviewPromptContext extends DeterministicReviewContext {
  recentContext: AiReviewRecentContext[];
}

export type BehavioralObservationEvaluation =
  | { status: "insufficient"; recordCount: number }
  | { status: "none"; recordCount: number }
  | {
      status: "detected";
      recordCount: number;
      pattern: BehavioralPattern;
    };

export type BehavioralObservationQueryResult =
  | BehavioralObservationEvaluation
  | { status: "unauthenticated" }
  | { status: "error" };
