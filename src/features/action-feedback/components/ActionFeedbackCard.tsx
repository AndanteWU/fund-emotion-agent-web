"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  AgentActionFeedback,
  DueActionFeedbackPrompt,
} from "../types";

interface ActionFeedbackCardProps {
  action: DueActionFeedbackPrompt;
  submittingFeedback?: AgentActionFeedback | null;
  errorMessage?: string | null;
  onFeedback: (feedback: AgentActionFeedback) => void;
}

const feedbackChoices: Array<{
  value: AgentActionFeedback;
  label: string;
}> = [
  { value: "helpful", label: "有帮助" },
  { value: "not_helpful", label: "没有帮助" },
  { value: "not_tried", label: "没有尝试" },
];

export function ActionFeedbackCompletionStatus() {
  return (
    <div
      className="rounded-2xl border border-border/60 bg-card px-5 py-4 text-sm text-foreground/80 shadow-[var(--shadow-card)]"
      role="status"
    >
      反馈已记录，谢谢你的回应。
    </div>
  );
}

export function ActionFeedbackCard({
  action,
  submittingFeedback = null,
  errorMessage = null,
  onFeedback,
}: ActionFeedbackCardProps) {
  const isSubmitting = submittingFeedback !== null;

  return (
    <Card className="border-border/60 bg-card shadow-[var(--shadow-card)]">
      <CardHeader className="gap-2">
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground">
          行动反馈
        </p>
        <CardTitle className="text-2xl">这个行动对你有帮助吗？</CardTitle>
        <CardDescription className="leading-6">
          之前的观察：{action.observationTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl bg-muted/55 px-4 py-4">
          <p className="font-medium text-foreground">{action.actionTitle}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {action.actionInstruction}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {feedbackChoices.map((choice) => (
            <Button
              key={choice.value}
              type="button"
              variant={choice.value === "helpful" ? "default" : "outline"}
              disabled={isSubmitting}
              onClick={() => onFeedback(choice.value)}
            >
              {submittingFeedback === choice.value
                ? "正在保存…"
                : choice.label}
            </Button>
          ))}
        </div>

        {errorMessage && (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
