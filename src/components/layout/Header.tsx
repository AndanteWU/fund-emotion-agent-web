"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Nav from "./Nav";
import UserMenu from "./UserMenu";

interface HeaderProps {
  userEmail: string | null;
}

export default function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname();

  if (pathname === "/login" || pathname.startsWith("/auth/")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/82 backdrop-blur-2xl">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <div className="grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-[14px] bg-accent text-sm font-semibold text-accent-foreground ring-1 ring-border/70"
              aria-hidden="true"
            >
              F
            </span>
            <span className="truncate text-sm font-semibold tracking-[-0.02em] sm:text-base">
              Fund Emotion Agent
            </span>
          </Link>
          <div className="hidden md:block">
            <Nav pathname={pathname} />
          </div>
          <div className="justify-self-end">
            <UserMenu email={userEmail} />
          </div>
        </div>
        <div className="pb-3 md:hidden">
          <Nav pathname={pathname} mobile />
        </div>
      </div>
    </header>
  );
}