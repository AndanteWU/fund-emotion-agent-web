import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  EmotionHistoryDateRange,
  EmotionHistoryFilters,
  EmotionHistoryQueryResult,
  EmotionRecordRow,
} from "../types";

const EMOTION_RECORD_COLUMNS = [
  "id",
  "user_id",
  "record_date",
  "account_check_frequency",
  "strongest_emotion",
  "operation_impulse",
  "impulse_source",
  "actual_action",
  "anxiety_level",
  "fomo_level",
  "impulse_level",
  "note",
].join(",");

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isValidDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function getLast30DayRange(now = new Date()): EmotionHistoryDateRange {
  const endDate = formatDate(now);
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 29);

  return {
    startDate: formatDate(start),
    endDate,
  };
}

function resolveDateRange(
  filters: EmotionHistoryFilters,
): EmotionHistoryDateRange {
  const fallback = getLast30DayRange();
  const requestedStart = isValidDate(filters.startDate)
    ? filters.startDate
    : fallback.startDate;
  const requestedEnd = isValidDate(filters.endDate)
    ? filters.endDate
    : fallback.endDate;

  return requestedStart <= requestedEnd
    ? { startDate: requestedStart, endDate: requestedEnd }
    : { startDate: requestedEnd, endDate: requestedStart };
}

export async function queryEmotionHistory(
  filters: EmotionHistoryFilters = {},
): Promise<EmotionHistoryQueryResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { status: "unauthenticated" };
  }

  const range = resolveDateRange(filters);
  let query = supabase
    .from("emotion_records")
    .select(EMOTION_RECORD_COLUMNS)
    .eq("user_id", user.id)
    .gte("record_date", range.startDate)
    .lte("record_date", range.endDate);

  if (filters.emotion) {
    query = query.eq("strongest_emotion", filters.emotion);
  }

  const { data, error } = await query
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<EmotionRecordRow[]>();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Supabase 情绪历史查询失败", { code: error.code });
    }
    return { status: "error" };
  }

  return { status: "success", records: data ?? [], range };
}
