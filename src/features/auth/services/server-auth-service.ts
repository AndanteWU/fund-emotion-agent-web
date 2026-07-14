import type { User } from "@supabase/supabase-js";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AuthCallbackInput } from "../types";

export async function getCurrentUser(): Promise<User | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error ? null : user;
}

export async function completeAuthCallback(
  input: AuthCallbackInput,
): Promise<boolean> {
  if (!hasSupabaseConfig()) {
    return false;
  }

  const supabase = await createClient();

  if (input.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(input.code);
    return !error;
  }

  if (input.tokenHash && input.type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: input.tokenHash,
      type: input.type,
    });
    return !error;
  }

  return false;
}
