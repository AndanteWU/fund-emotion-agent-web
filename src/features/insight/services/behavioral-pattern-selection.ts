import type { EmotionRecordRow } from "@/features/emotion/types";
import type {
  BehavioralObservationEvaluation,
  BehavioralPattern,
  BehavioralPatternSeverity,
} from "../types";
import { detectBehavioralPatterns } from "./behavioral-pattern-detector";

const SEVERITY_PRIORITY: Record<BehavioralPatternSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function selectHighestPriorityPattern(
  patterns: BehavioralPattern[],
): BehavioralPattern | null {
  return patterns.reduce<BehavioralPattern | null>((selected, pattern) => {
    if (
      selected === null ||
      SEVERITY_PRIORITY[pattern.severity] >
        SEVERITY_PRIORITY[selected.severity]
    ) {
      return pattern;
    }

    return selected;
  }, null);
}

export function evaluateBehavioralObservation(
  records: EmotionRecordRow[],
): BehavioralObservationEvaluation {
  if (records.length < 2) {
    return { status: "insufficient", recordCount: records.length };
  }

  const pattern = selectHighestPriorityPattern(
    detectBehavioralPatterns(records),
  );

  return pattern
    ? { status: "detected", recordCount: records.length, pattern }
    : { status: "none", recordCount: records.length };
}
