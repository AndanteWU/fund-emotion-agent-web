"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EMOTION_COLOR_STYLES, isEmotion } from "../constants";
import type { EmotionRecordRow } from "../types";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"] as const;
const CALENDAR_CELL_COUNT = 42;

interface CalendarMonth {
  year: number;
  monthIndex: number;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
}

interface EmotionCalendarProps {
  month: CalendarMonth;
  records: EmotionRecordRow[];
  selectedDate: string | null;
  onMonthChange: (offset: -1 | 1) => void;
  onDateSelect: (date: string) => void;
}

function formatDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function createCalendarDays(month: CalendarMonth): CalendarDay[] {
  const firstWeekday =
    (new Date(month.year, month.monthIndex, 1).getDay() + 6) % 7;

  return Array.from({ length: CALENDAR_CELL_COUNT }, (_, index) => {
    const date = new Date(
      month.year,
      month.monthIndex,
      index - firstWeekday + 1,
    );

    return {
      date: formatDate(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      isCurrentMonth:
        date.getFullYear() === month.year &&
        date.getMonth() === month.monthIndex,
    };
  });
}

function getToday(): string {
  const today = new Date();
  return formatDate(today.getFullYear(), today.getMonth(), today.getDate());
}

export type { CalendarMonth };

export default function EmotionCalendar({
  month,
  records,
  selectedDate,
  onMonthChange,
  onDateSelect,
}: EmotionCalendarProps) {
  const days = createCalendarDays(month);
  const today = getToday();
  const recordsByDate = new Map(
    records.map((record) => [record.record_date, record]),
  );

  return (
    <Card className="w-full min-w-0 [--card-spacing:--spacing(4)]">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-1">
        <CardTitle className="text-base">
          {month.year} 年 {month.monthIndex + 1} 月
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onMonthChange(-1)}
            className="rounded-full bg-muted/45 hover:bg-muted"
            aria-label="上一个月"
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onMonthChange(1)}
            className="rounded-full bg-muted/45 hover:bg-muted"
            aria-label="下一个月"
          >
            <ChevronRight />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="grid min-w-0 grid-cols-[repeat(7,minmax(0,1fr))] gap-x-0.5">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="flex h-7 items-center justify-center text-[10px] font-medium text-muted-foreground sm:text-[11px]"
            >
              {weekday}
            </div>
          ))}
          {days.map((calendarDay) => {
            if (!calendarDay.isCurrentMonth) {
              return (
                <div
                  key={calendarDay.date}
                  className="flex h-11 min-w-0 items-center justify-center text-[11px] text-muted-foreground/30 sm:h-14 sm:text-xs"
                  aria-hidden="true"
                >
                  {calendarDay.day}
                </div>
              );
            }

            const record = recordsByDate.get(calendarDay.date);
            const emotion = record?.strongest_emotion ?? null;
            const emotionStyle = isEmotion(emotion)
              ? EMOTION_COLOR_STYLES[emotion]
              : null;
            const isSelected = selectedDate === calendarDay.date;
            const isToday = today === calendarDay.date;

            return (
              <button
                key={calendarDay.date}
                type="button"
                onClick={() => onDateSelect(calendarDay.date)}
                aria-label={`${calendarDay.date}${emotion ? `，${emotion}` : "，无记录"}`}
                aria-pressed={isSelected}
                className="group flex h-11 min-w-0 items-center justify-center rounded-xl focus-visible:outline-none sm:h-14"
              >
                <span
                  className={cn(
                    "relative grid size-8 place-items-center rounded-full text-[11px] font-medium transition-[background-color,box-shadow] sm:size-9 sm:text-xs",
                    emotionStyle
                      ? emotionStyle.surface
                      : "text-foreground group-hover:bg-muted/60",
                    isSelected &&
                      "ring-1 ring-foreground/45 ring-offset-2 ring-offset-card",
                    "group-focus-visible:ring-2 group-focus-visible:ring-ring/35 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-card",
                  )}
                >
                  {calendarDay.day}
                  {isToday && (
                    <span
                      className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-foreground/45"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}