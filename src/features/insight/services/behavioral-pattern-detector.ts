import type { EmotionRecordRow } from "@/features/emotion/types";
import type {
  BehavioralPattern,
  BehavioralPatternSeverity,
} from "../types";

interface AnxietyObservation {
  date: string;
  score: number;
}

function sortByDateAscending<T extends { date: string }>(values: T[]): T[] {
  return [...values].sort((left, right) => left.date.localeCompare(right.date));
}

function getAnxietyObservations(
  records: EmotionRecordRow[],
): AnxietyObservation[] {
  return sortByDateAscending(
    records
      .filter(
        (
          record,
        ): record is EmotionRecordRow & { anxiety_level: number } =>
          record.anxiety_level !== null,
      )
      .map((record) => ({
        date: record.record_date,
        score: record.anxiety_level,
      })),
  );
}

/**
 * Rising-anxiety severity uses the final 0-10 score: high >= 7,
 * medium >= 4, otherwise low. Confidence reflects the observed increase:
 * 0.95 for >= 4 points, 0.85 for >= 3, and 0.75 for the 2-point minimum.
 */
function getRisingAnxietySeverity(
  finalScore: number,
): BehavioralPatternSeverity {
  if (finalScore >= 7) {
    return "high";
  }

  return finalScore >= 4 ? "medium" : "low";
}

function getRisingAnxietyConfidence(increase: number): number {
  if (increase >= 4) {
    return 0.95;
  }

  return increase >= 3 ? 0.85 : 0.75;
}

function detectRisingAnxiety(
  records: EmotionRecordRow[],
): BehavioralPattern | null {
  const observations = getAnxietyObservations(records);
  const latest = observations.slice(-3);

  if (latest.length < 3) {
    return null;
  }

  const [first, second, third] = latest;
  const increase = third.score - first.score;

  if (
    first.score >= second.score ||
    second.score >= third.score ||
    increase < 2
  ) {
    return null;
  }

  return {
    type: "rising_anxiety",
    title: "焦虑程度持续上升",
    evidence: `焦虑评分在 ${first.date}（${first.score}）→ ${second.date}（${second.score}）→ ${third.date}（${third.score}）连续上升，首尾增加 ${increase} 分。`,
    severity: getRisingAnxietySeverity(third.score),
    confidence: getRisingAnxietyConfidence(increase),
  };
}

interface CheckingObservation {
  date: string;
  frequency: number;
}

function parseCheckingFrequency(value: string | null): number | null {
  if (value === null || value.trim() === "") {
    return null;
  }

  const frequency = Number(value);
  return Number.isFinite(frequency) && frequency >= 0 ? frequency : null;
}

function getCheckingObservations(
  records: EmotionRecordRow[],
): CheckingObservation[] {
  const observations = records.flatMap((record) => {
    const frequency = parseCheckingFrequency(record.account_check_frequency);
    return frequency === null
      ? []
      : [{ date: record.record_date, frequency }];
  });

  return sortByDateAscending(observations);
}

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * Frequent-checking severity reflects the absolute average increase:
 * high >= 5 checks/day, medium >= 3, otherwise low (the trigger minimum is 2).
 * Confidence reflects the ratio: 0.95 for >= 2x, 0.85 for >= 1.75x,
 * and 0.75 for the 1.5x minimum.
 */
function getFrequentCheckingSeverity(
  increase: number,
): BehavioralPatternSeverity {
  if (increase >= 5) {
    return "high";
  }

  return increase >= 3 ? "medium" : "low";
}

function getFrequentCheckingConfidence(ratio: number): number {
  if (ratio >= 2) {
    return 0.95;
  }

  return ratio >= 1.75 ? 0.85 : 0.75;
}

function detectFrequentChecking(
  records: EmotionRecordRow[],
): BehavioralPattern | null {
  const observations = getCheckingObservations(records);
  const latestSix = observations.slice(-6);

  if (latestSix.length < 6) {
    return null;
  }

  const previous = latestSix.slice(0, 3);
  const recent = latestSix.slice(3);
  const previousAverage = average(
    previous.map((observation) => observation.frequency),
  );
  const recentAverage = average(
    recent.map((observation) => observation.frequency),
  );
  const increase = recentAverage - previousAverage;
  const ratio =
    previousAverage === 0 ? Number.POSITIVE_INFINITY : recentAverage / previousAverage;

  if (recentAverage < previousAverage * 1.5 || increase < 2) {
    return null;
  }

  return {
    type: "frequent_checking",
    title: "账户查看频率明显增加",
    evidence: `前一阶段（${previous[0].date} 至 ${previous[2].date}）平均 ${previousAverage.toFixed(1)} 次/天，最近阶段（${recent[0].date} 至 ${recent[2].date}）平均 ${recentAverage.toFixed(1)} 次/天。`,
    severity: getFrequentCheckingSeverity(increase),
    confidence: getFrequentCheckingConfidence(ratio),
  };
}

const AFFIRMATIVE_ACTION_VALUES = new Set(["是", "yes", "true", "1"]);

function meansActionOccurred(value: string | null): boolean {
  return (
    value !== null &&
    AFFIRMATIVE_ACTION_VALUES.has(value.trim().toLocaleLowerCase("en-US"))
  );
}

/**
 * Emotion/action-link severity and confidence use the qualifying count:
 * 2 records => low / 0.75, 3 => medium / 0.85, and >= 4 => high / 0.95.
 * The pattern reports same-record co-occurrence only and makes no timing claim.
 */
function getEmotionActionStrength(count: number): {
  severity: BehavioralPatternSeverity;
  confidence: number;
} {
  if (count >= 4) {
    return { severity: "high", confidence: 0.95 };
  }

  return count === 3
    ? { severity: "medium", confidence: 0.85 }
    : { severity: "low", confidence: 0.75 };
}

function detectEmotionActionLink(
  records: EmotionRecordRow[],
): BehavioralPattern | null {
  const qualifying = sortByDateAscending(
    records.flatMap((record) =>
      record.impulse_level !== null &&
      record.impulse_level >= 7 &&
      meansActionOccurred(record.actual_action)
        ? [{ date: record.record_date }]
        : [],
    ),
  );

  if (qualifying.length < 2) {
    return null;
  }

  const strength = getEmotionActionStrength(qualifying.length);
  const dates = qualifying.map((record) => record.date).join("、");

  return {
    type: "emotion_action_link",
    title: "高冲动与实际操作重复同时出现",
    evidence: `共有 ${qualifying.length} 条记录同时出现冲动程度 ≥ 7 和实际操作，日期：${dates}。`,
    ...strength,
  };
}

export function detectBehavioralPatterns(
  records: EmotionRecordRow[],
): BehavioralPattern[] {
  return [
    detectRisingAnxiety(records),
    detectFrequentChecking(records),
    detectEmotionActionLink(records),
  ].filter((pattern): pattern is BehavioralPattern => pattern !== null);
}
