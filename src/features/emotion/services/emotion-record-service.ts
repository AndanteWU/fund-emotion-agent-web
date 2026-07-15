import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  EmotionRecordServiceError,
  type EmotionRecordPayload,
  type EmotionRecordSaveResult,
  type EmotionRecordSubmission,
} from "../types";

const EMOTION_RECORD_CONFLICT_COLUMNS = "user_id,record_date";

interface EmotionRecordPayloadContext {
  id: string;
  recordDate: string;
}

function formatRecordDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getConstraint(error: unknown): string | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("constraint" in error) ||
    typeof error.constraint !== "string"
  ) {
    return null;
  }

  return error.constraint;
}

function logDatabaseError(operation: string, error: PostgrestError): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.error(`Supabase emotion_records ${operation}失败`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    constraint: getConstraint(error),
  });
}

function getExistingRecordId(data: unknown): string | null {
  if (
    typeof data !== "object" ||
    data === null ||
    !("id" in data) ||
    typeof data.id !== "string"
  ) {
    return null;
  }

  return data.id;
}

export function mapEmotionRecordPayload(
  submission: EmotionRecordSubmission,
  userId: string,
  context: EmotionRecordPayloadContext = {
    id: crypto.randomUUID(),
    recordDate: formatRecordDate(new Date()),
  },
): EmotionRecordPayload {
  return {
    id: context.id,
    user_id: userId,
    record_date: context.recordDate,
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
): Promise<EmotionRecordSaveResult> {
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

  const recordDate = formatRecordDate(new Date());
  const { data: existingData, error: lookupError } = await supabase
    .from("emotion_records")
    .select("id")
    .eq("user_id", user.id)
    .eq("record_date", recordDate)
    .maybeSingle();

  if (lookupError) {
    logDatabaseError("查询今日记录", lookupError);
    throw new EmotionRecordServiceError(
      "save_failed",
      "暂时无法保存记录，请稍后再试。",
    );
  }

  const existingRecordId = getExistingRecordId(existingData);
  const payload = mapEmotionRecordPayload(submission, user.id, {
    id: existingRecordId ?? crypto.randomUUID(),
    recordDate,
  });
  const { error } = await supabase.from("emotion_records").upsert(payload, {
    onConflict: EMOTION_RECORD_CONFLICT_COLUMNS,
  });

  if (error) {
    logDatabaseError("保存", error);
    throw new EmotionRecordServiceError(
      "save_failed",
      "暂时无法保存记录，请稍后再试。",
    );
  }

  return existingRecordId ? "updated" : "created";
}