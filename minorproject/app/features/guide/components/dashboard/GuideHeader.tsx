"use client";

import { Compass, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GlobalWorkspaceSwitcher from "@/app/components/dashboard/GlobalWorkspaceSwitcher";
import NotificationBell from "@/app/components/dashboard/NotificationBell";

interface GuideHeaderProps {
  guideName: string;
  location: string;
  isAvailable: boolean;
  dailyRate: number;
}

export default function GuideHeader({
  guideName,
  location,
  isAvailable,
  dailyRate,
}: GuideHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-emerald-600" />
          <span>{location || "Nepal"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <GlobalWorkspaceSwitcher />

        <NotificationBell />

        <Badge
          variant="secondary"
          className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
        >
          NPR {dailyRate.toLocaleString()} / Day
        </Badge>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isAvailable
                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                isAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            {isAvailable ? "Accepting Treks" : "Currently Unavailable"}
          </span>
        </div>
      </div>
    </header>
  );
}
