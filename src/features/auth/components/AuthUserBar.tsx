"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOutCurrentUser } from "../services/browser-auth-service";

interface AuthUserBarProps {
  email: string;
}

export default function AuthUserBar({ email }: AuthUserBarProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setError("");

    try {
      await signOutCurrentUser();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("暂时无法退出登录，请稍后再试。");
      setIsSigningOut(false);
    }
  }

  return (
    <div className="mb-6 rounded-xl border bg-card px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">当前登录邮箱</p>
          <p className="mt-1 truncate text-sm font-medium">{email}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isSigningOut}
          onClick={handleSignOut}
        >
          {isSigningOut ? "正在退出…" : "退出登录"}
        </Button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
