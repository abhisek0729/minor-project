import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
}: StatsCardProps) {
  const isPositive = change === undefined || change >= 0;

  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.7)] transition-transform duration-200 hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className="rounded-xl bg-primary/10 p-2 text-primary ring-1 ring-primary/20">
          <Icon className="size-5" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>

        {(change !== undefined || changeLabel) && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            {change !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  isPositive
                    ? "text-emerald-600"
                    : "text-destructive"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownRight className="size-4" />
                )}

                {Math.abs(change)}%
              </span>
            )}

            {changeLabel && (
              <span className="text-muted-foreground">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}