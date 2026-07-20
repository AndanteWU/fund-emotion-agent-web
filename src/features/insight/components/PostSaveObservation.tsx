import BehavioralObservationDetails from "./BehavioralObservationDetails";
import type { BehavioralObservationEvaluation } from "../types";

export type PostSaveObservationState =
  | BehavioralObservationEvaluation
  | { status: "idle" | "loading" | "error" };

interface PostSaveObservationProps {
  state: PostSaveObservationState;
}

export default function PostSaveObservation({
  state,
}: PostSaveObservationProps) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <div
      className="rounded-2xl border border-border/70 bg-card px-5 py-5 shadow-[var(--shadow-card)]"
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.status === "loading" && (
        <p className="text-sm text-muted-foreground">
          正在检查最近记录中的行为模式…
        </p>
      )}

      {state.status === "detected" && (
        <BehavioralObservationDetails pattern={state.pattern} />
      )}

      {(state.status === "insufficient" || state.status === "none") && (
        <p className="text-sm leading-6 text-muted-foreground">
          记录已保存，暂未发现有意义的新行为模式。
        </p>
      )}

      {state.status === "error" && (
        <p className="text-sm leading-6 text-muted-foreground">
          记录已保存，但暂时无法生成行为观察。
        </p>
      )}
    </div>
  );
}
