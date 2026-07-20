import { describe, expect, it } from "vitest";
import type { EmotionRecordRow } from "@/features/emotion/types";
import { detectBehavioralPatterns } from "./behavioral-pattern-detector";

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
    actual_action: null,
    anxiety_level: null,
    fomo_level: null,
    impulse_level: null,
    note: null,
    ...overrides,
  };
}

describe("detectBehavioralPatterns rising anxiety", () => {
  it("detects strictly rising anxiety across the latest three valid records", () => {
    const patterns = detectBehavioralPatterns([
      createRecord("2026-07-01", { anxiety_level: 2 }),
      createRecord("2026-07-03", { anxiety_level: 4 }),
      createRecord("2026-07-05", { anxiety_level: 7 }),
    ]);

    expect(patterns).toEqual([
      {
        type: "rising_anxiety",
        title: "焦虑程度持续上升",
        evidence:
          "焦虑评分在 2026-07-01（2）→ 2026-07-03（4）→ 2026-07-05（7）连续上升，首尾增加 5 分。",
        severity: "high",
        confidence: 0.95,
      },
    ]);
  });

  it("does not detect flat anxiety", () => {
    const patterns = detectBehavioralPatterns([
      createRecord("2026-07-01", { anxiety_level: 4 }),
      createRecord("2026-07-02", { anxiety_level: 4 }),
      createRecord("2026-07-03", { anxiety_level: 4 }),
    ]);

    expect(patterns).toEqual([]);
  });

  it("does not detect an increase smaller than two points", () => {
    const patterns = detectBehavioralPatterns([
      createRecord("2026-07-01", { anxiety_level: 3 }),
      createRecord("2026-07-02", { anxiety_level: 3.5 }),
      createRecord("2026-07-03", { anxiety_level: 4.5 }),
    ]);

    expect(patterns).toEqual([]);
  });

  it("sorts newest-first input before selecting the latest three valid records", () => {
    const input = [
      createRecord("2026-07-06", { anxiety_level: 8 }),
      createRecord("2026-07-05", { anxiety_level: 6 }),
      createRecord("2026-07-04", { anxiety_level: 4 }),
      createRecord("2026-07-03", { anxiety_level: null }),
      createRecord("2026-07-02", { anxiety_level: 9 }),
    ];

    const patterns = detectBehavioralPatterns(input);

    expect(patterns[0]).toMatchObject({
      type: "rising_anxiety",
      evidence:
        "焦虑评分在 2026-07-04（4）→ 2026-07-05（6）→ 2026-07-06（8）连续上升，首尾增加 4 分。",
    });
  });
});

describe("detectBehavioralPatterns frequent checking", () => {
  it("detects a valid increase between the latest two three-record periods", () => {
    const patterns = detectBehavioralPatterns([
      createRecord("2026-07-01", { account_check_frequency: "1" }),
      createRecord("2026-07-02", { account_check_frequency: "2" }),
      createRecord("2026-07-03", { account_check_frequency: "1" }),
      createRecord("2026-07-04", { account_check_frequency: "4" }),
      createRecord("2026-07-05", { account_check_frequency: "5" }),
      createRecord("2026-07-06", { account_check_frequency: "4" }),
    ]);

    expect(patterns).toEqual([
      {
        type: "frequent_checking",
        title: "账户查看频率明显增加",
        evidence:
          "前一阶段（2026-07-01 至 2026-07-03）平均 1.3 次/天，最近阶段（2026-07-04 至 2026-07-06）平均 4.3 次/天。",
        severity: "medium",
        confidence: 0.95,
      },
    ]);
  });

  it("safely ignores non-numeric and otherwise invalid legacy values", () => {
    const patterns = detectBehavioralPatterns([
      createRecord("2026-07-01", { account_check_frequency: "2" }),
      createRecord("2026-07-02", { account_check_frequency: "" }),
      createRecord("2026-07-03", { account_check_frequency: "2" }),
      createRecord("2026-07-04", { account_check_frequency: "often" }),
      createRecord("2026-07-05", { account_check_frequency: "2" }),
      createRecord("2026-07-06", { account_check_frequency: "-1" }),
      createRecord("2026-07-07", { account_check_frequency: "5" }),
      createRecord("2026-07-08", { account_check_frequency: "Infinity" }),
      createRecord("2026-07-09", { account_check_frequency: "5" }),
      createRecord("2026-07-10", { account_check_frequency: "5" }),
    ]);

    expect(patterns[0]).toMatchObject({
      type: "frequent_checking",
      evidence:
        "前一阶段（2026-07-01 至 2026-07-05）平均 2.0 次/天，最近阶段（2026-07-07 至 2026-07-10）平均 5.0 次/天。",
    });
  });

  it("does not trigger with fewer than six valid checking-frequency records", () => {
    const patterns = detectBehavioralPatterns([
      createRecord("2026-07-01", { account_check_frequency: "1" }),
      createRecord("2026-07-02", { account_check_frequency: "1" }),
      createRecord("2026-07-03", { account_check_frequency: "legacy" }),
      createRecord("2026-07-04", { account_check_frequency: "4" }),
      createRecord("2026-07-05", { account_check_frequency: "4" }),
      createRecord("2026-07-06", { account_check_frequency: "4" }),
    ]);

    expect(patterns).toEqual([]);
  });
});

