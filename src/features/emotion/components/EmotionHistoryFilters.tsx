import { Button } from "@/components/ui/button";
import { EMOTIONS } from "../constants";
import type { EmotionHistoryDateRange } from "../types";

interface EmotionHistoryFiltersProps {
  range: EmotionHistoryDateRange;
  selectedEmotion?: string;
}

export default function EmotionHistoryFilters({
  range,
  selectedEmotion = "",
}: EmotionHistoryFiltersProps) {
  return (
    <form
      action="/history"
      method="get"
      className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-3 sm:items-end"
    >
      <div className="space-y-2">
        <label htmlFor="history-emotion" className="text-sm font-medium">
          主要情绪
        </label>
        <select
          id="history-emotion"
          name="emotion"
          defaultValue={selectedEmotion}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">全部情绪</option>
          {EMOTIONS.map((emotion) => (
            <option key={emotion} value={emotion}>
              {emotion}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:col-span-2">
        <div className="space-y-2">
          <label htmlFor="history-start" className="text-sm font-medium">
            开始日期
          </label>
          <input
            id="history-start"
            name="start"
            type="date"
            defaultValue={range.startDate}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="history-end" className="text-sm font-medium">
            结束日期
          </label>
          <input
            id="history-end"
            name="end"
            type="date"
            defaultValue={range.endDate}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <Button type="submit" className="sm:col-start-3 sm:justify-self-end">
        应用筛选
      </Button>
    </form>
  );
}
