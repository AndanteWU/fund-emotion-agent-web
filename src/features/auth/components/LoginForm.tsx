"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  sendEmailOtp,
  verifyEmailOtp,
} from "../services/browser-auth-service";
import {
  AuthServiceError,
  type AuthRequestStatus,
  type OtpLoginStage,
} from "../types";

interface LoginFormProps {
  callbackFailed?: boolean;
}

export default function LoginForm({
  callbackFailed = false,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<OtpLoginStage>("email");
  const [status, setStatus] = useState<AuthRequestStatus>("idle");
  const [message, setMessage] = useState(
    callbackFailed ? "原登录链接无效或已过期，请使用邮箱验证码登录。" : "",
  );

  const isBusy = status === "sending" || status === "verifying";

  function reportDevelopmentError(context: string, error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        context,
        error instanceof Error
          ? { name: error.name, message: error.message }
          : { name: "UnknownError" },
      );
    }
  }

  async function requestOtp() {
    if (isBusy) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setStatus("error");
      setMessage("请输入有效的邮箱地址。");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      await sendEmailOtp(normalizedEmail);
      setEmail(normalizedEmail);
      setStage("otp");
      setStatus("sent");
      setMessage("验证码已发送，请检查邮箱并输入 6 位数字。");
    } catch (error: unknown) {
      reportDevelopmentError("Supabase 验证码发送失败", error);

      setStatus("error");
      setMessage(
        error instanceof AuthServiceError
          ? error.message
          : "暂时无法发送验证码，请稍后再试。",
      );
    }
  }

  async function verifyOtp() {
    if (isBusy) {
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setStatus("error");
      setMessage("请输入邮件中的 6 位数字验证码。");
      return;
    }

    setStatus("verifying");
    setMessage("");

    try {
      await verifyEmailOtp(email, otp);
      router.replace("/record");
      router.refresh();
    } catch (error: unknown) {
      reportDevelopmentError("Supabase 验证码验证失败", error);

      setStatus("error");
      setMessage(
        error instanceof AuthServiceError
          ? error.message
          : "暂时无法验证，请稍后再试。",
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (stage === "email") {
      await requestOtp();
      return;
    }

    await verifyOtp();
  }

  function returnToEmail() {
    if (isBusy) {
      return;
    }

    setStage("email");
    setOtp("");
    setStatus("idle");
    setMessage("");
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">登录</CardTitle>
        <CardDescription className="leading-6">
          {stage === "email"
            ? "输入邮箱，验证码将发送到你的邮箱。"
            : `验证码已发送到 ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {stage === "email" ? (
            <div className="space-y-2">
              <label htmlFor="email" className="sr-only">
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                placeholder="请输入邮箱地址"
                disabled={isBusy}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (!isBusy) {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="otp" className="sr-only">
                6 位验证码
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
                value={otp}
                placeholder="请输入 6 位验证码"
                disabled={isBusy}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  if (!isBusy) {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                className="h-12 w-full rounded-lg border border-input bg-transparent px-3 text-center text-xl font-semibold tracking-[0.3em] outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}

          {message && (
            <div
              className={`rounded-lg border px-3 py-2.5 text-sm leading-6 ${
                status === "sent"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
              role={status === "sent" ? "status" : "alert"}
            >
              {message}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={isBusy || (stage === "otp" && otp.length !== 6)}
          >
            {stage === "email"
              ? status === "sending"
                ? "正在发送…"
                : "发送验证码"
              : status === "verifying"
                ? "正在验证…"
                : "验证并登录"}
          </Button>

          {stage === "otp" && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={requestOtp}
              >
                {status === "sending" ? "正在重发…" : "重新发送验证码"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={isBusy}
                onClick={returnToEmail}
              >
                返回修改邮箱
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
