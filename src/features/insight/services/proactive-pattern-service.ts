import "server-only";

import { queryEmotionHistory } from "@/features/emotion/services/emotion-history-service";
import type { BehavioralObservationQueryResult } from "../types";
import { evaluateBehavioralObservation } from "./behavioral-pattern-selection";

export async function getLatestBehavioralObservation(): Promise<BehavioralObservationQueryResult> {
  try {
    const history = await queryEmotionHistory();

    if (history.status !== "success") {
      return history;
    }

    return evaluateBehavioralObservation(history.records);
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error("Behavioral observation generation failed", {
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
    }

    return { status: "error" };
  }
}
