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
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight sm:text-base">
            Fund Emotion Agent
          </Link>
          <div className="hidden md:block">
            <Nav pathname={pathname} />
          </div>
          <UserMenu email={userEmail} />
        </div>
        <div className="border-t py-2 md:hidden">
          <Nav pathname={pathname} mobile />
        </div>
      </div>
    </header>
  );
}
