"use client";

import { EMOTIONS } from "@/features/emotion/constants";
import { useState } from "react";

export default function EmotionSelector() {
  const [selectedEmotion, setSelectedEmotion] = useState("");

  return (
    <div className="grid grid-cols-4 gap-3">
      {EMOTIONS.map((emotion) => (
        <button
          key={emotion}
          onClick={() => setSelectedEmotion(emotion)}
          className={`rounded-xl border p-3 transition ${
            selectedEmotion === emotion
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          {emotion}
        </button>
      ))}

      {selectedEmotion && (
        <p className="col-span-4 mt-4 text-sm text-muted-foreground">
          当前选择：{selectedEmotion}
        </p>
      )}
    </div>
  );
}