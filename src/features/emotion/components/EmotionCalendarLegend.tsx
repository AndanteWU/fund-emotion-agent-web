import { EMOTIONS, EMOTION_COLOR_STYLES } from "../constants";

export default function EmotionCalendarLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2" aria-label="情绪颜色图例">
      {EMOTIONS.map((emotion) => (
        <div key={emotion} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={`size-2 rounded-full ${EMOTION_COLOR_STYLES[emotion].dot}`}
            aria-hidden="true"
          />
          <span>{emotion}</span>
        </div>
      ))}
    </div>
  );
}