import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border/80 bg-card/70 px-6 py-16 text-center shadow-[var(--shadow-card)] sm:py-20">
      <h2 className="text-lg font-medium tracking-[-0.02em]">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}