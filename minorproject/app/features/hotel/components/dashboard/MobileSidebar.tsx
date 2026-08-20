"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock3,
  Hotel,
  Menu,
  User,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { cn } from "@/lib/utils";
import { HOTEL_DASHBOARD_NAVIGATION } from "@/app/features/hotel/constants/dashboard-navigations";

interface MobileSidebarProps {
  hotelName: string;
  approvalStatus:
    | "approved"
    | "pending"
    | "rejected"
    | "suspended";
}

export function MobileSidebar({
  hotelName,
  approvalStatus,
}: MobileSidebarProps) {
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
    <Sheet>
      <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring lg:hidden">
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-80 flex-col p-0"
      >
        {/* Header */}

        <SheetHeader className="border-b border-border/70 px-6 py-5">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
              <Hotel className="size-5" />
            </div>

            <div className="text-left">
              <p className="font-semibold text-foreground">
                Hotel Dashboard
              </p>

              <p className="text-sm font-normal text-muted-foreground">
                {hotelName}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

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
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-5" />

                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}

        <div className="border-t border-border/70 p-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            ← Back to Website
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}