"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionDecisionRequest } from "../schemas";
import type { AgentActionDecision } from "../types";

export type ActionDecisionUiState =
  | "idle"
  | "saving"
  | "accepted"
  | "declined"
  | "existing_pending_action"
  | "error";

type ActionDecisionContext = Omit<ActionDecisionRequest, "decision">;

interface ActionDecisionControlsProps {
  decisionContext: ActionDecisionContext;
}

interface ActionDecisionStatusProps {
  state: Exclude<ActionDecisionUiState, "idle" | "saving">;
}

function readDecisionResponse(payload: unknown): {
  status: string | null;
  decision: AgentActionDecision | null;
} {
  if (typeof payload !== "object" || payload === null) {
    return { status: null, decision: null };
  }

  const status =
    "status" in payload && typeof payload.status === "string"
      ? payload.status
      : null;
  const decision =
    "decision" in payload &&
    (payload.decision === "accepted" || payload.decision === "declined")
      ? payload.decision
      : null;

  return { status, decision };
}

export function ActionDecisionStatus({ state }: ActionDecisionStatusProps) {
  const messages = {
    accepted: "行动已保存。24 小时后，我们会询问它是否对你有帮助。",
    declined: "已记录。本次不会继续提醒。",
    existing_pending_action:
      "你已经有一个正在尝试的行动，完成反馈后再接受新的行动。",
    error: "暂时无法保存行动选择，请稍后重试。",
  } as const;

  return (
    <p
      className={`rounded-xl px-4 py-3 text-sm leading-6 ${
        state === "error"
          ? "border border-destructive/25 bg-destructive/8 text-destructive"
          : "border border-border/55 bg-muted/45 text-foreground/80"
      }`}
      role={state === "error" ? "alert" : "status"}
    >
      {messages[state]}
    </p>
  );
}

export default function ActionDecisionControls({
  decisionContext,
}: ActionDecisionControlsProps) {
  const [state, setState] = useState<ActionDecisionUiState>("idle");
  const [retryDecision, setRetryDecision] =
    useState<AgentActionDecision | null>(null);

  async function saveDecision(decision: AgentActionDecision) {
    if (state === "saving" || state === "accepted" || state === "declined") {
      return;
    }

    setState("saving");
    setRetryDecision(decision);

    try {
      const response = await fetch("/api/action-feedback/decision", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...decisionContext, decision }),
      });
      const payload: unknown = await response.json();
      const result = readDecisionResponse(payload);

      if (
        response.ok &&
        (result.status === "saved" || result.status === "already_saved") &&
        result.decision
      ) {
        setState(result.decision);
        return;
      }

      if (result.status === "existing_pending_action") {
        setState("existing_pending_action");
        return;
      }

      setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "accepted" || state === "declined") {
    return <ActionDecisionStatus state={state} />;
  }

  if (state === "existing_pending_action") {
    return <ActionDecisionStatus state="existing_pending_action" />;
  }

  if (state === "error") {
    return (
      <div className="space-y-3">
        <ActionDecisionStatus state="error" />
        {retryDecision && (
          <Button
            type="button"
            variant="outline"
            onClick={() => saveDecision(retryDecision)}
          >
            重试
          </Button>
        )}
      </div>
    );
  }

  const isSaving = state === "saving";

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row">
      <Button
        type="button"
        disabled={isSaving}
        onClick={() => saveDecision("accepted")}
      >
        {isSaving ? "正在保存…" : "愿意尝试"}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isSaving}
        onClick={() => saveDecision("declined")}
      >
        暂不尝试
      </Button>
    </div>
  );
}
