import { createClient } from "@/lib/supabase/client";
import {
  EmotionRecordServiceError,
  type EmotionRecordPayload,
  type EmotionRecordSubmission,
} from "../types";

function formatRecordDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function mapEmotionRecordPayload(
  submission: EmotionRecordSubmission,
  userId: string,
): EmotionRecordPayload {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    record_date: formatRecordDate(new Date()),
    account_check_frequency: String(submission.watchFrequency),
    strongest_emotion: submission.emotion,
    operation_impulse: submission.operationImpulse ? "是" : "否",
    impulse_source: submission.impulseSource,
    actual_action: submission.actualOperation ? "是" : "否",
    anxiety_level: submission.anxietyScore,
    fomo_level: submission.fomoScore,
    impulse_level: submission.impulseScore,
    note: submission.note,
  };
}

export async function saveEmotionRecord(
  submission: EmotionRecordSubmission,
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    if (process.env.NODE_ENV === "development") {
      console.error("Supabase 用户验证失败", {
        authenticated: Boolean(user),
        errorName: authError?.name ?? null,
        status: authError?.status ?? null,
      });
    }

    throw new EmotionRecordServiceError(
      "unauthenticated",
      "请先登录后再保存情绪记录。",
    );
  }

  const payload = mapEmotionRecordPayload(submission, user.id);
  const { error } = await supabase.from("emotion_records").insert(payload);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Supabase emotion_records 写入失败", {
        code: error.code,
      });
    }

    throw new EmotionRecordServiceError(
      "save_failed",
      "暂时无法保存记录，请稍后再试。",
    );
  }
}
