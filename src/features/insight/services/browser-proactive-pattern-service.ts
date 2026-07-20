import type {
  BehavioralObservationEvaluation,
  BehavioralPattern,
  BehavioralPatternSeverity,
  BehavioralPatternType,
} from "../types";

const PATTERN_TYPES: BehavioralPatternType[] = [
  "rising_anxiety",
  "frequent_checking",
  "emotion_action_link",
];

const SEVERITIES: BehavioralPatternSeverity[] = ["low", "medium", "high"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBehavioralPattern(value: unknown): value is BehavioralPattern {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.type === "string" &&
    PATTERN_TYPES.some((type) => type === value.type) &&
    typeof value.title === "string" &&
    typeof value.evidence === "string" &&
    typeof value.severity === "string" &&
    SEVERITIES.some((severity) => severity === value.severity) &&
    typeof value.confidence === "number" &&
    value.confidence >= 0 &&
    value.confidence <= 1
  );
}

function isObservationEvaluation(
  value: unknown,
): value is BehavioralObservationEvaluation {
  if (
    !isRecord(value) ||
    typeof value.status !== "string" ||
    typeof value.recordCount !== "number"
  ) {
    return false;
  }

  if (value.status === "insufficient" || value.status === "none") {
    return true;
  }

  return value.status === "detected" && isBehavioralPattern(value.pattern);
}

export async function fetchLatestBehavioralObservation(): Promise<BehavioralObservationEvaluation> {
  const response = await fetch("/api/insights/patterns/latest", {
    cache: "no-store",
  });
  const result: unknown = await response.json();

  if (!response.ok || !isObservationEvaluation(result)) {
    throw new Error("Behavioral observation is unavailable.");
  }

  return result;
}
