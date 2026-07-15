"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOutCurrentUser } from "@/features/auth/services/browser-auth-service";

interface UserMenuProps {
  email: string | null;
}

function getEmailInitial(email: string): string {
  return email.trim().charAt(0).toLocaleUpperCase() || "U";
}

export default function UserMenu({ email }: UserMenuProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setErrorMessage(null);

    try {
      await signOutCurrentUser();
      router.replace("/login");
      router.refresh();
    } catch {
      setErrorMessage("暂时无法退出，请稍后再试。");
      setIsSigningOut(false);
    }
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        登录
      </Link>
    );
  }

  return (
    <details className="group relative">
      <summary
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground ring-1 ring-border/70 transition hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden"
        aria-label="打开用户菜单"
      >
        {getEmailInitial(email)}
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-border/70 bg-popover p-3 text-popover-foreground shadow-[var(--shadow-float)]">
        <div className="px-2 py-2">
          <p className="text-xs font-medium text-muted-foreground">当前账户</p>
          <p className="mt-1 truncate text-sm font-medium" title={email}>
            {email}
          </p>
        </div>
        {errorMessage && (
          <p className="mx-2 mb-2 text-xs leading-5 text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? "退出中…" : "退出登录"}
        </Button>
      </div>
    </details>
  );
}