import { z } from "zod";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期必须使用 YYYY-MM-DD 格式")
  .refine(
    (value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
    "日期无效",
  );

const observationEvidenceSchema = z
  .object({
    label: z.string().trim().min(1).max(80),
    value: z.string().trim().min(1).max(500),
    dates: z.array(isoDateSchema).max(31),
  })
  .strict();

export const actionDecisionRequestSchema = z
  .object({
    reviewId: z.uuid(),
    patternType: z.enum([
      "rising_anxiety",
      "frequent_checking",
      "emotion_action_link",
      "no_clear_pattern",
    ]),
    observationTitle: z.string().trim().min(1).max(120),
    observationEvidence: z.array(observationEvidenceSchema).min(1).max(3),
    sourceStartDate: isoDateSchema,
    sourceEndDate: isoDateSchema,
    actionTitle: z.string().trim().min(1).max(40),
    actionInstruction: z.string().trim().min(1).max(160),
    decision: z.enum(["accepted", "declined"]),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.sourceEndDate < value.sourceStartDate) {
      context.addIssue({
        code: "custom",
        path: ["sourceEndDate"],
        message: "结束日期不能早于开始日期",
      });
    }
  });

export type ActionDecisionRequest = z.infer<
  typeof actionDecisionRequestSchema
>;

export const actionFeedbackRequestSchema = z
  .object({
    feedback: z.enum(["helpful", "not_helpful", "not_tried"]),
  })
  .strict();

export const actionFeedbackParamsSchema = z
  .object({
    actionId: z.uuid(),
  })
  .strict();

export type ActionFeedbackRequest = z.infer<
  typeof actionFeedbackRequestSchema
>;
