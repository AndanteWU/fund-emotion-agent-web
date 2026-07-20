import { describe, expect, it } from "vitest";
import type { EmotionRecordRow } from "@/features/emotion/types";
import type { BehavioralPattern } from "../types";
import {
  evaluateBehavioralObservation,
  selectHighestPriorityPattern,
} from "./behavioral-pattern-selection";

function createRecord(
  recordDate: string,
  overrides: Partial<EmotionRecordRow> = {},
): EmotionRecordRow {
  return {
    id: recordDate,
    user_id: "user-1",
    record_date: recordDate,
    account_check_frequency: null,
    strongest_emotion: null,
    operation_impulse: null,
    impulse_source: null,
    actual_action: "否",
    anxiety_level: null,
    fomo_level: null,
    impulse_level: null,
    note: null,
    ...overrides,
  };
}

function createPattern(
  type: BehavioralPattern["type"],
  severity: BehavioralPattern["severity"],
): BehavioralPattern {
  return {
    type,
    title: type,
    evidence: `${type} evidence`,
    severity,
    confidence: 0.8,
  };
}

describe("selectHighestPriorityPattern", () => {
  it("selects the highest-severity pattern", () => {
    const selected = selectHighestPriorityPattern([
      createPattern("rising_anxiety", "low"),
      createPattern("frequent_checking", "high"),
      createPattern("emotion_action_link", "medium"),
    ]);

    expect(selected?.type).toBe("frequent_checking");
  });

  it("preserves detector order when severity is tied", () => {
    const selected = selectHighestPriorityPattern([
      createPattern("rising_anxiety", "medium"),
      createPattern("frequent_checking", "medium"),
    ]);

    expect(selected?.type).toBe("rising_anxiety");
  });
});

describe("evaluateBehavioralObservation", () => {
  it("reports insufficient data when fewer than two records exist", () => {
    expect(
      evaluateBehavioralObservation([createRecord("2026-07-01")]),
    ).toEqual({ status: "insufficient", recordCount: 1 });
  });

  it("reports no pattern when sufficient records do not trigger a rule", () => {
    expect(
      evaluateBehavioralObservation([
        createRecord("2026-07-01", { anxiety_level: 4 }),
        createRecord("2026-07-02", { anxiety_level: 4 }),
      ]),
    ).toEqual({ status: "none", recordCount: 2 });
  });

  it("returns the highest-severity detected pattern", () => {
    const result = evaluateBehavioralObservation([
      createRecord("2026-07-01", {
        anxiety_level: 2,
        account_check_frequency: "1",
      }),
      createRecord("2026-07-02", {
        anxiety_level: 4,
        account_check_frequency: "1",
      }),
      createRecord("2026-07-03", {
        anxiety_level: 7,
        account_check_frequency: "1",
      }),
      createRecord("2026-07-04", { account_check_frequency: "6" }),
      createRecord("2026-07-05", { account_check_frequency: "6" }),
      createRecord("2026-07-06", { account_check_frequency: "6" }),
    ]);

    expect(result).toMatchObject({
      status: "detected",
      pattern: { type: "rising_anxiety", severity: "high" },
    });
  });
});
