export type Emotion =
  | "平静"
  | "焦虑"
  | "兴奋"
  | "后悔"
  | "恐惧"
  | "贪婪"
  | "烦躁"
  | "麻木";

export interface EmotionRecord {
  id?: string;
  user_id: string;
  emotion: Emotion;
  emotion_score: number;
  anxiety_score: number;
  fomo_score: number;
  impulse_score: number;
  watch_frequency: number;
  operation_impulse: boolean;
  note?: string;
  created_at?: string;
}