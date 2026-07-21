import type { EmotionRecordRow } from "@/features/emotion/types";
import {
  FIXED_REVIEW_DISCLAIMER,
  type ActionableEmotionReview,
  type AiEmotionReview,
} from "../ai-review-schema";

export { FIXED_REVIEW_DISCLAIMER } from "../ai-review-schema";
import type {
  ActionableReviewObservation,
  ActionableReviewStatistics,
  ActionableReviewWatchSignal,
  AiReviewPromptContext,
  BehavioralPattern,
  DeterministicReviewContext,
} from "../types";
import { detectBehavioralPatterns } from "./behavioral-pattern-detector";
import { selectHighestPriorityPattern } from "./behavioral-pattern-selection";
import { calculateEmotionInsights } from "./emotion-statistics";

const DATE_PATTERN = /\d{4}-\d{2}-\d{2}/g;

function getStatistics(
  records: EmotionRecordRow[],
): ActionableReviewStatistics {
  const insights = calculateEmotionInsights(records);

  return {
    recordCount: insights.summary.totalRecords,
    mostFrequentEmotion: insights.summary.mostFrequentEmotion,
    averageAnxiety: insights.summary.averageAnxiety,
    averageFomo: insights.summary.averageFomo,
    averageImpulse: insights.summary.averageImpulse,
    highAnxietyDays: insights.summary.highAnxietyDays,
    highFomoDays: insights.summary.highFomoDays,
    highRiskDateCount: insights.highScoreDates.length,
    riskLevel: insights.summary.riskLevel,
  };
}

function createPatternObservation(
  pattern: BehavioralPattern,
): ActionableReviewObservation {
  return {
    type: pattern.type,
    title: pattern.title,
    severity: pattern.severity,
    confidence: pattern.confidence,
    evidence: [
      {
        label: "模式证据",
        value: pattern.evidence,
        dates: Array.from(new Set(pattern.evidence.match(DATE_PATTERN) ?? [])),
      },
    ],
  };
}

function createNoPatternObservation(
  statistics: ActionableReviewStatistics,
  records: EmotionRecordRow[],
): ActionableReviewObservation {
  const dates = Array.from(
    new Set(records.map((record) => record.record_date)),
  ).sort();
  const displayAverage = (value: number | null) =>
    value === null ? "—" : value.toFixed(1);

  return {
    type: "no_clear_pattern",
    title: "暂未发现明确的重复行为模式",
    severity: statistics.riskLevel,
    confidence: statistics.recordCount < 3 ? 0.3 : 0.6,
    evidence: [
      {
        label: "记录数量",
        value:
          statistics.recordCount < 2
            ? `最近 30 天仅有 ${statistics.recordCount} 条记录，需要更多记录后再判断重复模式。`
            : `最近 30 天共 ${statistics.recordCount} 条记录。`,
        dates,
      },
      ...(statistics.mostFrequentEmotion
        ? [
            {
              label: "主要情绪",
              value: statistics.mostFrequentEmotion,
              dates,
            },
          ]
        : []),
      {
        label: "平均评分",
        value: `焦虑 ${displayAverage(statistics.averageAnxiety)}、FOMO ${displayAverage(statistics.averageFomo)}、冲动 ${displayAverage(statistics.averageImpulse)}`,
        dates,
      },
    ],
  };
}

function createWatchSignals(
  patterns: BehavioralPattern[],
  selectedPattern: BehavioralPattern | null,
  statistics: ActionableReviewStatistics,
): ActionableReviewWatchSignal[] {
  const signals: ActionableReviewWatchSignal[] = patterns
    .filter((pattern) => pattern.type !== selectedPattern?.type)
    .map((pattern) => ({
      title: pattern.title,
      evidence: pattern.evidence,
    }));

  if (
    selectedPattern?.type !== "rising_anxiety" &&
    statistics.highAnxietyDays > 0
  ) {
    signals.push({
      title: "高焦虑日期再次出现",
      evidence: `最近 30 天已有 ${statistics.highAnxietyDays} 天焦虑评分达到 7 分或以上。`,
    });
  }

  if (statistics.highFomoDays > 0) {
    signals.push({
      title: "高 FOMO 日期再次出现",
      evidence: `最近 30 天已有 ${statistics.highFomoDays} 天 FOMO 评分达到 7 分或以上。`,
    });
  }

  if (statistics.highRiskDateCount > 0) {
    signals.push({
      title: "高风险日期数量增加",
      evidence: `最近 30 天已有 ${statistics.highRiskDateCount} 个日期出现焦虑、FOMO 或冲动评分达到 7 分或以上。`,
    });
  }

  return signals.slice(0, 3);
}
export function createDeterministicReviewContext(
  records: EmotionRecordRow[],
): DeterministicReviewContext {
  const statistics = getStatistics(records);
  const patterns = detectBehavioralPatterns(records);
  const selectedPattern = selectHighestPriorityPattern(patterns);

  return {
    observation: selectedPattern
      ? createPatternObservation(selectedPattern)
      : createNoPatternObservation(statistics, records),
    statistics,
    watchSignals: createWatchSignals(patterns, selectedPattern, statistics),
    hasSufficientPatternData: records.length >= 2,
  };
}
export function createAiReviewPromptContext(
  context: DeterministicReviewContext,
  records: EmotionRecordRow[],
): AiReviewPromptContext {
  const recentContext = [...records]
    .sort((left, right) => right.record_date.localeCompare(left.record_date))
    .filter(
      (record) =>
        Boolean(record.impulse_source?.trim()) || Boolean(record.note?.trim()),
    )
    .slice(0, 3)
    .map((record) => ({
      date: record.record_date,
      impulseSource: record.impulse_source?.trim().slice(0, 80) || null,
      note: record.note?.trim().slice(0, 160) || null,
    }));

  return {
    ...context,
    recentContext,
  };
}
export function composeActionableEmotionReview(
  context: DeterministicReviewContext,
  aiOutput: AiEmotionReview,
): ActionableEmotionReview {
  return {
    observation: context.observation,
    statistics: context.statistics,
    interpretation: aiOutput.interpretation,
    singleAction: aiOutput.singleAction,
    watchSignals: context.watchSignals,
    reflectionQuestion: aiOutput.reflectionQuestion,
    disclaimer: FIXED_REVIEW_DISCLAIMER,
  };
}