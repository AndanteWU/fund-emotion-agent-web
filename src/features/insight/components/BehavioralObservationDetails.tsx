import { Badge } from "@/components/ui/badge";
import { EMOTION_COLOR_STYLES } from "@/features/emotion/constants";
import type {
  BehavioralPattern,
  BehavioralPatternSeverity,
} from "../types";

interface BehavioralObservationDetailsProps {
  pattern: BehavioralPattern;
}

const SEVERITY_PRESENTATION: Record<
  BehavioralPatternSeverity,
  { label: string; className: string }
> = {
  low: {
    label: "低",
    className: EMOTION_COLOR_STYLES.平静.surface,
  },
  medium: {
    label: "中",
    className: EMOTION_COLOR_STYLES.焦虑.surface,
  },
  high: {
    label: "高",
    className: EMOTION_COLOR_STYLES.恐惧.surface,
  },
};

export default function BehavioralObservationDetails({
  pattern,
}: BehavioralObservationDetailsProps) {
  const severity = SEVERITY_PRESENTATION[pattern.severity];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-xl font-medium tracking-[-0.025em]">
          {pattern.title}
        </h3>
        <Badge className={`border-transparent ${severity.className}`}>
          程度：{severity.label}
        </Badge>
      </div>
      <p className="text-sm leading-7 text-foreground/80">
        {pattern.evidence}
      </p>
      <p className="text-xs leading-5 text-muted-foreground">
        这是一项行为观察，不构成投资建议。
      </p>
    </div>
  );
}
