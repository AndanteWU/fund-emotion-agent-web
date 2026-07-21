import { describe, expect, it } from "vitest";
import type { AgentActionFeedbackCandidate } from "../types";
import {
  claimDueActionForUser,
  mapFeedbackCompletionPayload,
  submitActionFeedbackForUser,
  type DueActionFeedbackRepository,
  type ActionFeedbackRepository,
} from "./due-action-feedback-service";

const now = new Date("2026-07-23T08:00:00.000Z");

function createCandidate(
  overrides: Partial<AgentActionFeedbackCandidate> = {},
): AgentActionFeedbackCandidate {
  return {
    id: "7cf411fa-213d-46a0-94ec-46629729d65e",
    observation_title: "你最近更频繁地查看账户",
    action_title: "先记录触发原因",
    action_instruction: "下次想查看账户时，先写下是什么触发了这个念头。",
    status: "accepted",
    feedback_due_at: "2026-07-23T07:00:00.000Z",
    last_prompted_at: null,
    feedback: null,
    ...overrides,
  };
}

function createRepository(
  candidate: AgentActionFeedbackCandidate | null,
): DueActionFeedbackRepository & { claimCount: () => number } {
  let claims = 0;

  return {
    findAcceptedAction: async () => candidate,
    claimIfEligible: async () => {
      claims += 1;
      return candidate;
    },
    claimCount: () => claims,
  };
}

describe("claimDueActionForUser", () => {
  it("claims an accepted action when feedback is due and it has not been prompted", async () => {
    const repository = createRepository(createCandidate());

    const result = await claimDueActionForUser(
      "2f031a79-dcd7-4916-9d6c-081a5a101398",
      repository,
      now,
    );

    expect(result).toEqual({
      status: "claimed",
      action: {
        id: "7cf411fa-213d-46a0-94ec-46629729d65e",
        observationTitle: "你最近更频繁地查看账户",
        actionTitle: "先记录触发原因",
        actionInstruction: "下次想查看账户时，先写下是什么触发了这个念头。",
        feedbackDueAt: "2026-07-23T07:00:00.000Z",
      },
    });
    expect(repository.claimCount()).toBe(1);
  });

  it("does not claim an action before feedback is due", async () => {
    const repository = createRepository(
      createCandidate({ feedback_due_at: "2026-07-23T09:00:00.000Z" }),
    );

    const result = await claimDueActionForUser("user-id", repository, now);

    expect(result).toEqual({ status: "none" });
    expect(repository.claimCount()).toBe(0);
  });

  it("does not prompt again within the 24-hour cooldown", async () => {
    const repository = createRepository(
      createCandidate({ last_prompted_at: "2026-07-22T09:00:00.000Z" }),
    );

    const result = await claimDueActionForUser("user-id", repository, now);

    expect(result).toEqual({ status: "none" });
    expect(repository.claimCount()).toBe(0);
  });

  it("allows another prompt after the 24-hour cooldown", async () => {
    const repository = createRepository(
      createCandidate({ last_prompted_at: "2026-07-22T08:00:00.000Z" }),
    );

    const result = await claimDueActionForUser("user-id", repository, now);

    expect(result.status).toBe("claimed");
    expect(repository.claimCount()).toBe(1);
  });

  it("does not claim an action that is no longer accepted", async () => {
    const repository = createRepository(
      createCandidate({ status: "completed", feedback: "helpful" }),
    );

    const result = await claimDueActionForUser("user-id", repository, now);

    expect(result).toEqual({ status: "none" });
    expect(repository.claimCount()).toBe(0);
  });

  it("does not claim an accepted action that already has feedback", async () => {
    const repository = createRepository(
      createCandidate({ feedback: "not_tried" }),
    );

    const result = await claimDueActionForUser("user-id", repository, now);

    expect(result).toEqual({ status: "none" });
    expect(repository.claimCount()).toBe(0);
  });

  it("returns no prompt when another request wins the conditional claim", async () => {
    const repository = createRepository(createCandidate());
    repository.claimIfEligible = async () => null;

    expect(await claimDueActionForUser("user-id", repository, now)).toEqual({
      status: "none",
    });
  });
});

describe("mapFeedbackCompletionPayload", () => {
  it.each(["helpful", "not_helpful", "not_tried"] as const)(
    "maps %s to a completed action using the server timestamp",
    (feedback) => {
      expect(mapFeedbackCompletionPayload(feedback, now)).toEqual({
        status: "completed",
        feedback,
        feedback_at: "2026-07-23T08:00:00.000Z",
      });
    },
  );
});

function createFeedbackRepository(
  action: {
    status: "accepted" | "declined" | "completed";
    feedback: "helpful" | "not_helpful" | "not_tried" | null;
    feedback_due_at: string | null;
  } | null,
  completes = true,
): ActionFeedbackRepository & { completedCount: () => number } {
  let completed = 0;

  return {
    findAction: async () => action,
    completeIfEligible: async () => {
      completed += 1;
      return completes;
    },
    completedCount: () => completed,
  };
}

describe("submitActionFeedbackForUser", () => {
  it("completes an accepted action after feedback becomes due", async () => {
    const repository = createFeedbackRepository({
      status: "accepted",
      feedback: null,
      feedback_due_at: "2026-07-23T07:00:00.000Z",
    });

    const result = await submitActionFeedbackForUser(
      "user-id",
      "7cf411fa-213d-46a0-94ec-46629729d65e",
      "helpful",
      repository,
      now,
    );

    expect(result).toEqual({ status: "completed" });
    expect(repository.completedCount()).toBe(1);
  });

  it("does not accept feedback before it is due", async () => {
    const repository = createFeedbackRepository({
      status: "accepted",
      feedback: null,
      feedback_due_at: "2026-07-23T09:00:00.000Z",
    });

    const result = await submitActionFeedbackForUser(
      "user-id",
      "7cf411fa-213d-46a0-94ec-46629729d65e",
      "not_tried",
      repository,
      now,
    );

    expect(result).toEqual({ status: "unavailable" });
    expect(repository.completedCount()).toBe(0);
  });

  it("treats a repeated submission as already completed", async () => {
    const repository = createFeedbackRepository({
      status: "completed",
      feedback: "helpful",
      feedback_due_at: "2026-07-23T07:00:00.000Z",
    });

    const result = await submitActionFeedbackForUser(
      "user-id",
      "7cf411fa-213d-46a0-94ec-46629729d65e",
      "helpful",
      repository,
      now,
    );

    expect(result).toEqual({ status: "already_completed" });
    expect(repository.completedCount()).toBe(0);
  });
});
