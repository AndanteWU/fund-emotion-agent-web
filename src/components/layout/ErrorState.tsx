import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  description: string;
  action?: ReactNode;
}

export default function ErrorState({
  title = "暂时无法加载",
  description,
  action,
}: ErrorStateProps) {
  return (
    <div
      className="rounded-3xl border border-destructive/15 bg-destructive/5 px-6 py-12 text-center"
      role="alert"
    >
      <h2 className="font-medium text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}