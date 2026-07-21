import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ActionableEmotionReview } from "../ai-review-schema";
import AiEmotionReviewResult from "./AiEmotionReviewResult";

const review: ActionableEmotionReview = {
  observation: {
    type: "rising_anxiety",
    title: "焦虑程度持续上升",
    severity: "high",
    confidence: 0.95,
    evidence: [
      {
        label: "模式证据",
        value:
          "焦虑评分在 2026-07-01（2）→ 2026-07-02（4）→ 2026-07-03（7）连续上升，首尾增加 5 分。",
        dates: ["2026-07-01", "2026-07-02", "2026-07-03"],
      },
    ],
  },
  statistics: {
    recordCount: 3,
    mostFrequentEmotion: "焦虑",
    averageAnxiety: 4.3,
    averageFomo: 3,
    averageImpulse: 2,
    highAnxietyDays: 1,
    highFomoDays: 0,
    highRiskDateCount: 1,
    riskLevel: "medium",
  },
  interpretation:
    "最近三次焦虑评分连续上升，说明情绪波动正在积累。可以先识别具体触发因素，避免让当下感受直接推动下一步行为。",
  singleAction: {
    title: "记录触发因素",
    instruction: "写下焦虑升高前发生的事件和当时最担心的事情。",
  },
  watchSignals: [
    {
      title: "账户查看频率明显增加",
      evidence:
        "最近三条记录的平均查看次数达到此前三条的 1.5 倍以上。",
    },
  ],
  reflectionQuestion: "最近哪一种情境最容易让焦虑评分连续升高？",
  disclaimer: "这是基于记录的行为观察，不构成投资建议。",
};

describe("AiEmotionReviewResult", () => {
  it("renders one focused observation, one action, and one question", () => {
    const html = renderToStaticMarkup(
      <AiEmotionReviewResult review={review} />,
    );

    expect(html).toContain("焦虑程度持续上升");
    expect(html).toContain(review.observation.evidence[0].value);
    expect(html).toContain("今天可以做什么");
    expect(html).toContain(review.singleAction.instruction);
    expect(html).toContain("想一想");
    expect(html).toContain(review.reflectionQuestion);
    expect(html).not.toContain(">真实证据<");
    expect(html).not.toContain(">情绪管理行动<");
    expect(html).not.toContain(">需要留意的信号<");
  });

  it("keeps judgment details and other signals collapsed by default", () => {
    const html = renderToStaticMarkup(
      <AiEmotionReviewResult review={review} />,
    );

    expect(html).toContain("<details");
    expect(html).not.toContain("<details open");
    expect(html).toContain("查看判断依据");
    expect(html).toContain("相关统计");
    expect(html).toContain("其他需要留意的变化");
  });
});