import { Card, CardContent } from "@/components/ui/card";
import type { EmotionInsightSummary } from "../types";

interface InsightStatCardsProps {
  summary: EmotionInsightSummary;
}

function displayAverage(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

export default function InsightStatCards({
  summary,
}: InsightStatCardsProps) {
  const stats = [
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
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardContent>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {stat.value}
              {stat.value !== "—" && stat.suffix && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {stat.suffix}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
