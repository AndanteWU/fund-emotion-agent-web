import { supabase } from "@/lib/supabase";
import {
  EmotionRecordServiceError,
  type EmotionRecordPayload,
  type EmotionRecordSubmission,
} from "../types";

export async function hasAuthenticatedEmotionUser(): Promise<boolean> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return !error && Boolean(user);
}

export function mapEmotionRecordPayload(
  submission: EmotionRecordSubmission,
  userId: string,
): EmotionRecordPayload {
  return {
    user_id: userId,
    emotion: submission.emotion,
    emotion_score: submission.emotionScore,
    anxiety_score: submission.anxietyScore,
    fomo_score: submission.fomoScore,
    impulse_score: submission.impulseScore,
    watch_frequency: submission.watchFrequency,
    operation_impulse: submission.operationImpulse,
    ...(submission.note ? { note: submission.note } : {}),
  };
}

export async function saveEmotionRecord(
  submission: EmotionRecordSubmission,
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new EmotionRecordServiceError(
      "unauthenticated",
      "请先登录后再保存情绪记录。",
    );
  }

  const payload = mapEmotionRecordPayload(submission, user.id);
  const { error } = await supabase.from("emotion_records").insert(payload);

  if (error) {
    throw new EmotionRecordServiceError(
      "save_failed",
      "暂时无法保存记录，请稍后再试。",
    );
  }
}
