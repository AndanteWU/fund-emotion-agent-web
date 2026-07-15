import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import LoginPrompt from "@/features/auth/components/LoginPrompt";
import { queryEmotionHistory } from "../services/emotion-history-service";
import EmotionHistoryExplorer from "./EmotionHistoryExplorer";

export interface EmotionHistorySearchParams {
  emotion?: string | string[];
  start?: string | string[];
  end?: string | string[];
  month?: string | string[];
}

interface EmotionHistoryPageProps {
  searchParams: EmotionHistorySearchParams;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function resolveCalendarMonth(value: string | undefined): string {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? "")
    ? (value ?? getCurrentMonth())
    : getCurrentMonth();
}

function getCalendarMonthRange(month: string): {
  startDate: string;
  endDate: string;
} {
  const [yearValue, monthValue] = month.split("-");
  const year = Number(yearValue);
  const monthIndex = Number(monthValue) - 1;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();

  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}
export default async function EmotionHistoryPage({
  searchParams,
}: EmotionHistoryPageProps) {
  const emotion = firstValue(searchParams.emotion);
  const startDate = firstValue(searchParams.start);
  const endDate = firstValue(searchParams.end);
  const calendarMonth = resolveCalendarMonth(firstValue(searchParams.month));
  const monthRange = getCalendarMonthRange(calendarMonth);
  const result = await queryEmotionHistory({
    emotion,
    startDate: startDate ?? monthRange.startDate,
    endDate: endDate ?? monthRange.endDate,
  });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="情绪历史"
        title="看见一段时间里的情绪轨迹"
        description="通过日历定位每一天的情绪记录，回看感受与行为的变化。"
        actions={
          <>
            <Link
              href="/record"
              className={buttonVariants({ variant: "outline" })}
            >
              新建记录
            </Link>
            <Link href="/insight" className={buttonVariants()}>
              查看复盘
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
          暂时无法读取历史记录，请稍后再试。
        </div>
      )}

      {result.status === "success" && (
        <EmotionHistoryExplorer
          key={`${calendarMonth}-${result.range.startDate}-${result.range.endDate}`}
          initialMonth={calendarMonth}
          range={result.range}
          records={result.records}
          selectedEmotion={emotion}
        />
      )}
    </PageContainer>
  );
}