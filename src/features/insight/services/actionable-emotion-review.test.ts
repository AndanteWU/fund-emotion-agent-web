import { describe, expect, it } from "vitest";
import type { EmotionRecordRow } from "@/features/emotion/types";
import { aiEmotionReviewSchema } from "../ai-review-schema";
import {
  composeActionableEmotionReview,
  createAiReviewPromptContext,
  createDeterministicReviewContext,
  FIXED_REVIEW_DISCLAIMER,
} from "./actionable-emotion-review";

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

describe("createDeterministicReviewContext", () => {
  it("returns one confirmed observation when a behavioral pattern exists", () => {
    const context = createDeterministicReviewContext([
      createRecord("2026-07-01", { anxiety_level: 2 }),
      createRecord("2026-07-02", { anxiety_level: 4 }),
      createRecord("2026-07-03", { anxiety_level: 7 }),
    ]);

    expect(context.observation).toMatchObject({
      type: "rising_anxiety",
      title: "焦虑程度持续上升",
      severity: "high",
      confidence: 0.95,
    });
    expect(context.observation.evidence).toHaveLength(1);
    expect(context.observation.evidence[0]).toEqual({
      label: "模式证据",
      value:
        "焦虑评分在 2026-07-01（2）→ 2026-07-02（4）→ 2026-07-03（7）连续上升，首尾增加 5 分。",
      dates: ["2026-07-01", "2026-07-02", "2026-07-03"],
    });
  });
  it("returns no_clear_pattern with deterministic statistical evidence", () => {
    const context = createDeterministicReviewContext([
      createRecord("2026-07-01", {
        strongest_emotion: "焦虑",
        anxiety_level: 4,
        fomo_level: 2,
        impulse_level: 1,
      }),
      createRecord("2026-07-02", {
        strongest_emotion: "焦虑",
        anxiety_level: 4,
        fomo_level: 4,
        impulse_level: 3,
      }),
    ]);

    expect(context.observation).toMatchObject({
      type: "no_clear_pattern",
      title: "暂未发现明确的重复行为模式",
    });
    expect(context.observation.evidence).toEqual([
      {
        label: "记录数量",
        value: "最近 30 天共 2 条记录。",
        dates: ["2026-07-01", "2026-07-02"],
      },
      {
        label: "主要情绪",
        value: "焦虑",
        dates: ["2026-07-01", "2026-07-02"],
      },
      {
        label: "平均评分",
        value: "焦虑 4.0、FOMO 3.0、冲动 2.0",
        dates: ["2026-07-01", "2026-07-02"],
      },
    ]);
  });
  it("keeps secondary patterns as other signals without repeating the core pattern", () => {
    const context = createDeterministicReviewContext([
      createRecord("2026-07-01", {
        account_check_frequency: "1",
      }),
      createRecord("2026-07-02", {
        account_check_frequency: "1",
        impulse_level: 7,
        actual_action: "是",
      }),
      createRecord("2026-07-03", {
        account_check_frequency: "1",
      }),
      createRecord("2026-07-04", {
        account_check_frequency: "4",
        anxiety_level: 4,
      }),
      createRecord("2026-07-05", {
        account_check_frequency: "4",
        anxiety_level: 6,
        impulse_level: 8,
        actual_action: "true",
      }),
      createRecord("2026-07-06", {
        account_check_frequency: "4",
        anxiety_level: 8,
      }),
    ]);

    expect(context.observation.type).toBe("rising_anxiety");
    expect(context.watchSignals).toEqual([
      {
        title: "账户查看频率明显增加",
        evidence:
          "前一阶段（2026-07-01 至 2026-07-03）平均 1.0 次/天，最近阶段（2026-07-04 至 2026-07-06）平均 4.0 次/天。",
      },
      {
        title: "高冲动与实际操作重复同时出现",
        evidence:
          "共有 2 条记录同时出现冲动程度 ≥ 7 和实际操作，日期：2026-07-02、2026-07-05。",
      },
      {
        title: "高风险日期数量增加",
        evidence:
          "最近 30 天已有 3 个日期出现焦虑、FOMO 或冲动评分达到 7 分或以上。",
      },
    ]);
  });  it("keeps deterministic facts and the fixed disclaimer outside AI control", () => {
    const context = createDeterministicReviewContext([
      createRecord("2026-07-01", { anxiety_level: 2 }),
      createRecord("2026-07-02", { anxiety_level: 4 }),
      createRecord("2026-07-03", { anxiety_level: 7 }),
    ]);
    const aiOutput = aiEmotionReviewSchema.parse({
      interpretation:
        "最近三次焦虑评分连续上升，说明情绪波动正在积累。可以先识别具体触发因素，避免让当下感受直接推动下一步行为。",
      singleAction: {
        title: "记录触发因素",
        instruction: "写下焦虑升高前发生的事件和当时最担心的事情。",
      },
      actions: [
        {
          title: "模型试图添加第二个行动",
          instruction: "这项内容不应进入最终结果。",
        },
      ],
      reflectionQuestion: "最近哪一种情境最容易让焦虑评分连续升高？",
      observation: {
        type: "no_clear_pattern",
        title: "模型试图覆盖事实",
        severity: "low",
        confidence: 0,
        evidence: [],
      },
      disclaimer: "模型生成的免责声明",
    });

    const review = composeActionableEmotionReview(context, aiOutput);

    expect(review.observation).toEqual(context.observation);
    expect(review.statistics).toEqual(context.statistics);
    expect(review.singleAction).toEqual(aiOutput.singleAction);
    expect("actions" in review).toBe(false);
    expect(review.watchSignals).toEqual(context.watchSignals);
    expect(review.disclaimer).toBe(FIXED_REVIEW_DISCLAIMER);
  });
  it("does not force a pattern when only one record is available", () => {
    const context = createDeterministicReviewContext([
      createRecord("2026-07-01", {
        strongest_emotion: "焦虑",
        anxiety_level: 6,
      }),
    ]);

    expect(context.hasSufficientPatternData).toBe(false);
    expect(context.observation.type).toBe("no_clear_pattern");
    expect(context.observation.evidence[0]).toEqual({
      label: "记录数量",
      value: "最近 30 天仅有 1 条记录，需要更多记录后再判断重复模式。",
      dates: ["2026-07-01"],
    });
  });
  it("creates a minimal AI context without record or user identifiers", () => {
    const records = [
      createRecord("2026-07-01", {
        impulse_source: "看到短期波动",
        note: "担心错过变化",
        anxiety_level: 5,
      }),
      createRecord("2026-07-02", {
        impulse_source: "重复查看账户",
        note: "注意力很难转移",
        anxiety_level: 5,
      }),
    ];
    const context = createDeterministicReviewContext(records);
    const promptContext = createAiReviewPromptContext(context, records);
    const serialized = JSON.stringify(promptContext);

    expect(promptContext.recentContext).toEqual([
      {
        date: "2026-07-02",
        impulseSource: "重复查看账户",
        note: "注意力很难转移",
      },
      {
        date: "2026-07-01",
        impulseSource: "看到短期波动",
        note: "担心错过变化",
      },
    ]);
    expect(serialized).not.toContain("user-1");
    expect(serialized).not.toContain('"id"');
    expect(serialized).not.toContain("actual_action");
  });
});
