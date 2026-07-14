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

export interface EmotionInsightSummary {
  totalRecords: number;
  mostFrequentEmotion: string | null;
  averageAnxiety: number | null;
  averageFomo: number | null;
  averageImpulse: number | null;
  highAnxietyDays: number;
  highFomoDays: number;
}

export interface EmotionInsightData {
  summary: EmotionInsightSummary;
  trend: EmotionTrendPoint[];
  composition: EmotionCompositionPoint[];
  highScoreDates: HighScoreDate[];
}
