import { describe, expect, it } from "vitest";
import type { ActionDecisionRequest } from "../schemas";
import {
  saveActionDecisionForUser,
  type ActionDecisionRepository,
} from "./action-feedback-service";

const decision: ActionDecisionRequest = {
  reviewId: "10d7c53f-7488-4198-b0c2-60e6d9c30a86",
  patternType: "frequent_checking",
  observationTitle: "查看账户频率明显增加",
  observationEvidence: [
    {
      label: "查看频率",
      value: "近期平均查看 6.0 次，此前为 2.0 次。",
      dates: ["2026-07-15", "2026-07-16", "2026-07-17"],
    },
  ],
  sourceStartDate: "2026-06-22",
  sourceEndDate: "2026-07-21",
  actionTitle: "区分查看与决定",
  actionInstruction: "再次查看账户前，先写下这次查看的目的。",
  decision: "accepted",
};

describe("action decision idempotency", () => {
  it("returns already_saved when a concurrent insert hits the review unique constraint", async () => {
    let lookupCount = 0;
    const repository: ActionDecisionRepository = {
      findDecisionByReviewId: async () => {
        lookupCount += 1;
        return lookupCount === 1 ? null : "accepted";
      },
      hasAcceptedAction: async () => false,
      insert: async () => ({ success: false, code: "23505" }),
    };

    const result = await saveActionDecisionForUser(
      decision,
      "2f031a79-dcd7-4916-9d6c-081a5a101398",
      repository,
    );

    expect(result).toEqual({ status: "already_saved", decision: "accepted" });
  });
});
