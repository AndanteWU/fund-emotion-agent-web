import { NextResponse } from "next/server";
import { AiConfigurationError } from "@/lib/ai";
import { queryEmotionHistory } from "@/features/emotion/services/emotion-history-service";
import { generateAiEmotionReview } from "@/features/insight/services/ai-emotion-review-service";
import {
  composeActionableEmotionReview,
  createAiReviewPromptContext,
  createDeterministicReviewContext,
} from "@/features/insight/services/actionable-emotion-review";

function getErrorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return null;
}

export async function POST() {
  const history = await queryEmotionHistory();

  if (history.status === "unauthenticated") {
    return NextResponse.json(
      {
        status: "error",
        code: "unauthenticated",
        message: "请先登录后再生成 AI 复盘。",
      },
      { status: 401 },
    );
  }

  if (history.status === "error") {
    return NextResponse.json(
      {
        status: "error",
        code: "history_unavailable",
        message: "暂时无法读取情绪记录，请稍后再试。",
      },
      { status: 500 },
    );
  }

  if (history.records.length === 0) {
    return NextResponse.json({
      status: "empty",
      message: "最近 30 天没有情绪记录，暂时无法生成复盘。",
    });
  }

  try {
    const deterministicContext = createDeterministicReviewContext(
      history.records,
    );
    const promptContext = createAiReviewPromptContext(
      deterministicContext,
      history.records,
    );
    const aiOutput = await generateAiEmotionReview(promptContext);
    const actionableReview = composeActionableEmotionReview(
      deterministicContext,
      aiOutput,
    );
    const review = {
      ...actionableReview,
      reviewId: crypto.randomUUID(),
      sourceStartDate: history.range.startDate,
      sourceEndDate: history.range.endDate,
    };

    return NextResponse.json({ status: "success", review });
  } catch (error: unknown) {
    if (error instanceof AiConfigurationError) {
      return NextResponse.json(
        {
          status: "error",
          code: "ai_not_configured",
          message: "AI 复盘服务尚未配置，请联系管理员。",
        },
        { status: 503 },
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.error("DeepSeek AI 复盘生成失败", {
        status: getErrorStatus(error),
        errorName: error instanceof Error ? error.name : "UnknownError",
        message: "DeepSeek request or structured output validation failed.",
      });
    }

    return NextResponse.json(
      {
        status: "error",
        code: "generation_failed",
        message: "暂时无法生成 AI 复盘，请稍后重试。",
      },
      { status: 502 },
    );
  }
}
