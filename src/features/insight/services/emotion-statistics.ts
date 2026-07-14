import type { EmotionRecordRow } from "@/features/emotion/types";
import type {
  EmotionCompositionPoint,
  EmotionInsightData,
  EmotionTrendPoint,
  HighScoreDate,
} from "../types";

interface DailyAccumulator {
  date: string;
  emotions: Set<string>;
  anxietyValues: number[];
  fomoValues: number[];
  impulseValues: number[];
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

function maximum(values: number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

function getScoreValues(
  records: EmotionRecordRow[],
  select: (record: EmotionRecordRow) => number | null,
): number[] {
  return records
    .map(select)
    .filter((value): value is number => value !== null);
}

function buildDailyData(records: EmotionRecordRow[]): DailyAccumulator[] {
  const grouped = new Map<string, DailyAccumulator>();

  records.forEach((record) => {
    const current = grouped.get(record.record_date) ?? {
      date: record.record_date,
      emotions: new Set<string>(),
      anxietyValues: [],
      fomoValues: [],
      impulseValues: [],
    };

    if (record.strongest_emotion) {
      current.emotions.add(record.strongest_emotion);
    }
    if (record.anxiety_level !== null) {
      current.anxietyValues.push(record.anxiety_level);
    }
    if (record.fomo_level !== null) {
      current.fomoValues.push(record.fomo_level);
    }
    if (record.impulse_level !== null) {
      current.impulseValues.push(record.impulse_level);
    }

    grouped.set(record.record_date, current);
  });

  return Array.from(grouped.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

function buildComposition(
  records: EmotionRecordRow[],
): EmotionCompositionPoint[] {
  const counts = new Map<string, number>();

  records.forEach((record) => {
    if (record.strongest_emotion) {
      counts.set(
        record.strongest_emotion,
        (counts.get(record.strongest_emotion) ?? 0) + 1,
      );
    }
  });

  return Array.from(counts, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value || a.name.localeCompare(b.name, "zh-CN"),
  );
}

function buildTrend(dailyData: DailyAccumulator[]): EmotionTrendPoint[] {
  return dailyData.map((day) => ({
    date: day.date,
    label: day.date.slice(5),
    anxiety: average(day.anxietyValues),
    fomo: average(day.fomoValues),
    impulse: average(day.impulseValues),
  }));
}

function buildHighScoreDates(
  dailyData: DailyAccumulator[],
): HighScoreDate[] {
  return dailyData
    .map((day) => ({
      date: day.date,
      emotions: Array.from(day.emotions),
      anxiety: maximum(day.anxietyValues),
      fomo: maximum(day.fomoValues),
      impulse: maximum(day.impulseValues),
    }))
    .filter(
      (day) =>
        (day.anxiety ?? 0) >= 7 ||
        (day.fomo ?? 0) >= 7 ||
        (day.impulse ?? 0) >= 7,
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function calculateEmotionInsights(
  records: EmotionRecordRow[],
): EmotionInsightData {
  const anxietyValues = getScoreValues(
    records,
    (record) => record.anxiety_level,
  );
  const fomoValues = getScoreValues(records, (record) => record.fomo_level);
  const impulseValues = getScoreValues(
    records,
    (record) => record.impulse_level,
  );
  const dailyData = buildDailyData(records);
  const composition = buildComposition(records);

  return {
    summary: {
      totalRecords: records.length,
      mostFrequentEmotion: composition[0]?.name ?? null,
      averageAnxiety: average(anxietyValues),
      averageFomo: average(fomoValues),
      averageImpulse: average(impulseValues),
      highAnxietyDays: dailyData.filter(
        (day) => (maximum(day.anxietyValues) ?? 0) >= 7,
      ).length,
      highFomoDays: dailyData.filter(
        (day) => (maximum(day.fomoValues) ?? 0) >= 7,
      ).length,
    },
    trend: buildTrend(dailyData),
    composition,
    highScoreDates: buildHighScoreDates(dailyData),
  };
}
