"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  Clock3,
  LayoutDashboard,
  Menu,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface RestaurantMobileSidebarProps {
  restaurant: {
    id: number;
    name: string;
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

export default function RestaurantMobileSidebar({
  restaurant,
  approvalStatus,
}: RestaurantMobileSidebarProps) {
  const [open, setOpen] = useState(false);
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 hover:bg-accent focus:outline-none lg:hidden cursor-pointer">
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="flex w-80 flex-col p-0">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
              <UtensilsCrossed className="size-6" />
            </div>

            <div className="text-left overflow-hidden">
              <p className="font-bold text-base text-foreground leading-none">Restaurant Panel</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {restaurant?.name || "Dining Partner"}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dining Management
          </div>

          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/restaurant" && pathname.startsWith(item.href));

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
