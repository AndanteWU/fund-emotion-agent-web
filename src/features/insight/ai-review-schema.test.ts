import { describe, expect, it } from "vitest";
import { aiEmotionReviewSchema } from "./ai-review-schema";

const validInterpretation =
  "最近的记录显示同一项行为模式正在重复出现。可以把注意力放在情绪触发因素和行为之间的联系，并为下一次出现留出观察空间。";

const validAction = {
  title: "记录触发因素",
  instruction: "写下情绪升高前发生的事情和当时的想法。",
};

describe("aiEmotionReviewSchema", () => {
  it("accepts exactly one action instead of an actions array", () => {
    const validResult = aiEmotionReviewSchema.safeParse({
      interpretation: validInterpretation,
      singleAction: validAction,
      reflectionQuestion: "这次情绪变化由什么触发？",
    });
    const oldArrayResult = aiEmotionReviewSchema.safeParse({
      interpretation: validInterpretation,
      actions: [validAction, validAction],
      reflectionQuestion: "这次情绪变化由什么触发？",
    });

    expect(validResult.success).toBe(true);
    expect(oldArrayResult.success).toBe(false);
  });

  it("rejects investment-direction language in the single action", () => {
    const result = aiEmotionReviewSchema.safeParse({
      interpretation: validInterpretation,
      singleAction: {
        title: "考虑买入",
        instruction: "根据当前情绪评分选择买入时点。",
      },
      reflectionQuestion: "这次情绪变化由什么触发？",
    });

    expect(result.success).toBe(false);
  });

  it("limits the interpretation to 40 through 100 characters", () => {
    const result = aiEmotionReviewSchema.safeParse({
      interpretation: "观".repeat(101),
      singleAction: validAction,
      reflectionQuestion: "这次情绪变化由什么触发？",
    });

    expect(result.success).toBe(false);
  });

  it("requires exactly one reflection question string", () => {
    const result = aiEmotionReviewSchema.safeParse({
      interpretation: validInterpretation,
      singleAction: validAction,
      reflectionQuestion: ["问题一", "问题二"],
    });

    expect(result.success).toBe(false);
  });
});