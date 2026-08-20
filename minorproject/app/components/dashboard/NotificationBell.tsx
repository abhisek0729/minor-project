"use client";

import { useState } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  Hotel,
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

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  category: "booking" | "expense" | "hotel" | "restaurant" | "guide" | "system";
  timestamp: string;
  read: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Booking Transaction Confirmed",
    description: "Your reservation for Lakeview Mountain Haven (2 Nights) was confirmed. NPR 8,400 recorded.",
    category: "booking",
    timestamp: "10 mins ago",
    read: false,
  },
  {
    id: "notif-2",
    title: "Expense Ledger Updated",
    description: "Logged NPR 1,950 for Dinner at Himalayan Table (Pokhara) linked to your traveler memory.",
    category: "expense",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: "notif-3",
    title: "Workspace Verified Status",
    description: "Your partner profile and catalog listings are verified and visible across public discovery pages.",
    category: "system",
    timestamp: "3 hours ago",
    read: false,
  },
  {
    id: "notif-4",
    title: "Guide Package Inquiry",
    description: "Inquiry received for Poon Hill 3-Day Sunrise Trek. Daily guide rate NPR 4,600/day.",
    category: "guide",
    timestamp: "Yesterday",
    read: true,
  },
];

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getCategoryIcon = (category: NotificationItem["category"]) => {
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-xl border rounded-2xl bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground">Notifications & DB Activity</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-rose-500/10 text-rose-600 border-rose-500/20 font-semibold">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
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
                size="sm"
                onClick={clearNotifications}
                className="h-7 text-[11px] px-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                title="Clear all"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-border/50">
          {notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Bell className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">No recent notifications</p>
              <p className="text-[11px] text-muted-foreground">
                Database transactions and travel alerts will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 flex gap-3 transition-colors ${
                  notif.read ? "bg-card hover:bg-muted/30" : "bg-primary/5 hover:bg-primary/10"
                }`}
              >
                <div className="mt-0.5 shrink-0 size-7 rounded-lg bg-background border flex items-center justify-center shadow-2xs">
                  {getCategoryIcon(notif.category)}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs truncate ${notif.read ? "font-semibold text-foreground" : "font-bold text-foreground"}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5">
                      <Clock className="size-2.5" /> {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {notif.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t text-center bg-muted/20 rounded-b-2xl">
          <span className="text-[10px] text-muted-foreground font-medium">
            Live database transactions recorded in real-time
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
