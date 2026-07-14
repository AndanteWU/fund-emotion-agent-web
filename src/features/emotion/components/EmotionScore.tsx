"use client";

import { Slider } from "@/components/ui/slider";

interface EmotionScoreProps {
  id: string;
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function EmotionScore({
  id,
  label,
  description,
  value,
  onChange,
  disabled = false,
}: EmotionScoreProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor={id} className="font-medium">
            {label}
          </label>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <output
          htmlFor={id}
          className="min-w-12 rounded-full bg-muted px-3 py-1 text-center text-sm font-semibold tabular-nums"
        >
          {value}/10
        </output>
      </div>

      <Slider
        id={id}
        value={[value]}
        min={0}
        max={10}
        step={1}
        disabled={disabled}
        aria-label={label}
        onValueChange={(nextValue) => {
          const score = Array.isArray(nextValue) ? nextValue[0] : nextValue;
          if (typeof score === "number") {
            onChange(score);
          }
        }}
      />
    </div>
  );
}