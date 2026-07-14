import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EmotionRecordRow } from "../types";

interface EmotionHistoryCardProps {
  record: EmotionRecordRow;
}

function displayValue(value: string | number | null): string {
  if (value === null || value === "") {
    return "—";
  }

  return String(value);
}

function formatRecordDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${year}年${month}月${day}日`;
}

export default function EmotionHistoryCard({
  record,
}: EmotionHistoryCardProps) {
  const scores = [
    { label: "焦虑", value: record.anxiety_level },
    { label: "FOMO", value: record.fomo_level },
    { label: "冲动", value: record.impulse_level },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">记录日期</p>
          <CardTitle className="mt-1">
            {formatRecordDate(record.record_date)}
          </CardTitle>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
          {displayValue(record.strongest_emotion)}
        </span>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {scores.map((score) => (
            <div key={score.label} className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">{score.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {displayValue(score.value)}
                {score.value !== null && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    /10
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>

        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4 border-b pb-2">
            <dt className="text-muted-foreground">查看账户频率</dt>
            <dd className="text-right font-medium">
              {displayValue(record.account_check_frequency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b pb-2">
            <dt className="text-muted-foreground">产生操作冲动</dt>
            <dd className="font-medium">
              {displayValue(record.operation_impulse)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b pb-2">
            <dt className="text-muted-foreground">实际操作</dt>
            <dd className="font-medium">{displayValue(record.actual_action)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b pb-2">
            <dt className="text-muted-foreground">冲动来源</dt>
            <dd className="text-right font-medium">
              {displayValue(record.impulse_source)}
            </dd>
          </div>
        </dl>

        <div>
          <p className="text-xs text-muted-foreground">一句话记录</p>
          <p className="mt-2 whitespace-pre-wrap leading-6">
            {displayValue(record.note)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
