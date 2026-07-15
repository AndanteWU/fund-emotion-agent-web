"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EMOTION_COLOR_STYLES, isEmotion } from "../constants";
import type { EmotionRecordRow } from "../types";
import EmotionCalendarLegend from "./EmotionCalendarLegend";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"] as const;

interface CalendarMonth {
  year: number;
  monthIndex: number;
}

interface CalendarDay {
  date: string;
  day: number;
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

function createCalendarDays(month: CalendarMonth): Array<CalendarDay | null> {
  const firstWeekday = (new Date(month.year, month.monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(month.year, month.monthIndex + 1, 0).getDate();
  const cells: Array<CalendarDay | null> = Array.from(
    { length: firstWeekday },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      date: formatDate(month.year, month.monthIndex, day),
    });
  }

  return cells;
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
    <Card className="min-w-0">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onMonthChange(-1)}
          aria-label="上一个月"
        >
          <ChevronLeft />
        </Button>
        <CardTitle className="text-center">
          {month.year} 年 {month.monthIndex + 1} 月
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onMonthChange(1)}
          aria-label="下一个月"
        >
          <ChevronRight />
        </Button>
      </CardHeader>
      <CardContent className="min-w-0 space-y-5">
        <div className="grid min-w-0 grid-cols-7 gap-1 sm:gap-2">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="py-1 text-center text-xs font-medium text-muted-foreground"
            >
              {weekday}
            </div>
          ))}
          {days.map((calendarDay, index) => {
            if (!calendarDay) {
              return <div key={`empty-${index}`} aria-hidden="true" />;
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
                className={cn(
                  "relative aspect-square min-w-0 rounded-lg text-xs font-medium transition-colors sm:text-sm",
                  emotionStyle
                    ? emotionStyle.day
                    : "bg-muted/40 text-muted-foreground hover:bg-muted",
                  isToday && "ring-1 ring-inset ring-foreground/30",
                  isSelected &&
                    "z-10 ring-2 ring-foreground ring-offset-2 ring-offset-background",
                )}
              >
                <span>{calendarDay.day}</span>
                {emotionStyle && (
                  <span
                    className={cn(
                      "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full sm:size-1.5",
                      emotionStyle.dot,
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
        <EmotionCalendarLegend />
      </CardContent>
    </Card>
  );
}