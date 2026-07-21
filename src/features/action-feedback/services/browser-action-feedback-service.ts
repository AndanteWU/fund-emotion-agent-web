import type {
  AgentActionFeedback,
  DueActionFeedbackPrompt,
} from "../types";

type PendingActionClaimResult =
  | { status: "claimed"; action: DueActionFeedbackPrompt }
  | { status: "none" | "unauthenticated" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readPrompt(value: unknown): DueActionFeedbackPrompt | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.observationTitle !== "string" ||
    typeof value.actionTitle !== "string" ||
    typeof value.actionInstruction !== "string" ||
    typeof value.feedbackDueAt !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    observationTitle: value.observationTitle,
    actionTitle: value.actionTitle,
    actionInstruction: value.actionInstruction,
    feedbackDueAt: value.feedbackDueAt,
  };
}

export async function claimPendingActionFeedback(): Promise<PendingActionClaimResult> {
  const response = await fetch("/api/action-feedback/pending/claim", {
    method: "POST",
    cache: "no-store",
  });

  if (response.status === 401) {
    return { status: "unauthenticated" };
  }

  const payload: unknown = await response.json();
  if (response.ok && isRecord(payload) && payload.status === "none") {
    return { status: "none" };
  }

  const action =
    isRecord(payload) && payload.status === "claimed"
      ? readPrompt(payload.action)
      : null;

  if (!response.ok || !action) {
    throw new Error("Pending action feedback is unavailable.");
  }

  return { status: "claimed", action };
}

export async function submitActionFeedbackChoice(
  actionId: string,
  feedback: AgentActionFeedback,
): Promise<void> {
  const response = await fetch(
    `/api/action-feedback/${encodeURIComponent(actionId)}/feedback`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ feedback }),
    },
  );
  const payload: unknown = await response.json();

  if (
    response.ok &&
    isRecord(payload) &&
    (payload.status === "completed" || payload.status === "already_completed")
  ) {
    return;
  }

  throw new Error("Action feedback could not be saved.");
}
