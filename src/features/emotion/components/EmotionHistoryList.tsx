import EmptyState from "@/components/layout/EmptyState";
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
      <EmptyState
        title="这段时间还没有情绪记录"
        description="可以调整筛选范围，或先完成一次新的情绪记录。"
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {records.map((record) => (
        <EmotionHistoryCard key={record.id} record={record} />
      ))}
    </div>
  );
}