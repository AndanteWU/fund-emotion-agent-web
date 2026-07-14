export type Emotion =
  | "平静"
  | "焦虑"
  | "兴奋"
  | "后悔"
  | "恐惧"
  | "贪婪"
  | "烦躁"
  | "麻木";

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

export interface EmotionRecordPayload {
  id: string;
  user_id: string;
  record_date: string;
  account_check_frequency: string;
  strongest_emotion: Emotion;
  operation_impulse: "是" | "否";
  impulse_source: string;
  actual_action: "是" | "否";
  anxiety_level: number;
  fomo_level: number;
  impulse_level: number;
  note: string;
}

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
