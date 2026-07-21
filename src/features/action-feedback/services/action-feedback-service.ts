import { createClient } from "@/lib/supabase/server";
import type { ActionDecisionRequest } from "../schemas";
import type {
  AgentActionDecision,
  AgentActionInsertPayload,
} from "../types";

const FEEDBACK_DELAY_MS = 24 * 60 * 60 * 1000;

export type ActionDecisionInsertResult =
  | { success: true }
  | { success: false; code: string | null };

export interface ActionDecisionRepository {
  findDecisionByReviewId(
    userId: string,
    reviewId: string,
  ): Promise<AgentActionDecision | null>;
  hasAcceptedAction(userId: string): Promise<boolean>;
  insert(payload: AgentActionInsertPayload): Promise<ActionDecisionInsertResult>;
}

export type ActionDecisionSaveResult =
  | { status: "saved"; decision: AgentActionDecision }
  | { status: "already_saved"; decision: AgentActionDecision }
  | { status: "existing_pending_action" }
  | { status: "unauthenticated" }
  | { status: "error" };

class ActionDecisionRepositoryError extends Error {
  constructor(public readonly code: string | null) {
    super("Agent action repository operation failed.");
    this.name = "ActionDecisionRepositoryError";
  }
}

function readStoredDecision(data: unknown): AgentActionDecision | null {
  if (typeof data !== "object" || data === null || !("status" in data)) {
    return null;
  }

  if (data.status === "declined") {
    return "declined";
  }

  return data.status === "accepted" || data.status === "completed"
    ? "accepted"
    : null;
}

export function mapActionDecisionPayload(
  decision: ActionDecisionRequest,
  userId: string,
  now = new Date(),
): AgentActionInsertPayload {
  const basePayload = {
    user_id: userId,
    review_id: decision.reviewId,
    pattern_type: decision.patternType,
    observation_title: decision.observationTitle,
    observation_evidence: decision.observationEvidence,
    source_start_date: decision.sourceStartDate,
    source_end_date: decision.sourceEndDate,
    action_title: decision.actionTitle,
    action_instruction: decision.actionInstruction,
    last_prompted_at: null,
    feedback: null,
    feedback_at: null,
  } as const;

  if (decision.decision === "declined") {
    return {
      ...basePayload,
      status: "declined",
      accepted_at: null,
      feedback_due_at: null,
    };
  }

  const acceptedAt = now.toISOString();
  const feedbackDueAt = new Date(
    now.getTime() + FEEDBACK_DELAY_MS,
  ).toISOString();

  return {
    ...basePayload,
    status: "accepted",
    accepted_at: acceptedAt,
    feedback_due_at: feedbackDueAt,
  };
}

export async function saveActionDecisionForUser(
  decision: ActionDecisionRequest,
  userId: string,
  repository: ActionDecisionRepository,
  now = new Date(),
): Promise<ActionDecisionSaveResult> {
  const savedDecision = await repository.findDecisionByReviewId(
    userId,
    decision.reviewId,
  );

  if (savedDecision) {
    return { status: "already_saved", decision: savedDecision };
  }

  if (
    decision.decision === "accepted" &&
    (await repository.hasAcceptedAction(userId))
  ) {
    return { status: "existing_pending_action" };
  }

  const insertResult = await repository.insert(
    mapActionDecisionPayload(decision, userId, now),
  );

  if (insertResult.success) {
    return { status: "saved", decision: decision.decision };
  }

  if (insertResult.code === "23505") {
    const concurrentDecision = await repository.findDecisionByReviewId(
      userId,
      decision.reviewId,
    );

    if (concurrentDecision) {
      return { status: "already_saved", decision: concurrentDecision };
    }

    if (
      decision.decision === "accepted" &&
      (await repository.hasAcceptedAction(userId))
    ) {
      return { status: "existing_pending_action" };
    }
  }

  return { status: "error" };
}

export async function saveActionDecision(
  decision: ActionDecisionRequest,
): Promise<ActionDecisionSaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { status: "unauthenticated" };
  }

  const repository: ActionDecisionRepository = {
    async findDecisionByReviewId(userId, reviewId) {
      const { data, error } = await supabase
        .from("agent_actions")
        .select("status")
        .eq("user_id", userId)
        .eq("review_id", reviewId)
        .maybeSingle();

      if (error) {
        throw new ActionDecisionRepositoryError(error.code);
      }

      return readStoredDecision(data);
    },
    async hasAcceptedAction(userId) {
      const { data, error } = await supabase
        .from("agent_actions")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "accepted")
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new ActionDecisionRepositoryError(error.code);
      }

      return data !== null;
    },
    async insert(payload) {
      const { error } = await supabase.from("agent_actions").insert(payload);

      return error
        ? { success: false, code: error.code }
        : { success: true };
    },
  };

  try {
    return await saveActionDecisionForUser(decision, user.id, repository);
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error("Supabase 行动选择保存失败", {
        errorName: error instanceof Error ? error.name : "UnknownError",
        code:
          error instanceof ActionDecisionRepositoryError ? error.code : null,
      });
    }

    return { status: "error" };
  }
}
