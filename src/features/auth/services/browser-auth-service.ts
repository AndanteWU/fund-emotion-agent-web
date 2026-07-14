import { createClient } from "@/lib/supabase/client";
import { AuthServiceError } from "../types";

export async function sendEmailOtp(email: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Supabase signInWithOtp 返回错误", {
        name: error.name,
        message: error.message,
        status: error.status,
      });
    }

    throw new AuthServiceError("验证码发送失败，请稍后再试。");
  }
}

export async function verifyEmailOtp(
  email: string,
  token: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Supabase verifyOtp 返回错误", {
        name: error.name,
        message: error.message,
        status: error.status,
      });
    }

    throw new AuthServiceError("验证码无效或已过期，请重新输入。");
  }
}

export async function hasAuthenticatedUser(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return !error && Boolean(user);
}

export async function signOutCurrentUser(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new AuthServiceError("退出登录失败，请稍后再试。");
  }
}