describe("detectBehavioralPatterns emotion and action link", () => {
  it("does not trigger for only one high-impulse action record", () => {
    const patterns = detectBehavioralPatterns([
      createRecord("2026-07-01", {
        impulse_level: 7,
        actual_action: "是",
      }),
    ]);

    expect(patterns).toEqual([]);
  });

  it("detects two records where high impulse and actual action co-occur", () => {
    const patterns = detectBehavioralPatterns([
      createRecord("2026-07-03", {
        impulse_level: 9,
        actual_action: "是",
      }),
      createRecord("2026-07-01", {
        impulse_level: 7,
        actual_action: "是",
      }),
    ]);

    expect(patterns).toEqual([
      {
        type: "emotion_action_link",
        title: "高冲动与实际操作重复同时出现",
        evidence:
          "共有 2 条记录同时出现冲动程度 ≥ 7 和实际操作，日期：2026-07-01、2026-07-03。",
        severity: "low",
        confidence: 0.75,
      },
    ]);
  });

  it.each(["yes", "TRUE", "1"])(
    "normalizes the legacy affirmative action value %s",
    (actualAction) => {
      const patterns = detectBehavioralPatterns([
        createRecord("2026-07-01", {
          impulse_level: 7,
          actual_action: "是",
        }),
        createRecord("2026-07-02", {
          impulse_level: 8,
          actual_action: actualAction,
        }),
      ]);

      expect(patterns[0]?.type).toBe("emotion_action_link");
    },
  );
});

describe("detectBehavioralPatterns general behavior", () => {
  it("returns an empty array for empty input", () => {
    expect(detectBehavioralPatterns([])).toEqual([]);
  });

  it("does not mutate the input array or its records", () => {
    const input = [
      createRecord("2026-07-03", {
        anxiety_level: 7,
        account_check_frequency: "4",
      }),
      createRecord("2026-07-01", {
        anxiety_level: 3,
        account_check_frequency: "1",
      }),
      createRecord("2026-07-02", {
        anxiety_level: 5,
        account_check_frequency: "2",
      }),
    ];
    const snapshot = structuredClone(input);

    detectBehavioralPatterns(input);

    expect(input).toEqual(snapshot);
  });

  it("always returns patterns in the defined order", () => {
    const patterns = detectBehavioralPatterns([
      createRecord("2026-07-06", {
        anxiety_level: 8,
        account_check_frequency: "4",
        impulse_level: 8,
        actual_action: "是",
      }),
      createRecord("2026-07-05", {
        anxiety_level: 6,
        account_check_frequency: "4",
        impulse_level: 7,
        actual_action: "true",
      }),
      createRecord("2026-07-04", {
        anxiety_level: 4,
        account_check_frequency: "4",
      }),
      createRecord("2026-07-03", { account_check_frequency: "1" }),
      createRecord("2026-07-02", { account_check_frequency: "1" }),
      createRecord("2026-07-01", { account_check_frequency: "1" }),
    ]);

    expect(patterns.map((pattern) => pattern.type)).toEqual([
      "rising_anxiety",
      "frequent_checking",
      "emotion_action_link",
    ]);
  });
});
