"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Clock3,
  Compass,
  Hotel,
  LayoutDashboard,
  Menu,
  Mountain,
  ShieldCheck,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminMobileSidebarProps {
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
  { name: "Destinations", href: "/dashboard/admin/destinations", icon: Mountain },
  { name: "Companies & Workspaces", href: "/dashboard/admin/companies", icon: Building2 },
  { name: "Restaurants", href: "/dashboard/admin/restaurants", icon: UtensilsCrossed },
  { name: "Hotels & Stays", href: "/dashboard/admin/hotels", icon: Hotel },
  { name: "Tour Guides", href: "/dashboard/admin/guides", icon: Compass },
  { name: "Registered Users", href: "/dashboard/admin/users", icon: Users },
];

export default function AdminMobileSidebar({
  adminName,
  pendingCount = 0,
}: AdminMobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 hover:bg-accent focus:outline-none lg:hidden cursor-pointer">
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="flex w-80 flex-col p-0">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <ShieldCheck className="size-6" />
            </div>

            <div className="text-left overflow-hidden">
              <p className="font-bold text-base text-foreground leading-none">Admin Portal</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {adminName || "System Administrator"}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
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
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm font-bold"
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
        </nav>
      </SheetContent>
    </Sheet>
  );
}
