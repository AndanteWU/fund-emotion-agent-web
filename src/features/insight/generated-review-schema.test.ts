import { describe, expect, it } from "vitest";
import { generatedActionableEmotionReviewSchema } from "./ai-review-schema";

const generatedReview = {
  reviewId: "10d7c53f-7488-4198-b0c2-60e6d9c30a86",
  sourceStartDate: "2026-06-22",
  sourceEndDate: "2026-07-21",
  observation: {
    type: "rising_anxiety",
    title: "焦虑程度持续上升",
    severity: "high",
    confidence: 0.95,
    evidence: [
      {
        label: "模式证据",
        value: "焦虑评分从 3 分上升到 7 分。",
        dates: ["2026-07-18", "2026-07-19", "2026-07-20"],
      },
    ],
  },
  statistics: {
    recordCount: 3,
    mostFrequentEmotion: "焦虑",
    averageAnxiety: 5,
    averageFomo: 2,
    averageImpulse: 3,
    highAnxietyDays: 1,
    highFomoDays: 0,
    highRiskDateCount: 1,
    riskLevel: "medium",
  },
  interpretation:
    "最近三次焦虑评分连续上升，说明情绪波动正在积累。可以先识别具体触发因素，为下一次变化留出观察空间。",
  singleAction: {
    title: "记录触发因素",
    instruction: "写下焦虑升高前发生的事情。",
  },
  watchSignals: [],
  reflectionQuestion: "最近什么情境最容易让焦虑升高？",
  disclaimer: "这是基于记录的行为观察，不构成投资建议。",
};

describe("generatedActionableEmotionReviewSchema", () => {
  it("keeps a server review id and the queried source date range with the review", () => {
    const result = generatedActionableEmotionReviewSchema.safeParse(
      generatedReview,
    );

    expect(result.success).toBe(true);
  });
});
