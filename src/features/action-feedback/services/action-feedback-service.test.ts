import { describe, expect, it } from "vitest";
import type { ActionDecisionRequest } from "../schemas";
import {
  mapActionDecisionPayload,
  saveActionDecisionForUser,
  type ActionDecisionRepository,
} from "./action-feedback-service";

const acceptedDecision: ActionDecisionRequest = {
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
};

describe("mapActionDecisionPayload", () => {
  it("maps an accepted decision with a server user id and a 24-hour feedback delay", () => {
    const acceptedAt = new Date("2026-07-21T08:00:00.000Z");
    const payload = mapActionDecisionPayload(
      acceptedDecision,
      "2f031a79-dcd7-4916-9d6c-081a5a101398",
      acceptedAt,
    );

    expect(payload).toEqual({
      user_id: "2f031a79-dcd7-4916-9d6c-081a5a101398",
      review_id: "10d7c53f-7488-4198-b0c2-60e6d9c30a86",
      pattern_type: "rising_anxiety",
      observation_title: "焦虑程度持续上升",
      observation_evidence: acceptedDecision.observationEvidence,
      source_start_date: "2026-06-22",
      source_end_date: "2026-07-21",
      action_title: "记录触发因素",
      action_instruction: "写下焦虑升高前发生的事情。",
      status: "accepted",
      accepted_at: "2026-07-21T08:00:00.000Z",
      feedback_due_at: "2026-07-22T08:00:00.000Z",
      last_prompted_at: null,
      feedback: null,
      feedback_at: null,
    });
  });

  it("maps a declined decision without acceptance or feedback timestamps", () => {
    const payload = mapActionDecisionPayload(
      { ...acceptedDecision, decision: "declined" },
      "2f031a79-dcd7-4916-9d6c-081a5a101398",
      new Date("2026-07-21T08:00:00.000Z"),
    );

    expect(payload.status).toBe("declined");
    expect(payload.accepted_at).toBeNull();
    expect(payload.feedback_due_at).toBeNull();
    expect(payload.last_prompted_at).toBeNull();
    expect(payload.feedback).toBeNull();
    expect(payload.feedback_at).toBeNull();
  });
});

function createRepository(
  overrides: Partial<ActionDecisionRepository> = {},
): ActionDecisionRepository & { insertedCount: () => number } {
  const inserted: unknown[] = [];

  return {
    findDecisionByReviewId: async () => null,
    hasAcceptedAction: async () => false,
    insert: async (payload) => {
      inserted.push(payload);
      return { success: true };
    },
    insertedCount: () => inserted.length,
    ...overrides,
  };
}

describe("saveActionDecisionForUser", () => {
  it("returns the saved state for a repeated review without inserting again", async () => {
    const repository = createRepository({
      findDecisionByReviewId: async () => "accepted",
    });

    const result = await saveActionDecisionForUser(
      acceptedDecision,
      "2f031a79-dcd7-4916-9d6c-081a5a101398",
      repository,
    );

    expect(result).toEqual({ status: "already_saved", decision: "accepted" });
    expect(repository.insertedCount()).toBe(0);
  });

  it("does not accept a new action when another accepted action exists", async () => {
    const repository = createRepository({
      hasAcceptedAction: async () => true,
    });

    const result = await saveActionDecisionForUser(
      acceptedDecision,
      "2f031a79-dcd7-4916-9d6c-081a5a101398",
      repository,
    );

    expect(result).toEqual({ status: "existing_pending_action" });
    expect(repository.insertedCount()).toBe(0);
  });
});
