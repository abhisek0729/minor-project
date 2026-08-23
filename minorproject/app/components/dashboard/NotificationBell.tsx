"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  ExternalLink,
  Hotel,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getLiveWorkspaceNotifications,
  WorkspaceNotification,
} from "@/app/features/notifications/actions/notification.action";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchNotifications = () => {
    startTransition(async () => {
      const data = await getLiveWorkspaceNotifications();
      setNotifications(data);
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sortedNotifications = [...notifications].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getCategoryIcon = (category: WorkspaceNotification["category"], urgency?: string) => {
    if (urgency === "high") {
      return <ShieldAlert className="size-4 text-rose-500 animate-pulse" />;
    }
    switch (category) {
      case "booking":
        return <CheckCircle2 className="size-4 text-emerald-500" />;
      case "expense":
        return <CreditCard className="size-4 text-blue-500" />;
      case "hotel":
        return <Hotel className="size-4 text-amber-500" />;
      case "restaurant":
        return <UtensilsCrossed className="size-4 text-rose-500" />;
      case "guide":
        return <Compass className="size-4 text-violet-500" />;
      case "system":
      default:
        return <ShieldCheck className="size-4 text-primary" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchNotifications();
    }}>
      <PopoverTrigger>
        <span
          className="relative inline-flex items-center justify-center size-9 rounded-full hover:bg-muted cursor-pointer transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-4 text-foreground/80" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-rose-500" />
            </span>
          )}
        </span>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-84 sm:w-96 p-0 shadow-2xl border rounded-2xl bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/40">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground">Workspace Activity & Alerts</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Sort Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSortOrder}
              className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
              title={`Sort by time: ${sortOrder === "asc" ? "Ascending (Oldest First)" : "Descending (Newest First)"}`}
            >
              {sortOrder === "asc" ? (
                <>
                  <ArrowUpNarrowWide className="size-3.5 text-primary" />
                  <span className="text-[10px] font-semibold">Asc</span>
                </>
              ) : (
                <>
                  <ArrowDownNarrowWide className="size-3.5 text-primary" />
                  <span className="text-[10px] font-semibold">Desc</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={fetchNotifications}
              disabled={isPending}
              className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} />
            </Button>
            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="size-3.5 mr-1 text-emerald-600" /> Mark Read
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearNotifications}
                  className="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                  title="Clear all"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Subheader bar showing current sort */}
        {notifications.length > 1 && (
          <div className="px-4 py-1.5 bg-muted/20 border-b flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              Order: <strong className="text-foreground">{sortOrder === "asc" ? "Ascending Time (Oldest -> Newest)" : "Descending Time (Newest -> Oldest)"}</strong>
            </span>
            <button
              onClick={toggleSortOrder}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Switch to {sortOrder === "asc" ? "Descending" : "Ascending"}
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
          {isPending && notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Loader2 className="size-6 animate-spin mx-auto text-primary" />
              <p className="text-xs text-muted-foreground">Checking live workspace status...</p>
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Bell className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">Workspace Up to Date</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Live database events, inventory updates, and bookings will appear here automatically.
              </p>
            </div>
          ) : (
            sortedNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 flex gap-3 transition-colors ${
                  notif.urgency === "high"
                    ? "bg-rose-500/5 hover:bg-rose-500/10 border-l-2 border-l-rose-500"
                    : notif.read
                    ? "bg-card hover:bg-muted/30"
                    : "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary"
                }`}
              >
                <div className="mt-0.5 shrink-0 size-7 rounded-lg bg-background border flex items-center justify-center shadow-2xs">
                  {getCategoryIcon(notif.category, notif.urgency)}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${notif.read ? "font-semibold text-foreground" : "font-bold text-foreground"}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1 font-mono font-medium bg-muted/80 border border-border/40 px-2 py-0.5 rounded-md shadow-2xs">
                      <Clock className="size-2.5 text-primary" />
                      <span>{notif.timestamp}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {notif.description}
                  </p>
                  {notif.link && (
                    <div className="pt-1">
                      <Link
                        href={notif.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <span>View in Workspace</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t text-center bg-muted/20">
          <span className="text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live PostgreSQL workspace database synced
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
