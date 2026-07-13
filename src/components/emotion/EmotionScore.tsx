"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";

export default function EmotionScore() {
  const [score, setScore] = useState(5);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">
        情绪强度
      </h3>

      <p className="text-sm text-muted-foreground mt-1">
        当前评分：{score}/10
      </p>

      <Slider
        className="mt-4"
        defaultValue={[5]}
        max={10}
        min={0}
        step={1}
        onValueChange={(value) => {
          setScore(Number(value));
        }}
      />
    </div>
  );
}