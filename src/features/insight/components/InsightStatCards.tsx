import { Card, CardContent } from "@/components/ui/card";
import { EMOTION_COLOR_STYLES } from "@/features/emotion/constants";
import type { EmotionInsightSummary, EmotionRiskLevel } from "../types";

interface InsightStatCardsProps {
  summary: EmotionInsightSummary;
}

interface StatCardItem {
  label: string;
  value: string;
  suffix: string;
  description?: string;
  dotClassName?: string;
}

const RISK_PRESENTATION: Record<
  EmotionRiskLevel,
  Pick<StatCardItem, "value" | "description" | "dotClassName">
> = {
  low: {
    value: "低",
    description: "整体较稳定",
    dotClassName: EMOTION_COLOR_STYLES.平静.dot,
  },
  medium: {
    value: "中",
    description: "存在阶段性波动",
    dotClassName: EMOTION_COLOR_STYLES.焦虑.dot,
  },
  high: {
    value: "高",
    description: "近期波动较明显",
    dotClassName: EMOTION_COLOR_STYLES.恐惧.dot,
  },
};

function displayAverage(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

export default function InsightStatCards({
  summary,
}: InsightStatCardsProps) {
  const riskPresentation = RISK_PRESENTATION[summary.riskLevel];
  const stats: StatCardItem[] = [
    {
      label: "记录总数",
      value: String(summary.totalRecords),
      suffix: "条",
    },
    {
      label: "最常出现",
      value: summary.mostFrequentEmotion ?? "—",
      suffix: "",
    },
    {
      label: "平均焦虑",
      value: displayAverage(summary.averageAnxiety),
      suffix: "/10",
    },
    {
      label: "平均 FOMO",
      value: displayAverage(summary.averageFomo),
      suffix: "/10",
    },
    {
      label: "平均冲动",
      value: displayAverage(summary.averageImpulse),
      suffix: "/10",
    },
    {
      label: "高焦虑天数",
      value: String(summary.highAnxietyDays),
      suffix: "天",
    },
    {
      label: "高 FOMO 天数",
      value: String(summary.highFomoDays),
      suffix: "天",
    },
    {
      label: "当前风险等级",
      value: riskPresentation.value,
      suffix: "",
      description: riskPresentation.description,
      dotClassName: riskPresentation.dotClassName,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm" className="min-h-28">
          <CardContent>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums">
              {stat.dotClassName && (
                <span
                  className={`size-2.5 shrink-0 rounded-full ${stat.dotClassName}`}
                  aria-hidden="true"
                />
              )}
              <span>
                {stat.value}
                {stat.value !== "—" && stat.suffix && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    {stat.suffix}
                  </span>
                )}
              </span>
            </p>
            {stat.description && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}