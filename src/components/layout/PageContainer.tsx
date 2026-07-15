import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-[1120px] px-4 py-12 sm:px-6 sm:py-16 lg:py-20",
        className,
      )}
    >
      {children}
    </main>
  );
}