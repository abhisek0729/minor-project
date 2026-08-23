import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="size-8 text-muted-foreground" />
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="text-xl font-semibold">
          {title}
        </h3>

        <p className="max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </div>
  );
}