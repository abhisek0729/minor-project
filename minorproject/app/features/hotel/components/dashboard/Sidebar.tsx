"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  Clock3,
  Hotel,
  User,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { HOTEL_DASHBOARD_NAVIGATION } from "@/app/features/hotel/constants/dashboard-navigations";
import { StatusBadge } from "@/app/features/shared/components/StatusBadge";

interface HotelDashboardSidebarProps {
  hotel: {
    id: number;
    name: string;
  };

  approvalStatus:
    | "approved"
    | "pending"
    | "rejected"
    | "suspended";
}

export function Sidebar({
  hotel,
  approvalStatus,
}: HotelDashboardSidebarProps) {
  const pathname = usePathname();

  const navigation =
    approvalStatus === "approved"
      ? HOTEL_DASHBOARD_NAVIGATION
      : [
          {
            title: "Dashboard",
            href: "/dashboard/hotels/pending",
            icon: Clock3,
          },
        ];

  return (
    <aside className="hidden w-72 border-r bg-background lg:flex lg:flex-col">
      {/* Logo */}

      <div className="border-b px-6 py-6">
        <Link
          href={
            approvalStatus === "approved"
              ? "/dashboard/hotels"
              : "/dashboard/hotels/pending"
          }
          className="flex items-center gap-3"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Hotel className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold leading-none">
              Hotel Dashboard
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {hotel.name}
            </p>
          </div>
        </Link>
      </div>

      {/* Approval Notice */}

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

              <span className="text-sm font-medium">
                Account Status
              </span>
            </div>

            <StatusBadge status={approvalStatus} />
          </div>
        </div>
      )}

      {/* Navigation */}

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5" />

              <span>{item.title}</span>
            </Link>
          );
        })}

        {/* Profile is always accessible */}

        <Link
          href="/dashboard/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/dashboard/profile")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <User className="size-5" />

          <span>Profile</span>
        </Link>
      </nav>

      {/* Footer */}

      <div className="border-t p-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to Website
        </Link>
      </div>
    </aside>
  );
}