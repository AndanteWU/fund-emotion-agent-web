"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOutCurrentUser } from "@/features/auth/services/browser-auth-service";

interface UserMenuProps {
  email: string | null;
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
    <div className="flex min-w-0 items-center gap-2">
      <div className="hidden min-w-0 text-right sm:block">
        <p className="max-w-48 truncate text-sm font-medium">{email}</p>
        {errorMessage && (
          <p className="text-xs text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
        {isSigningOut ? "退出中…" : "退出登录"}
      </Button>
    </div>
  );
}
