import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import LoginPrompt from "@/features/auth/components/LoginPrompt";
import { queryEmotionHistory } from "@/features/emotion/services/emotion-history-service";
import type { EmotionRecordRow } from "@/features/emotion/types";
import { calculateEmotionInsights } from "../services/emotion-statistics";
import AiEmotionReviewPanel from "./AiEmotionReviewPanel";
import EmotionCompositionChart from "./EmotionCompositionChart";
import EmotionTrendChart from "./EmotionTrendChart";
import HighScoreDateList from "./HighScoreDateList";
import InsightStatCards from "./InsightStatCards";

export default async function InsightDashboard() {
  const result = await queryEmotionHistory();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              基础统计
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              最近 30 天的情绪概览
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              统计只基于你的记录，用于观察情绪与行为模式，不构成投资建议。
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/history"
              className={buttonVariants({ variant: "outline" })}
            >
              查看历史
            </Link>
            <Link href="/record" className={buttonVariants()}>
              新建记录
            </Link>
          </div>
        </div>
      </header>

      {result.status === "unauthenticated" && <LoginPrompt />}

      {result.status === "error" && (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm text-destructive"
          role="alert"
        >
          暂时无法读取统计数据，请稍后再试。
        </div>
      )}

      {result.status === "success" &&
        (result.records.length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-16 text-center">
            <h2 className="font-medium">最近 30 天还没有情绪记录</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              完成第一条记录后，这里会展示趋势和组成统计。
            </p>
            <Link
              href="/record"
              className={buttonVariants({ className: "mt-5" })}
            >
              开始记录
            </Link>
          </div>
        ) : (
          <InsightContent records={result.records} />
        ))}
    </main>
  );
}

interface InsightContentProps {
  records: EmotionRecordRow[];
}

function InsightContent({ records }: InsightContentProps) {
  const insights = calculateEmotionInsights(records);

  return (
    <div className="space-y-6">
      <InsightStatCards summary={insights.summary} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <EmotionTrendChart data={insights.trend} />
        </div>
        <div className="lg:col-span-2">
          <EmotionCompositionChart data={insights.composition} />
        </div>
      </div>
      <HighScoreDateList dates={insights.highScoreDates} />
      <AiEmotionReviewPanel />
    </div>
  );
}
