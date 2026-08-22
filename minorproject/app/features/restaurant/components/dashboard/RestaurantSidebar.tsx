"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Clock3,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  TrendingUp,
  User,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/app/features/shared/components/StatusBadge";

interface RestaurantSidebarProps {
  restaurant: {
    id: number;
    name: string;
    isOpen?: boolean | null;
  };
  approvalStatus: "approved" | "pending" | "rejected" | "suspended";
}

const sidebarLinks = [
  { name: "Overview", href: "/dashboard/restaurant", icon: LayoutDashboard },
  { name: "Orders & Tables", href: "/dashboard/restaurant/orders", icon: ShoppingBag },
  { name: "Menu Items", href: "/dashboard/restaurant/menu", icon: UtensilsCrossed },
  { name: "Availability", href: "/dashboard/restaurant/availability", icon: Clock },
  { name: "Settings", href: "/dashboard/restaurant/settings", icon: Settings },
];

export default function RestaurantSidebar({
  restaurant,
  approvalStatus,
}: RestaurantSidebarProps) {
  const pathname = usePathname();

  const navigation =
    approvalStatus === "approved"
      ? sidebarLinks
      : [
          {
            name: "Dashboard",
            href: "/dashboard/restaurant/pending",
            icon: Clock3,
          },
        ];

  return (
    <aside className="hidden w-72 flex-col border-r bg-background lg:flex">
      {/* Logo & Restaurant Title */}
      <div className="border-b px-6 py-6">
        <Link
          href={
            approvalStatus === "approved"
              ? "/dashboard/restaurant"
              : "/dashboard/restaurant/pending"
          }
          className="flex items-center gap-3 group"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <UtensilsCrossed className="size-5" />
          </div>

          <div className="overflow-hidden">
            <h2 className="font-semibold leading-none truncate">
              Restaurant Panel
            </h2>
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {restaurant.name}
            </p>
          </div>
        </Link>
      </div>

      {/* Approval Status Notice (if not approved) */}
      {approvalStatus !== "approved" && (
        <div className="border-b p-4">
          <div className="rounded-lg bg-muted p-3">
            <div className="mb-2 flex items-center gap-2">
              {approvalStatus === "pending" && (
                <Clock3 className="size-4 text-amber-500" />
              )}
              {approvalStatus === "rejected" && (
                <XCircle className="size-4 text-destructive" />
              )}
              {approvalStatus === "suspended" && (
                <AlertCircle className="size-4 text-orange-500" />
              )}
              <span className="text-sm font-medium">Account Status</span>
            </div>
            <StatusBadge status={approvalStatus} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-4">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Management
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/restaurant" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 text-xs rounded-lg bg-muted/60">
          <span className="text-muted-foreground">Store Status:</span>
          <span
            className={cn(
              "font-medium inline-flex items-center gap-1.5",
              restaurant.isOpen ?? true ? "text-emerald-500" : "text-red-500"
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                restaurant.isOpen ?? true ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              )}
            />
            {restaurant.isOpen ?? true ? "Open" : "Closed"}
          </span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground px-3 py-1.5"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Website</span>
        </Link>
      </div>
    </aside>
  );
}