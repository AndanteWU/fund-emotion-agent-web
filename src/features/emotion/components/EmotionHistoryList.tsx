import type { EmotionRecordRow } from "../types";
import EmotionHistoryCard from "./EmotionHistoryCard";

interface EmotionHistoryListProps {
  records: EmotionRecordRow[];
}

export default function EmotionHistoryList({
  records,
}: EmotionHistoryListProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-14 text-center">
        <h2 className="font-medium">这段时间还没有情绪记录</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          可以调整筛选范围，或先完成一次新的情绪记录。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <EmotionHistoryCard key={record.id} record={record} />
      ))}
    </div>
  );
}
