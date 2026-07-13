"use client";

import { useState } from "react";

const emotions = [
  "平静",
  "焦虑",
  "兴奋",
  "后悔",
  "恐惧",
  "贪婪",
  "烦躁",
  "麻木",
];

export default function EmotionSelector() {
  const [selectedEmotion, setSelectedEmotion] = useState("");

  return (
    <div className="grid grid-cols-4 gap-3">
      {emotions.map((emotion) => (
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