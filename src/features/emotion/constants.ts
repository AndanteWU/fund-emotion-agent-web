import type { Emotion, EmotionRecordFormValues } from "./types";

export const EMOTIONS: Emotion[] = [
  "平静",
  "焦虑",
  "兴奋",
  "后悔",
  "恐惧",
  "贪婪",
  "烦躁",
  "麻木",
];

export interface EmotionColorStyle {
  day: string;
  dot: string;
}

export const EMOTION_COLOR_STYLES: Record<Emotion, EmotionColorStyle> = {
  平静: { day: "bg-emerald-100 text-emerald-950", dot: "bg-emerald-500" },
  焦虑: { day: "bg-amber-100 text-amber-950", dot: "bg-amber-500" },
  兴奋: { day: "bg-sky-100 text-sky-950", dot: "bg-sky-500" },
  后悔: { day: "bg-violet-100 text-violet-950", dot: "bg-violet-500" },
  恐惧: { day: "bg-rose-100 text-rose-950", dot: "bg-rose-500" },
  贪婪: { day: "bg-orange-100 text-orange-950", dot: "bg-orange-500" },
  烦躁: { day: "bg-red-100 text-red-950", dot: "bg-red-500" },
  麻木: { day: "bg-slate-200 text-slate-950", dot: "bg-slate-500" },
};

export function isEmotion(value: string | null): value is Emotion {
  return value !== null && EMOTIONS.some((emotion) => emotion === value);
}

export const INITIAL_EMOTION_RECORD: EmotionRecordFormValues = {
  emotion: "",
  emotionScore: 5,
  anxietyScore: 5,
  fomoScore: 5,
  impulseScore: 5,
  watchFrequency: "",
  operationImpulse: null,
  actualOperation: null,
  impulseSource: "",
  note: "",
};