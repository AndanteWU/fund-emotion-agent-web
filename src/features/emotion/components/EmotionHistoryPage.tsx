import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import LoginPrompt from "@/features/auth/components/LoginPrompt";
import { queryEmotionHistory } from "../services/emotion-history-service";
import EmotionHistoryFilters from "./EmotionHistoryFilters";
import EmotionHistoryList from "./EmotionHistoryList";

export interface EmotionHistorySearchParams {
  emotion?: string | string[];
  start?: string | string[];
  end?: string | string[];
}

interface EmotionHistoryPageProps {
  searchParams: EmotionHistorySearchParams;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EmotionHistoryPage({
  searchParams,
}: EmotionHistoryPageProps) {
  const emotion = firstValue(searchParams.emotion);
  const startDate = firstValue(searchParams.start);
  const endDate = firstValue(searchParams.end);
  const result = await queryEmotionHistory({ emotion, startDate, endDate });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              情绪历史
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              看见一段时间里的情绪轨迹
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              默认展示最近 30 天，只呈现已经记录的感受与行为。
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/record"
              className={buttonVariants({ variant: "outline" })}
            >
              新建记录
            </Link>
            <Link href="/insight" className={buttonVariants()}>
              查看统计
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
          暂时无法读取历史记录，请稍后再试。
        </div>
      )}

      {result.status === "success" && (
        <div className="space-y-6">
          <EmotionHistoryFilters
            range={result.range}
            selectedEmotion={emotion}
          />
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-medium">记录列表</h2>
            <p className="text-sm text-muted-foreground">
              共 {result.records.length} 条
            </p>
          </div>
          <EmotionHistoryList records={result.records} />
        </div>
      )}
    </main>
  );
}
