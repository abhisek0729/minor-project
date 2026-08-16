"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Hotel,
  LayoutDashboard,
  Shield,
  ShieldCheck,
  User,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  adminName: string;
  pendingCount?: number;
}

const sidebarLinks = [
  { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  {
    name: "Pending Approvals",
    href: "/dashboard/admin/approvals",
    icon: Clock3,
    badgeKey: "pending",
  },
  { name: "Restaurants", href: "/dashboard/admin/restaurants", icon: UtensilsCrossed },
  { name: "Hotels & Stays", href: "/dashboard/admin/hotels", icon: Hotel },
  { name: "Registered Users", href: "/dashboard/admin/users", icon: Users },
];

export default function AdminSidebar({
  adminName,
  pendingCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 flex-col border-r bg-background lg:flex">
      {/* Brand Header */}
      <div className="border-b px-6 py-6">
        <Link href="/dashboard/admin" className="flex items-center gap-3 group">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
            <ShieldCheck className="size-6" />
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold leading-none text-base">Admin Portal</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {adminName || "System Administrator"}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-4">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Platform Management
        </div>

        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="size-4.5" />
                <span>{item.name}</span>
              </div>

              {item.badgeKey === "pending" && pendingCount > 0 && (
                <Badge
                  className={cn(
                    "px-2 py-0.5 text-[11px] font-bold rounded-full",
                    isActive
                      ? "bg-primary-foreground text-primary"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {pendingCount}
                </Badge>
              )}
            </Link>
          );
        })}

        <div className="pt-4 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </div>

        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            pathname.startsWith("/profile")
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <User className="size-4.5" />
          <span>My Profile</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground px-3 py-1.5"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Main Website</span>
        </Link>
      </div>
    </aside>
  );
}
