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
  surface: string;
  dot: string;
  chart: string;
}

export const EMOTION_COLOR_STYLES: Record<Emotion, EmotionColorStyle> = {
  平静: {
    surface:
      "bg-[var(--emotion-calm-soft)] text-[var(--emotion-calm-foreground)]",
    dot: "bg-[var(--emotion-calm)]",
    chart: "var(--emotion-calm)",
  },
  焦虑: {
    surface:
      "bg-[var(--emotion-anxiety-soft)] text-[var(--emotion-anxiety-foreground)]",
    dot: "bg-[var(--emotion-anxiety)]",
    chart: "var(--emotion-anxiety)",
  },
  兴奋: {
    surface:
      "bg-[var(--emotion-excitement-soft)] text-[var(--emotion-excitement-foreground)]",
    dot: "bg-[var(--emotion-excitement)]",
    chart: "var(--emotion-excitement)",
  },
  后悔: {
    surface:
      "bg-[var(--emotion-regret-soft)] text-[var(--emotion-regret-foreground)]",
    dot: "bg-[var(--emotion-regret)]",
    chart: "var(--emotion-regret)",
  },
  恐惧: {
    surface:
      "bg-[var(--emotion-fear-soft)] text-[var(--emotion-fear-foreground)]",
    dot: "bg-[var(--emotion-fear)]",
    chart: "var(--emotion-fear)",
  },
  贪婪: {
    surface:
      "bg-[var(--emotion-greed-soft)] text-[var(--emotion-greed-foreground)]",
    dot: "bg-[var(--emotion-greed)]",
    chart: "var(--emotion-greed)",
  },
  烦躁: {
    surface:
      "bg-[var(--emotion-irritation-soft)] text-[var(--emotion-irritation-foreground)]",
    dot: "bg-[var(--emotion-irritation)]",
    chart: "var(--emotion-irritation)",
  },
  麻木: {
    surface:
      "bg-[var(--emotion-numbness-soft)] text-[var(--emotion-numbness-foreground)]",
    dot: "bg-[var(--emotion-numbness)]",
    chart: "var(--emotion-numbness)",
  },
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