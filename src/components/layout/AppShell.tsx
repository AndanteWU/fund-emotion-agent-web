import type { ReactNode } from "react";
import { getCurrentUser } from "@/features/auth/services/server-auth-service";
import Header from "./Header";

interface AppShellProps {
  children: ReactNode;
}

export default async function AppShell({ children }: AppShellProps) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header userEmail={user?.email ?? null} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
