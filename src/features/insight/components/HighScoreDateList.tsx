import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HighScoreDate } from "../types";

interface HighScoreDateListProps {
  dates: HighScoreDate[];
}

function scoreLabel(value: number | null): string {
  return value === null ? "—" : String(value);
}

export default function HighScoreDateList({
  dates,
}: HighScoreDateListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>高分日期</CardTitle>
        <CardDescription>
          焦虑、FOMO 或冲动任一评分达到 7 分及以上。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dates.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            最近 30 天没有高分日期
          </p>
        ) : (
          <ul className="divide-y">
            {dates.map((day) => (
              <li
                key={day.date}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{day.date}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {day.emotions.length > 0
                      ? day.emotions.join("、")
                      : "未记录主要情绪"}
                  </p>
                </div>
                <dl className="grid grid-cols-3 gap-5 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">焦虑</dt>
                    <dd className="mt-1 font-medium tabular-nums">
                      {scoreLabel(day.anxiety)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">FOMO</dt>
                    <dd className="mt-1 font-medium tabular-nums">
                      {scoreLabel(day.fomo)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">冲动</dt>
                    <dd className="mt-1 font-medium tabular-nums">
                      {scoreLabel(day.impulse)}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
