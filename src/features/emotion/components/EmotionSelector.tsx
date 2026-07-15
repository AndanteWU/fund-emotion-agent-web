"use client";

import {
  EMOTIONS,
  EMOTION_COLOR_STYLES,
} from "@/features/emotion/constants";
import type { Emotion } from "@/features/emotion/types";
import { cn } from "@/lib/utils";

interface EmotionSelectorProps {
  value: Emotion | "";
  onChange: (emotion: Emotion) => void;
  disabled?: boolean;
  invalid?: boolean;
}

export default function EmotionSelector({
  value,
  onChange,
  disabled = false,
  invalid = false,
}: EmotionSelectorProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      role="radiogroup"
      aria-label="主要情绪"
      aria-invalid={invalid}
    >
      {EMOTIONS.map((emotion) => {
        const selected = value === emotion;

        return (
          <button
            key={emotion}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(emotion)}
            className={cn(
              "min-h-11 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium transition-[opacity,box-shadow,filter] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
              EMOTION_COLOR_STYLES[emotion].surface,
              selected
                ? "ring-2 ring-foreground/20 ring-offset-2 ring-offset-card"
                : "opacity-75 hover:opacity-100 hover:brightness-[0.98]",
            )}
          >
            {emotion}
          </button>
        );
      })}
    </div>
  );
}