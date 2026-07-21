import type {
  ActionableObservationType,
  ActionableReviewEvidence,
} from "@/features/insight/types";

export type AgentActionStatus = "accepted" | "declined" | "completed";

export type AgentActionFeedback =
  | "helpful"
  | "not_helpful"
  | "not_tried";

export type AgentActionPatternType = ActionableObservationType;

export type AgentActionEvidence = ActionableReviewEvidence;

export interface AgentActionRow {
  id: string;
  user_id: string;
  review_id: string;
  pattern_type: AgentActionPatternType;
  observation_title: string;
  observation_evidence: AgentActionEvidence[];
  source_start_date: string;
  source_end_date: string;
  action_title: string;
  action_instruction: string;
  status: AgentActionStatus;
  created_at: string;
  accepted_at: string | null;
  feedback_due_at: string | null;
  last_prompted_at: string | null;
  feedback: AgentActionFeedback | null;
  feedback_at: string | null;
  updated_at: string;
}
