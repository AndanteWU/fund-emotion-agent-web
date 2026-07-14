"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  aiEmotionReviewSchema,
  type AiEmotionReview,
} from "../ai-review-schema";

type ReviewState = "idle" | "loading" | "success" | "empty" | "error";

function getResponseMessage(payload: unknown): string | null {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return null;
}

interface ReviewListProps {
  title: string;
  items: string[];
  emptyMessage?: string;
}

function ReviewList({
  title,
  items,
  emptyMessage = "暂无",
}: ReviewListProps) {
  return (
    <section>
      <h3 className="font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6">
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/50"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AiEmotionReviewPanel() {
  const [state, setState] = useState<ReviewState>("idle");
  const [review, setReview] = useState<AiEmotionReview | null>(null);
  const [message, setMessage] = useState("");

  async function generateReview() {
    if (state === "loading") {
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/insights/generate", {
        method: "POST",
      });
      const payload: unknown = await response.json();

      if (
        response.ok &&
        typeof payload === "object" &&
        payload !== null &&
        "status" in payload &&
        payload.status === "success" &&
        "review" in payload
      ) {
        const parsed = aiEmotionReviewSchema.safeParse(payload.review);
        if (parsed.success) {
          setReview(parsed.data);
          setState("success");
          return;
        }
      }

      if (
        response.ok &&
        typeof payload === "object" &&
        payload !== null &&
        "status" in payload &&
        payload.status === "empty"
      ) {
        setState("empty");
        setMessage(
          getResponseMessage(payload) ??
            "最近 30 天没有记录，暂时无法生成复盘。",
        );
        return;
      }

      setState("error");
      setMessage(
        getResponseMessage(payload) ?? "暂时无法生成 AI 复盘，请稍后重试。",
      );
    } catch {
      setState("error");
      setMessage("网络连接出现问题，请稍后重试。");
    }
  }

  const isLoading = state === "loading";

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI 投资情绪复盘</CardTitle>
        <CardDescription className="leading-6">
          根据最近 30 天记录生成行为观察，不预测市场，也不构成投资建议。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {state === "idle" && (
          <div className="rounded-xl bg-muted/60 px-4 py-5">
            <p className="text-sm leading-6 text-muted-foreground">
              生成后将展示主要情绪、反复模式、风险信号、观察点和反思问题。
              结果只在当前页面展示，不会保存到数据库。
            </p>
          </div>
        )}

        {isLoading && (
          <div className="rounded-xl bg-muted/60 px-4 py-8 text-center">
            <p className="font-medium">正在整理最近 30 天的记录…</p>
            <p className="mt-2 text-sm text-muted-foreground">
              生成结构化复盘可能需要一点时间。
            </p>
          </div>
        )}

        {(state === "error" || state === "empty") && (
          <div
            className={`rounded-xl border px-4 py-4 text-sm ${
              state === "error"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-border bg-muted/50 text-muted-foreground"
            }`}
            role={state === "error" ? "alert" : "status"}
          >
            {message}
          </div>
        )}

        {state === "success" && review && (
          <div className="space-y-7">
            <section className="rounded-xl bg-muted/60 px-4 py-5">
              <p className="text-xs text-muted-foreground">主要情绪</p>
              <p className="mt-1 text-lg font-semibold">
                {review.dominantEmotion}
              </p>
              <p className="mt-4 text-sm leading-7">{review.summary}</p>
            </section>

            <div className="grid gap-7 sm:grid-cols-2">
              <ReviewList title="行为模式" items={review.patterns} />
              <ReviewList
                title="风险信号"
                items={review.riskSignals}
                emptyMessage="记录中暂未发现明确风险信号"
              />
              <ReviewList title="观察点" items={review.observations} />
              <section>
                <h3 className="font-medium">反思问题</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
                  {review.reflectionQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        )}

        <Button
          type="button"
          size="lg"
          disabled={isLoading}
          onClick={generateReview}
        >
          {isLoading
            ? "正在生成…"
            : state === "idle"
              ? "生成 AI 复盘"
              : "重新生成"}
        </Button>
      </CardContent>
    </Card>
  );
}
