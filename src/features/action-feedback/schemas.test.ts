import { describe, expect, it } from "vitest";
import { actionDecisionRequestSchema } from "./schemas";

const validDecisionRequest = {
  reviewId: "10d7c53f-7488-4198-b0c2-60e6d9c30a86",
  patternType: "rising_anxiety",
  observationTitle: "焦虑程度持续上升",
  observationEvidence: [
    {
      label: "模式证据",
      value: "焦虑评分从 3 分上升到 7 分。",
      dates: ["2026-07-18", "2026-07-19", "2026-07-20"],
    },
  ],
  sourceStartDate: "2026-06-22",
  sourceEndDate: "2026-07-21",
  actionTitle: "记录触发因素",
  actionInstruction: "写下焦虑升高前发生的事情。",
  decision: "accepted",
} as const;

describe("actionDecisionRequestSchema", () => {
  it("accepts the exact action decision contract", () => {
    expect(actionDecisionRequestSchema.safeParse(validDecisionRequest).success).toBe(
      true,
    );
  });

  it("rejects a client-supplied user_id", () => {
    const result = actionDecisionRequestSchema.safeParse({
      ...validDecisionRequest,
      user_id: "e2028fb4-e3d9-49ec-8cbb-6d7f9b593124",
    });

    expect(result.success).toBe(false);
  });
});
