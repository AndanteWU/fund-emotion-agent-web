"use client";

import EmotionSelector from "./EmotionSelector";
import EmotionScore from "./EmotionScore";

export default function EmotionRecordForm() {
  return (
    <section className="mt-8 space-y-8">
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          今天的主要情绪
        </h2>

        <EmotionSelector />
      </div>

      <EmotionScore />
    </section>
  );
}