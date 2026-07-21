import { createClient } from "@/lib/supabase/server";
import type {
  AgentActionFeedback,
  AgentActionFeedbackCandidate,
  AgentActionFeedbackUpdatePayload,
  AgentActionStatus,
  DueActionFeedbackPrompt,
} from "../types";

const PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export interface DueActionFeedbackRepository {
  findAcceptedAction(
    userId: string,
  ): Promise<AgentActionFeedbackCandidate | null>;
  claimIfEligible(
    userId: string,
    actionId: string,
    promptedAt: string,
    cooldownCutoff: string,
  ): Promise<AgentActionFeedbackCandidate | null>;
}

export type DueActionFeedbackClaimResult =
  | { status: "claimed"; action: DueActionFeedbackPrompt }
  | { status: "none" };

function isEligible(
  action: AgentActionFeedbackCandidate,
  now: Date,
): action is AgentActionFeedbackCandidate & { feedback_due_at: string } {
  if (
    action.status !== "accepted" ||
    action.feedback !== null ||
    action.feedback_due_at === null
  ) {
    return false;
  }

  const dueAt = Date.parse(action.feedback_due_at);
  if (!Number.isFinite(dueAt) || dueAt > now.getTime()) {
    return false;
  }

  if (action.last_prompted_at === null) {
    return true;
  }

  const lastPromptedAt = Date.parse(action.last_prompted_at);
  return (
    Number.isFinite(lastPromptedAt) &&
    lastPromptedAt <= now.getTime() - PROMPT_COOLDOWN_MS
  );
}

function toPrompt(
  action: AgentActionFeedbackCandidate,
  feedbackDueAt: string,
): DueActionFeedbackPrompt {
  return {
    id: action.id,
    observationTitle: action.observation_title,
    actionTitle: action.action_title,
    actionInstruction: action.action_instruction,
    feedbackDueAt,
  };
}

export async function claimDueActionForUser(
  userId: string,
  repository: DueActionFeedbackRepository,
  now = new Date(),
): Promise<DueActionFeedbackClaimResult> {
  const action = await repository.findAcceptedAction(userId);

  if (!action || !isEligible(action, now)) {
    return { status: "none" };
  }

  const claimed = await repository.claimIfEligible(
    userId,
    action.id,
    now.toISOString(),
    new Date(now.getTime() - PROMPT_COOLDOWN_MS).toISOString(),
  );

  if (!claimed || claimed.feedback_due_at === null) {
    return { status: "none" };
  }

  return { status: "claimed", action: toPrompt(claimed, claimed.feedback_due_at) };
}

export interface ActionFeedbackRecord {
  status: AgentActionStatus;
  feedback: AgentActionFeedback | null;
  feedback_due_at: string | null;
}

export interface ActionFeedbackRepository {
  findAction(
    userId: string,
    actionId: string,
  ): Promise<ActionFeedbackRecord | null>;
  completeIfEligible(
    userId: string,
    actionId: string,
    payload: AgentActionFeedbackUpdatePayload,
    now: string,
  ): Promise<boolean>;
}

export type ActionFeedbackSubmitResult =
  | { status: "completed" }
  | { status: "already_completed" }
  | { status: "unavailable" };

export function mapFeedbackCompletionPayload(
  feedback: AgentActionFeedback,
  now = new Date(),
): AgentActionFeedbackUpdatePayload {
  return {
    status: "completed",
    feedback,
    feedback_at: now.toISOString(),
  };
}

function canSubmitFeedback(
  action: ActionFeedbackRecord,
  now: Date,
): boolean {
  if (
    action.status !== "accepted" ||
    action.feedback !== null ||
    action.feedback_due_at === null
  ) {
    return false;
  }

  const dueAt = Date.parse(action.feedback_due_at);
  return Number.isFinite(dueAt) && dueAt <= now.getTime();
}

export async function submitActionFeedbackForUser(
  userId: string,
  actionId: string,
  feedback: AgentActionFeedback,
  repository: ActionFeedbackRepository,
  now = new Date(),
): Promise<ActionFeedbackSubmitResult> {
  const action = await repository.findAction(userId, actionId);

  if (action?.status === "completed" && action.feedback !== null) {
    return { status: "already_completed" };
  }

  if (!action || !canSubmitFeedback(action, now)) {
    return { status: "unavailable" };
  }

  const completed = await repository.completeIfEligible(
    userId,
    actionId,
    mapFeedbackCompletionPayload(feedback, now),
    now.toISOString(),
  );

  if (completed) {
    return { status: "completed" };
  }

  const concurrentAction = await repository.findAction(userId, actionId);
  return concurrentAction?.status === "completed" &&
    concurrentAction.feedback !== null
    ? { status: "already_completed" }
    : { status: "unavailable" };
}

type ClaimDueActionResult =
  | DueActionFeedbackClaimResult
  | { status: "unauthenticated" }
  | { status: "error" };

