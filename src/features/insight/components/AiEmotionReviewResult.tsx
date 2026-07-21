import ActionDecisionControls from "@/features/action-feedback/components/ActionDecisionControls";
import type { GeneratedActionableEmotionReview } from "../ai-review-schema";
import { EMOTION_COLOR_STYLES } from "../../emotion/constants";

interface AiEmotionReviewResultProps {
  review: GeneratedActionableEmotionReview;
}

const SEVERITY_PRESENTATION = {
  low: {
    label: "低",
    className: EMOTION_COLOR_STYLES.平静.surface,
  },
  medium: {
    label: "中",
    className: EMOTION_COLOR_STYLES.焦虑.surface,
  },
  high: {
    label: "高",
    className: EMOTION_COLOR_STYLES.恐惧.surface,
  },
} as const;

function displayAverage(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

function formatEvidenceDates(dates: string[]): string | null {
  if (dates.length === 0) {
    return null;
  }

  if (dates.length <= 6) {
    return dates.join("、");
  }

  return `${dates[0]} 至 ${dates[dates.length - 1]}`;
}

export default function AiEmotionReviewResult({
  review,
}: AiEmotionReviewResultProps) {
  const severity = SEVERITY_PRESENTATION[review.observation.severity];
  const primaryEvidence = review.observation.evidence[0];
  const statistics = [
    ["记录", `${review.statistics.recordCount} 条`],
    ["主要情绪", review.statistics.mostFrequentEmotion ?? "—"],
    ["平均焦虑", displayAverage(review.statistics.averageAnxiety)],
    ["平均 FOMO", displayAverage(review.statistics.averageFomo)],
    ["平均冲动", displayAverage(review.statistics.averageImpulse)],
    ["高分日期", `${review.statistics.highRiskDateCount} 天`],
  ] as const;

  return (
    <div className="space-y-5">
      <section className="rounded-[22px] border border-foreground/10 bg-[linear-gradient(145deg,var(--card),color-mix(in_srgb,var(--muted)_58%,var(--card)))] px-5 py-6 shadow-[0_2px_4px_rgb(42_38_30_/_4%),0_18px_48px_rgb(42_38_30_/_8%)] sm:px-7 sm:py-7">
        <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground">
          最新观察
        </p>
        <h3 className="mt-3 max-w-3xl text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
          {review.observation.title}
        </h3>
        <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-foreground/85">
          {primaryEvidence.value}
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          {review.interpretation}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className={`rounded-full px-2.5 py-1 ${severity.className}`}>
            程度：{severity.label}
          </span>
          <span className="rounded-full border border-border/60 bg-background/55 px-2.5 py-1">
            可信度：{Math.round(review.observation.confidence * 100)}%
          </span>
        </div>
      </section>

      <section className="rounded-[20px] border border-foreground/10 bg-card px-5 py-5 shadow-[0_8px_24px_rgb(42_38_30_/_5%)] sm:px-6">
        <p className="text-xs font-medium text-muted-foreground">
          今天可以做什么
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
          {review.singleAction.title}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-foreground/80">
          {review.singleAction.instruction}
        </p>
        <ActionDecisionControls
          decisionContext={{
            reviewId: review.reviewId,
            patternType: review.observation.type,
            observationTitle: review.observation.title,
            observationEvidence: review.observation.evidence,
            sourceStartDate: review.sourceStartDate,
            sourceEndDate: review.sourceEndDate,
            actionTitle: review.singleAction.title,
            actionInstruction: review.singleAction.instruction,
          }}
        />
      </section>

      <section className="rounded-[20px] bg-muted/55 px-5 py-5 sm:px-6">
        <p className="text-xs font-medium text-muted-foreground">想一想</p>
        <p className="mt-2 max-w-3xl text-base font-medium leading-7">
          {review.reflectionQuestion}
        </p>
      </section>

      <details className="group rounded-2xl border border-border/55 bg-card/65 px-4 py-3.5">
        <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
          <span className="flex items-center justify-between gap-3">
            查看判断依据
            <span
              className="text-muted-foreground transition-transform group-open:rotate-45"
              aria-hidden="true"
            >
              ＋
            </span>
          </span>
        </summary>
        <div className="mt-4 space-y-5 border-t border-border/55 pt-4">
          <div className="space-y-3">
            {review.observation.evidence.map((evidence) => {
              const dates = formatEvidenceDates(evidence.dates);

              return (
                <article key={`${evidence.label}-${evidence.value}`}>
                  <p className="text-xs font-medium text-muted-foreground">
                    {evidence.label}
                  </p>
                  <p className="mt-1 text-sm leading-6">{evidence.value}</p>
                  {dates && (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      日期：{dates}
                    </p>
                  )}
                </article>
              );
            })}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">
              相关统计
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {statistics.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-muted/45 px-3 py-2.5"
                >
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm font-medium tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </details>

      {review.watchSignals.length > 0 && (
        <details className="group rounded-2xl border border-border/55 bg-card/65 px-4 py-3.5">
          <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
            <span className="flex items-center justify-between gap-3">
              其他需要留意的变化
              <span
                className="text-xs font-normal text-muted-foreground"
                aria-hidden="true"
              >
                {review.watchSignals.length} 项
              </span>
            </span>
          </summary>
          <ul className="mt-4 space-y-3 border-t border-border/55 pt-4">
            {review.watchSignals.map((signal) => (
              <li key={`${signal.title}-${signal.evidence}`}>
                <p className="text-sm font-medium">{signal.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {signal.evidence}
                </p>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="pt-1 text-xs leading-5 text-muted-foreground">
        {review.disclaimer}
      </p>
    </div>
  );
}