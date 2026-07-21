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
  actionableEmotionReviewSchema,
  type ActionableEmotionReview,
} from "../ai-review-schema";
import AiEmotionReviewResult from "./AiEmotionReviewResult";

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

export default function AiEmotionReviewPanel() {
  const [state, setState] = useState<ReviewState>("idle");
  const [review, setReview] = useState<ActionableEmotionReview | null>(null);
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
        const parsed = actionableEmotionReviewSchema.safeParse(payload.review);
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
        <CardTitle>投资情绪观察</CardTitle>
        <CardDescription className="leading-6">
          从最近 30 天的记录中，找出此刻最值得留意的一项变化。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {state === "idle" && (
          <div className="rounded-xl bg-muted/60 px-4 py-5">
            <p className="text-sm leading-6 text-muted-foreground">
              生成后只展示一项重点变化、一个今天可以完成的行动和一个值得思考的问题。详细判断依据会默认收起，结果不会保存到数据库。
            </p>
          </div>
        )}

        {isLoading && (
          <div className="rounded-xl bg-muted/60 px-4 py-8 text-center">
            <p className="font-medium">正在整理最近 30 天的记录…</p>
            <p className="mt-2 text-sm text-muted-foreground">
              正在把确定性证据整理成一次简短观察。
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
          <AiEmotionReviewResult review={review} />
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
              ? "生成情绪观察"
              : "重新生成"}
        </Button>
      </CardContent>
    </Card>
  );
}