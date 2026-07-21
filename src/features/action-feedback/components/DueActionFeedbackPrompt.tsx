"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  claimPendingActionFeedback,
  submitActionFeedbackChoice,
} from "../services/browser-action-feedback-service";
import type {
  AgentActionFeedback,
  DueActionFeedbackPrompt,
} from "../types";
import {
  ActionFeedbackCard,
  ActionFeedbackCompletionStatus,
} from "./ActionFeedbackCard";

type LoadState = "loading" | "none" | "ready" | "error" | "completed";

type ClaimRequest = ReturnType<typeof claimPendingActionFeedback>;

export default function DueActionFeedbackPrompt() {
  const claimRequest = useRef<{ key: number; request: ClaimRequest } | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [action, setAction] = useState<DueActionFeedbackPrompt | null>(null);
  const [submittingFeedback, setSubmittingFeedback] =
    useState<AgentActionFeedback | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    if (!claimRequest.current || claimRequest.current.key !== retryKey) {
      claimRequest.current = {
        key: retryKey,
        request: claimPendingActionFeedback(),
      };
    }

    claimRequest.current.request
      .then((result) => {
        if (!active) {
          return;
        }

        if (result.status === "claimed") {
          setAction(result.action);
          setLoadState("ready");
          return;
        }

        setLoadState("none");
      })
      .catch(() => {
        if (active) {
          setLoadState("error");
        }
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  async function handleFeedback(feedback: AgentActionFeedback) {
    if (!action || submittingFeedback !== null) {
      return;
    }

    setSubmittingFeedback(feedback);
    setSubmitError(null);

    try {
      await submitActionFeedbackChoice(action.id, feedback);
      setLoadState("completed");
    } catch {
      setSubmitError("暂时无法保存反馈，请稍后重试。");
    } finally {
      setSubmittingFeedback(null);
    }
  }

  if (loadState === "loading" || loadState === "none") {
    return null;
  }

  if (loadState === "completed") {
    return <ActionFeedbackCompletionStatus />;
  }

  if (loadState === "error") {
    return (
      <Card className="border-border/60 shadow-none">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground" role="alert">
            暂时无法查看待反馈行动。
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLoadState("loading");
              setRetryKey((current) => current + 1);
            }}
          >
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!action) {
    return null;
  }

  return (
    <ActionFeedbackCard
      action={action}
      submittingFeedback={submittingFeedback}
      errorMessage={submitError}
      onFeedback={handleFeedback}
    />
  );
}
