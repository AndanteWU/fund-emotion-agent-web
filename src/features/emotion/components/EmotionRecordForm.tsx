"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { INITIAL_EMOTION_RECORD } from "../constants";
import {
  EmotionRecordServiceError,
  type EmotionRecordFormValues,
  type EmotionRecordSubmission,
} from "../types";
import EmotionSelector from "./EmotionSelector";
import EmotionScore from "./EmotionScore";

type SubmitStatus = "idle" | "submitting" | "success" | "error";
type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface BooleanChoiceProps {
  legend: string;
  description: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

function BooleanChoice({
  legend,
  description,
  value,
  onChange,
}: BooleanChoiceProps) {
  return (
    <fieldset className="space-y-3">
      <div>
        <legend className="font-medium">{legend}</legend>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "是", value: true },
          { label: "否", value: false },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`min-h-10 rounded-lg border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
              value === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-accent"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function validateForm(
  values: EmotionRecordFormValues,
):
  | { valid: true; submission: EmotionRecordSubmission }
  | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!values.emotion) {
    errors.push("请选择主要情绪。");
  }
  if (
    values.watchFrequency === "" ||
    !Number.isInteger(values.watchFrequency) ||
    values.watchFrequency < 0
  ) {
    errors.push("请输入有效的每日查看账户次数。");
  }
  if (values.operationImpulse === null) {
    errors.push("请选择是否产生操作冲动。");
  }
  if (values.actualOperation === null) {
    errors.push("请选择是否实际操作。");
  }
  if (values.operationImpulse === true && !values.impulseSource.trim()) {
    errors.push("请填写这次操作冲动的来源。");
  }

  if (
    errors.length > 0 ||
    !values.emotion ||
    values.watchFrequency === "" ||
    values.operationImpulse === null ||
    values.actualOperation === null
  ) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    submission: {
      emotion: values.emotion,
      emotionScore: values.emotionScore,
      anxietyScore: values.anxietyScore,
      fomoScore: values.fomoScore,
      impulseScore: values.impulseScore,
      watchFrequency: values.watchFrequency,
      operationImpulse: values.operationImpulse,
      actualOperation: values.actualOperation,
      impulseSource: values.impulseSource.trim(),
      note: values.note.trim(),
    },
  };
}

export default function EmotionRecordForm() {
  const [values, setValues] = useState<EmotionRecordFormValues>(() => ({
    ...INITIAL_EMOTION_RECORD,
  }));
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    import("@/features/auth/services/browser-auth-service")
      .then(({ hasAuthenticatedUser }) => hasAuthenticatedUser())
      .then((isAuthenticated) => {
        if (active) {
          setAuthStatus(isAuthenticated ? "authenticated" : "unauthenticated");
        }
      })
      .catch(() => {
        if (active) {
          setAuthStatus("unauthenticated");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateField<Key extends keyof EmotionRecordFormValues>(
    field: Key,
    value: EmotionRecordFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors([]);
    if (status !== "submitting") {
      setStatus("idle");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "submitting") {
      return;
    }

    const result = validateForm(values);
    if (!result.valid) {
      setErrors(result.errors);
      setStatus("error");
      return;
    }

    setErrors([]);
    setStatus("submitting");

    try {
      const { saveEmotionRecord } = await import("../services/emotion-record-service");
      await saveEmotionRecord(result.submission);
      setValues({ ...INITIAL_EMOTION_RECORD });
      setStatus("success");
    } catch (error: unknown) {
      if (error instanceof EmotionRecordServiceError) {
        setErrors([error.message]);
        if (error.code === "unauthenticated") {
          setAuthStatus("unauthenticated");
        }
      } else {
        setErrors(["保存时遇到问题，请稍后再试。"]);
      }
      setStatus("error");
    }
  }

  const isSubmitting = status === "submitting";

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {authStatus === "unauthenticated" && (
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
          role="status"
        >
          当前未登录。请先完成 Supabase 登录，再保存这条情绪记录。
        </div>
      )}

      <fieldset className="space-y-6" disabled={isSubmitting}>
        <Card>
          <CardHeader>
            <CardTitle>主要情绪</CardTitle>
            <CardDescription>
              选择此刻最明显的一种感受。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmotionSelector
              value={values.emotion}
              invalid={errors.includes("请选择主要情绪。")}
              onChange={(emotion) => updateField("emotion", emotion)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>感受强度</CardTitle>
            <CardDescription>
              0 表示完全没有，10 表示非常强烈。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 sm:grid-cols-2 sm:gap-x-10">
            <EmotionScore
              id="emotion-score"
              label="情绪强度"
              description="主要情绪有多强烈"
              value={values.emotionScore}
              onChange={(value) => updateField("emotionScore", value)}
            />
            <EmotionScore
              id="anxiety-score"
              label="焦虑程度"
              description="不确定感带来的紧张程度"
              value={values.anxietyScore}
              onChange={(value) => updateField("anxietyScore", value)}
            />
            <EmotionScore
              id="fomo-score"
              label="FOMO 程度"
              description="担心错过机会的程度"
              value={values.fomoScore}
              onChange={(value) => updateField("fomoScore", value)}
            />
            <EmotionScore
              id="impulse-score"
              label="冲动程度"
              description="立刻采取行动的冲动强度"
              value={values.impulseScore}
              onChange={(value) => updateField("impulseScore", value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>行为观察</CardTitle>
            <CardDescription>
              只记录已经发生的行为，不评价对错。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 sm:grid-cols-2 sm:gap-x-10">
            <div className="space-y-3">
              <label htmlFor="watch-frequency" className="font-medium">
                查看账户频率
              </label>
              <p className="text-sm text-muted-foreground">
                填写今天查看账户的次数。
              </p>
              <div className="relative">
                <input
                  id="watch-frequency"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={values.watchFrequency}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateField(
                      "watchFrequency",
                      nextValue === "" ? "" : Number(nextValue),
                    );
                  }}
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 pr-16 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                  aria-describedby="watch-frequency-unit"
                  aria-invalid={errors.includes(
                    "请输入有效的每日查看账户次数。",
                  )}
                />
                <span
                  id="watch-frequency-unit"
                  className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground"
                >
                  次/天
                </span>
              </div>
            </div>

            <BooleanChoice
              legend="是否产生操作冲动"
              description="是否出现过立刻调整持仓的念头"
              value={values.operationImpulse}
              onChange={(value) => updateField("operationImpulse", value)}
            />

            <BooleanChoice
              legend="是否实际操作"
              description="今天是否真的执行了相关操作"
              value={values.actualOperation}
              onChange={(value) => updateField("actualOperation", value)}
            />

            <div className="space-y-3">
              <label htmlFor="impulse-source" className="font-medium">
                冲动来源
              </label>
              <p className="text-sm text-muted-foreground">
                若产生冲动，简单记录触发它的情境。
              </p>
              <input
                id="impulse-source"
                type="text"
                maxLength={100}
                value={values.impulseSource}
                placeholder="例如：行情波动、社交媒体或他人讨论"
                onChange={(event) =>
                  updateField("impulseSource", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                aria-invalid={errors.includes("请填写这次操作冲动的来源。")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>一句话记录</CardTitle>
            <CardDescription>
              可选。写下此刻最想提醒未来自己的话。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={values.note}
              maxLength={280}
              rows={4}
              placeholder="我注意到……"
              onChange={(event) => updateField("note", event.target.value)}
            />
            <p className="mt-2 text-right text-xs text-muted-foreground">
              {values.note.length}/280
            </p>
          </CardContent>
        </Card>
      </fieldset>

      {errors.length > 0 && (
        <div
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-medium">暂时无法保存</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {status === "success" && (
        <div
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
          role="status"
        >
          记录已保存。表单已为下一次记录重置。
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted-foreground">
          这些记录只用于帮助你识别情绪与行为模式。
        </p>
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full sm:w-auto sm:min-w-36"
          disabled={
            isSubmitting ||
            authStatus === "checking" ||
            authStatus === "unauthenticated"
          }
        >
          {isSubmitting
            ? "正在保存…"
            : authStatus === "checking"
              ? "正在确认登录…"
              : "保存记录"}
        </Button>
      </div>
    </form>
  );
}