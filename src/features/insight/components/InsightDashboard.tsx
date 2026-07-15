import Link from "next/link";
import EmptyState from "@/components/layout/EmptyState";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
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
    <PageContainer>
      <PageHeader
        eyebrow="基础统计与 AI 复盘"
        title="最近 30 天的情绪概览"
        description="统计只基于你的记录，用于观察情绪与行为模式，不构成投资建议。"
        actions={
          <>
            <Link
              href="/history"
              className={buttonVariants({ variant: "outline" })}
            >
              查看历史
            </Link>
            <Link href="/record" className={buttonVariants()}>
              新建记录
            </Link>
          </>
        }
      />

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
          <EmptyState
            title="最近 30 天还没有情绪记录"
            description="完成第一条记录后，这里会展示趋势、组成统计和 AI 情绪复盘。"
            action={
              <Link href="/record" className={buttonVariants()}>
                开始记录
              </Link>
            }
          />
        ) : (
          <InsightContent records={result.records} />
        ))}
    </PageContainer>
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