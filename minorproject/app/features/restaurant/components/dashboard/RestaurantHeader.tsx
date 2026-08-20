"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, Power, User, Utensils } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toggleRestaurantOpenStatus } from "../../actions/availability.action";
import GlobalWorkspaceSwitcher from "@/app/components/dashboard/GlobalWorkspaceSwitcher";

interface RestaurantHeaderProps {
  restaurantName: string;
  userName: string;
  userEmail: string;
  isOpen: boolean;
  approvalStatus: string;
}

export default function RestaurantHeader({
  restaurantName,
  userName,
  userEmail,
  isOpen,
  approvalStatus,
}: RestaurantHeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = () => {
    startTransition(async () => {
      const res = await toggleRestaurantOpenStatus(!isOpen);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Utensils className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-none">{restaurantName}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Status:{" "}
            <span
              className={
                approvalStatus === "approved"
                  ? "text-emerald-500 font-medium capitalize"
                  : "text-amber-500 font-medium capitalize"
              }
            >
              {approvalStatus}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <GlobalWorkspaceSwitcher />

        {/* Open / Closed Quick Toggle Switch */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleToggleStatus}
          className={`group flex items-center gap-2 border px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
            isOpen
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400"
          }`}
        >
          <span
            className={`inline-block size-2 rounded-full ${
              isOpen
                ? "bg-emerald-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
          <Power className="size-3.5" />
          <span>{isOpen ? "OPEN for Orders" : "CLOSED Now"}</span>
        </Button>

        {/* Profile Link */}
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="size-9 rounded-full">
            <User className="size-4 text-muted-foreground" />
          </Button>
        </Link>

        {/* Sign Out Link */}
        <Link href="/api/auth/signout">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-destructive hover:bg-destructive/10"
            title="Log out"
          >
            <LogOut className="size-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
