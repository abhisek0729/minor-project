"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Compass,
  DollarSign,
  LayoutDashboard,
  Map,
  Package,
  Settings,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface GuideSidebarProps {
  guide: {
    id: number;
    name: string;
    location: string;
    isAvailable?: boolean;
  };
  approvalStatus: string;
}

const approvedLinks = [
  { name: "Overview", href: "/dashboard/guide", icon: LayoutDashboard },
  { name: "Tour Packages", href: "/dashboard/guide/packages", icon: Package },
  { name: "Availability", href: "/dashboard/guide/availability", icon: Calendar },
  { name: "Customer Bookings", href: "/dashboard/guide/bookings", icon: Users },
  { name: "Profile & Settings", href: "/dashboard/guide/settings", icon: Settings },
];

const pendingLinks = [
  { name: "Pending Approval", href: "/dashboard/guide/pending", icon: Clock3 },
  { name: "Profile & Settings", href: "/dashboard/guide/settings", icon: Settings },
];

export default function GuideSidebar({
  guide,
  approvalStatus,
}: GuideSidebarProps) {
  const pathname = usePathname();
  const isApproved = approvalStatus === "approved";
  const links = isApproved ? approvedLinks : pendingLinks;

  return (
    <aside className="hidden w-72 flex-col border-r bg-background lg:flex">
      {/* Brand Header */}
      <div className="border-b px-6 py-6">
        <Link
          href={isApproved ? "/dashboard/guide" : "/dashboard/guide/pending"}
          className="flex items-center gap-3 group"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md transition-transform group-hover:scale-105">
            <Compass className="size-6" />
          </div>

          <div className="overflow-hidden">
            <h2 className="font-bold leading-none text-base">Guide Portal</h2>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {guide.name || "Local Guide"}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-4">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {isApproved ? "Guide Operations" : "Account Status"}
        </div>

        {links.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/guide" &&
              item.href !== "/dashboard/guide/pending" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-emerald-600 text-white shadow-sm font-semibold"
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
          <span className="text-muted-foreground">Guide Status:</span>
          <span
            className={cn(
              "font-medium inline-flex items-center gap-1.5",
              guide.isAvailable ? "text-emerald-600" : "text-amber-500"
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                guide.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              )}
            />
            {guide.isAvailable ? "Available" : "Busy / Off"}
          </span>
        </div>

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
