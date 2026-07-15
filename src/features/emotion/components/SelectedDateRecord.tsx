import { Button } from "@/components/ui/button";
import type { EmotionRecordRow } from "../types";
import EmotionHistoryCard from "./EmotionHistoryCard";

interface SelectedDateRecordProps {
  date: string;
  records: EmotionRecordRow[];
  onClear: () => void;
}

function formatSelectedDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${year}年${month}月${day}日`;
}

export default function SelectedDateRecord({
  date,
  records,
  onClear,
}: SelectedDateRecordProps) {
  return (
    <section className="space-y-4" aria-labelledby="selected-date-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">已选择日期</p>
          <h2 id="selected-date-heading" className="mt-1 font-medium">
            {formatSelectedDate(date)}
          </h2>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          查看全部
        </Button>
      </div>

      {records.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {records.map((record) => (
            <EmotionHistoryCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-card px-5 py-8 text-center text-sm text-muted-foreground">
          当天没有情绪记录。
        </div>
      )}
    </section>
  );
}