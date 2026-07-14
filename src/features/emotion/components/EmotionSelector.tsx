"use client";

import { EMOTIONS } from "@/features/emotion/constants";
import type { Emotion } from "@/features/emotion/types";

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
      {EMOTIONS.map((emotion) => (
        <button
          key={emotion}
          type="button"
          role="radio"
          aria-checked={value === emotion}
          disabled={disabled}
          onClick={() => onChange(emotion)}
          className={`min-h-11 rounded-xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${
            value === emotion
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-accent"
          }`}
        >
          {emotion}
        </button>
      ))}
    </div>
  );
}