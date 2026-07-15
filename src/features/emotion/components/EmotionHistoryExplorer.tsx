"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EmotionHistoryDateRange, EmotionRecordRow } from "../types";
import EmotionCalendar, { type CalendarMonth } from "./EmotionCalendar";
import EmotionHistoryFilters from "./EmotionHistoryFilters";
import EmotionHistoryList from "./EmotionHistoryList";
import SelectedDateRecord from "./SelectedDateRecord";

interface EmotionHistoryExplorerProps {
  initialMonth: string;
  range: EmotionHistoryDateRange;
  records: EmotionRecordRow[];
  selectedEmotion?: string;
}

function parseMonth(value: string): CalendarMonth {
  const [yearValue, monthValue] = value.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);

  if (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12
  ) {
    return { year, monthIndex: month - 1 };
  }

  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

function formatMonth(month: CalendarMonth): string {
  return `${month.year}-${String(month.monthIndex + 1).padStart(2, "0")}`;
}

function getMonthRange(month: CalendarMonth): EmotionHistoryDateRange {
  const monthValue = String(month.monthIndex + 1).padStart(2, "0");
  const lastDay = new Date(month.year, month.monthIndex + 1, 0).getDate();

  return {
    startDate: `${month.year}-${monthValue}-01`,
    endDate: `${month.year}-${monthValue}-${String(lastDay).padStart(2, "0")}`,
  };
}

export default function EmotionHistoryExplorer({
  initialMonth,
  range,
  records,
  selectedEmotion,
}: EmotionHistoryExplorerProps) {
  const router = useRouter();
  const [visibleMonth, setVisibleMonth] = useState<CalendarMonth>(() =>
    parseMonth(initialMonth),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedRecords = selectedDate
    ? records.filter((record) => record.record_date === selectedDate)
    : [];
  const visibleRecords = selectedDate ? selectedRecords : records;

  function changeMonth(offset: -1 | 1) {
    const nextDate = new Date(
      visibleMonth.year,
      visibleMonth.monthIndex + offset,
      1,
    );
    const nextMonth = {
      year: nextDate.getFullYear(),
      monthIndex: nextDate.getMonth(),
    };
    const nextRange = getMonthRange(nextMonth);
    const searchParams = new URLSearchParams({
      start: nextRange.startDate,
      end: nextRange.endDate,
      month: formatMonth(nextMonth),
    });

    if (selectedEmotion) {
      searchParams.set("emotion", selectedEmotion);
    }

    setVisibleMonth(nextMonth);
    setSelectedDate(null);
    router.push(`/history?${searchParams.toString()}`);
  }

  return (
    <div className="space-y-6">
      <EmotionHistoryFilters
        range={range}
        selectedEmotion={selectedEmotion}
        calendarMonth={formatMonth(visibleMonth)}
      />
      <EmotionCalendar
        month={visibleMonth}
        records={records}
        selectedDate={selectedDate}
        onMonthChange={changeMonth}
        onDateSelect={setSelectedDate}
      />

      {selectedDate && (
        <SelectedDateRecord
          date={selectedDate}
          records={selectedRecords}
          onClear={() => setSelectedDate(null)}
        />
      )}

      <section className="space-y-4" aria-labelledby="history-list-heading">
        <div className="flex items-center justify-between gap-4">
          <h2 id="history-list-heading" className="font-medium">
            {selectedDate ? "当天记录" : "记录列表"}
          </h2>
          <p className="text-sm text-muted-foreground">
            共 {visibleRecords.length} 条
          </p>
        </div>
        <EmotionHistoryList records={visibleRecords} />
      </section>
    </div>
  );
}