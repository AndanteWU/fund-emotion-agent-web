import { z } from "zod";

const conciseItem = z.string().min(1).max(180);

export const aiEmotionReviewSchema = z.object({
  summary: z
    .string()
    .min(80)
    .max(200)
    .describe("80 到 200 个中文字符的整体行为观察总结"),
  dominantEmotion: z
    .string()
    .min(1)
    .max(30)
    .describe("记录中最主要或最常出现的情绪"),
  patterns: z
    .array(conciseItem)
    .min(1)
    .max(5)
    .describe("记录中反复出现的情绪或行为模式"),
  riskSignals: z
    .array(conciseItem)
    .min(0)
    .max(5)
    .describe("值得留意的行为风险信号，没有时返回空数组"),
  observations: z
    .array(conciseItem)
    .min(1)
    .max(5)
    .describe("严格基于记录得出的中性观察点"),
  reflectionQuestions: z
    .array(conciseItem)
    .min(2)
    .max(4)
    .describe("帮助用户自我复盘的开放式问题"),
});

export type AiEmotionReview = z.infer<typeof aiEmotionReviewSchema>;
