"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Clock3,
  Compass,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Users,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface GuideMobileSidebarProps {
  guideName: string;
  approvalStatus: "approved" | "pending" | "rejected" | "suspended";
}

const sidebarLinks = [
  { name: "Overview", href: "/dashboard/guide", icon: LayoutDashboard },
  { name: "Tour Packages", href: "/dashboard/guide/packages", icon: Package },
  { name: "Availability", href: "/dashboard/guide/availability", icon: Calendar },
  { name: "Bookings", href: "/dashboard/guide/bookings", icon: Users },
  { name: "Settings", href: "/dashboard/guide/settings", icon: Settings },
];

export default function GuideMobileSidebar({
  guideName,
  approvalStatus,
}: GuideMobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navigation =
    approvalStatus === "approved"
      ? sidebarLinks
      : [
          {
            name: "Dashboard",
            href: "/dashboard/guide/pending",
            icon: Clock3,
          },
        ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 hover:bg-accent focus:outline-none lg:hidden cursor-pointer">
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="flex w-80 flex-col p-0">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <Compass className="size-6" />
            </div>

            <div className="text-left overflow-hidden">
              <p className="font-bold text-base text-foreground leading-none">Tour Guide Portal</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {guideName || "Certified Guide"}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Guide Management
          </div>

          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/guide" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
