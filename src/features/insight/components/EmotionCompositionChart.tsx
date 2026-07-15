"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EMOTION_COLOR_STYLES,
  isEmotion,
} from "@/features/emotion/constants";
import type { EmotionCompositionPoint } from "../types";

const FALLBACK_CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function getChartColor(name: string, index: number): string {
  return isEmotion(name)
    ? EMOTION_COLOR_STYLES[name].chart
    : FALLBACK_CHART_COLORS[index % FALLBACK_CHART_COLORS.length];
}

interface EmotionCompositionChartProps {
  data: EmotionCompositionPoint[];
}

export default function EmotionCompositionChart({
  data,
}: EmotionCompositionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>情绪组成</CardTitle>
        <CardDescription>按主要情绪统计记录次数。</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            暂无可绘制的情绪组成数据
          </div>
        ) : (
          <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_13rem]">
            <div
              className="h-64 w-full"
              role="img"
              aria-label="最近三十天主要情绪组成环形图"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart accessibilityLayer>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="82%"
                    paddingAngle={2}
                    stroke="var(--card)"
                  >
                    {data.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={getChartColor(item.name, index)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--popover-foreground)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-sm">
              {data.map((item, index) => (
                <li
                  key={item.name}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: getChartColor(item.name, index) }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="min-w-24 whitespace-nowrap text-right text-muted-foreground tabular-nums">
                    {item.value} 条（{Math.round((item.value / total) * 100)}%）
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}