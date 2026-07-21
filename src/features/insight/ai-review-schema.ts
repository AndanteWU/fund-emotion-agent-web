import { z } from "zod";

export const FIXED_REVIEW_DISCLAIMER =
  "这是基于记录的行为观察，不构成投资建议。";

const FORBIDDEN_ACTION_LANGUAGE =
  /(买入|卖出|加仓|减仓|持有建议|基金推荐|股票推荐|市场预测|收益承诺|医学诊断|心理治疗)/;

const actionSchema = z
  .object({
    title: z.string().min(1).max(40).describe("简短的情绪管理行动标题"),
    instruction: z
      .string()
      .min(1)
      .max(160)
      .describe("具体、克制且不涉及投资方向的执行说明"),
  })
  .superRefine((action, context) => {
    if (
      FORBIDDEN_ACTION_LANGUAGE.test(`${action.title} ${action.instruction}`)
    ) {
      context.addIssue({
        code: "custom",
        message: "行动内容超出情绪与行为管理范围。",
      });
    }
  });

export const aiEmotionReviewSchema = z.object({
  interpretation: z
    .string()
    .min(40)
    .max(100)
    .describe("基于已确认事实的 40 到 100 字简短解释"),
  singleAction: actionSchema.describe("一个具体的情绪与行为管理行动"),
  reflectionQuestion: z
    .string()
    .min(1)
    .max(180)
    .describe("一个与核心观察直接相关的反思问题"),
});

const evidenceSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  dates: z.array(z.string()),
});

const observationSchema = z.object({
  type: z.enum([
    "rising_anxiety",
    "frequent_checking",
    "emotion_action_link",
    "no_clear_pattern",
  ]),
  title: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
  confidence: z.number().min(0).max(1),
  evidence: z.array(evidenceSchema).min(1).max(3),
});

const watchSignalSchema = z.object({
  title: z.string().min(1),
  evidence: z.string().min(1),
});

const statisticsSchema = z.object({
  recordCount: z.number().int().nonnegative(),
  mostFrequentEmotion: z.string().nullable(),
  averageAnxiety: z.number().nullable(),
  averageFomo: z.number().nullable(),
  averageImpulse: z.number().nullable(),
  highAnxietyDays: z.number().int().nonnegative(),
  highFomoDays: z.number().int().nonnegative(),
  highRiskDateCount: z.number().int().nonnegative(),
  riskLevel: z.enum(["low", "medium", "high"]),
});

export const actionableEmotionReviewSchema = z.object({
  observation: observationSchema,
  statistics: statisticsSchema,
  interpretation: aiEmotionReviewSchema.shape.interpretation,
  singleAction: aiEmotionReviewSchema.shape.singleAction,
  watchSignals: z.array(watchSignalSchema).max(3),
  reflectionQuestion: aiEmotionReviewSchema.shape.reflectionQuestion,
  disclaimer: z.literal(FIXED_REVIEW_DISCLAIMER),
});

const reviewSourceDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const generatedActionableEmotionReviewSchema =
  actionableEmotionReviewSchema
    .extend({
      reviewId: z.uuid(),
      sourceStartDate: reviewSourceDateSchema,
      sourceEndDate: reviewSourceDateSchema,
    })
    .superRefine((review, context) => {
      if (review.sourceEndDate < review.sourceStartDate) {
        context.addIssue({
          code: "custom",
          path: ["sourceEndDate"],
          message: "End date cannot be earlier than start date.",
        });
      }
    });

export type AiEmotionReview = z.infer<typeof aiEmotionReviewSchema>;
export type ActionableEmotionReview = z.infer<
  typeof actionableEmotionReviewSchema
>;
export type GeneratedActionableEmotionReview = z.infer<
  typeof generatedActionableEmotionReviewSchema
>;
