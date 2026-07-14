import type { Emotion, EmotionRecordFormValues } from "./types";

export const EMOTIONS: Emotion[] = [
  "平静",
  "焦虑",
  "兴奋",
  "后悔",
  "恐惧",
  "贪婪",
  "烦躁",
  "麻木",
];
export const INITIAL_EMOTION_RECORD: EmotionRecordFormValues = {
  emotion: "",
  emotionScore: 5,
  anxietyScore: 5,
  fomoScore: 5,
  impulseScore: 5,
  watchFrequency: "",
  operationImpulse: null,
  actualOperation: null,
  impulseSource: "",
  note: "",
};