type SubmitFeedbackResult =
  | ActionFeedbackSubmitResult
  | { status: "unauthenticated" }
  | { status: "error" };

class AgentActionFeedbackRepositoryError extends Error {
  constructor(public readonly code: string | null) {
    super("Agent action feedback repository operation failed.");
    this.name = "AgentActionFeedbackRepositoryError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFeedback(value: unknown): value is AgentActionFeedback {
  return (
    value === "helpful" || value === "not_helpful" || value === "not_tried"
  );
}

function readCandidate(value: unknown): AgentActionFeedbackCandidate | null {
  if (!isRecord(value)) {
    return null;
  }

  const feedback = value.feedback;
  if (
    typeof value.id !== "string" ||
    typeof value.observation_title !== "string" ||
    typeof value.action_title !== "string" ||
    typeof value.action_instruction !== "string" ||
    (value.status !== "accepted" &&
      value.status !== "declined" &&
      value.status !== "completed") ||
    (value.feedback_due_at !== null &&
      typeof value.feedback_due_at !== "string") ||
    (value.last_prompted_at !== null &&
      typeof value.last_prompted_at !== "string") ||
    (feedback !== null && !isFeedback(feedback))
  ) {
    return null;
  }

  return {
    id: value.id,
    observation_title: value.observation_title,
    action_title: value.action_title,
    action_instruction: value.action_instruction,
    status: value.status,
    feedback_due_at: value.feedback_due_at,
    last_prompted_at: value.last_prompted_at,
    feedback,
  };
}

function readFeedbackRecord(value: unknown): ActionFeedbackRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const feedback = value.feedback;
  if (
    (value.status !== "accepted" &&
      value.status !== "declined" &&
      value.status !== "completed") ||
    (feedback !== null && !isFeedback(feedback)) ||
    (value.feedback_due_at !== null &&
      typeof value.feedback_due_at !== "string")
  ) {
    return null;
  }

  return {
    status: value.status,
    feedback,
    feedback_due_at: value.feedback_due_at,
  };
}

function logSafeError(message: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.error(message, {
    errorName: error instanceof Error ? error.name : "UnknownError",
    code:
      error instanceof AgentActionFeedbackRepositoryError ? error.code : null,
  });
}

export async function claimDueAction(): Promise<ClaimDueActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { status: "unauthenticated" };
  }

  const fields =
    "id, observation_title, action_title, action_instruction, status, feedback_due_at, last_prompted_at, feedback";

  const repository: DueActionFeedbackRepository = {
    async findAcceptedAction(userId) {
      const { data, error } = await supabase
        .from("agent_actions")
        .select(fields)
        .eq("user_id", userId)
        .eq("status", "accepted")
        .is("feedback", null)
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new AgentActionFeedbackRepositoryError(error.code);
      }

      return readCandidate(data);
    },
    async claimIfEligible(
      userId,
      actionId,
      promptedAt,
      cooldownCutoff,
    ) {
      const { data, error } = await supabase
        .from("agent_actions")
        .update({ last_prompted_at: promptedAt })
        .eq("id", actionId)
        .eq("user_id", userId)
        .eq("status", "accepted")
        .is("feedback", null)
        .lte("feedback_due_at", promptedAt)
        .or(
          `last_prompted_at.is.null,last_prompted_at.lte.${cooldownCutoff}`,
        )
        .select(fields)
        .maybeSingle();

      if (error) {
        throw new AgentActionFeedbackRepositoryError(error.code);
      }

      return readCandidate(data);
    },
  };

  try {
    return await claimDueActionForUser(user.id, repository);
  } catch (error: unknown) {
    logSafeError("Supabase 到期行动领取失败", error);
    return { status: "error" };
  }
}

export async function submitActionFeedback(
  actionId: string,
  feedback: AgentActionFeedback,
): Promise<SubmitFeedbackResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { status: "unauthenticated" };
  }

  const repository: ActionFeedbackRepository = {
    async findAction(userId, requestedActionId) {
      const { data, error } = await supabase
        .from("agent_actions")
        .select("status, feedback, feedback_due_at")
        .eq("id", requestedActionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw new AgentActionFeedbackRepositoryError(error.code);
      }

      return readFeedbackRecord(data);
    },
    async completeIfEligible(
      userId,
      requestedActionId,
      payload,
      completedAt,
    ) {
      const { data, error } = await supabase
        .from("agent_actions")
        .update(payload)
        .eq("id", requestedActionId)
        .eq("user_id", userId)
        .eq("status", "accepted")
        .is("feedback", null)
        .lte("feedback_due_at", completedAt)
        .select("id")
        .maybeSingle();

      if (error) {
        throw new AgentActionFeedbackRepositoryError(error.code);
      }

      return data !== null;
    },
  };

  try {
    return await submitActionFeedbackForUser(
      user.id,
      actionId,
      feedback,
      repository,
    );
  } catch (error: unknown) {
    logSafeError("Supabase 行动反馈保存失败", error);
    return { status: "error" };
  }
}
