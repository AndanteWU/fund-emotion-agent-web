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
export interface EmotionRecordFormValues {
  emotion: Emotion | "";
  emotionScore: number;
  anxietyScore: number;
  fomoScore: number;
  impulseScore: number;
  watchFrequency: number | "";
  operationImpulse: boolean | null;
  actualOperation: boolean | null;
  impulseSource: string;
  note: string;
}

export interface EmotionRecordSubmission {
  emotion: Emotion;
  emotionScore: number;
  anxietyScore: number;
  fomoScore: number;
  impulseScore: number;
  watchFrequency: number;
  operationImpulse: boolean;
  actualOperation: boolean;
  impulseSource: string;
  note: string;
}

/** 仅包含项目现有类型已确认存在于 emotion_records 的数据库字段。 */
export type EmotionRecordPayload = Omit<EmotionRecord, "id" | "created_at">;

export type EmotionRecordServiceErrorCode =
  | "unauthenticated"
  | "save_failed";

export class EmotionRecordServiceError extends Error {
  constructor(
    public readonly code: EmotionRecordServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "EmotionRecordServiceError";
  }
}
