"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Building2,
  Check,
  ChevronDown,
  Compass,
  Hotel,
  Plus,
  ShieldCheck,
  User,
  UtensilsCrossed,
} from "lucide-react";

export default function GlobalWorkspaceSwitcher() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roles = session?.user?.roles ?? [];
  const hasHotel = roles.some((r) => r.name === "hotelOwner");
  const hasRestaurant = roles.some((r) => r.name === "restaurantOwner");
  const hasGuide = roles.some((r) => r.name === "guide");
  const hasAdmin = roles.some((r) => r.name === "admin");

  // Determine current active workspace based on current URL
  let currentWorkspace = {
    title: "Traveler & Bookings",
    shortTitle: "Traveler",
    icon: User,
    color: "bg-blue-500/10 text-blue-600",
    badge: "Personal",
    href: "/dashboard",
  };

  if (pathname.startsWith("/dashboard/hotels")) {
    currentWorkspace = {
      title: "Hotel Management",
      shortTitle: "Hotel Owner",
      icon: Hotel,
      color: "bg-emerald-500/10 text-emerald-600",
      badge: "Hotel",
      href: "/dashboard/hotels",
    };
  } else if (pathname.startsWith("/dashboard/restaurant")) {
    currentWorkspace = {
      title: "Restaurant Management",
      shortTitle: "Restaurant",
      icon: UtensilsCrossed,
      color: "bg-amber-500/10 text-amber-600",
      badge: "Dining",
      href: "/dashboard/restaurant",
    };
  } else if (pathname.startsWith("/dashboard/guide")) {
    currentWorkspace = {
      title: "Tour Guide Portal",
      shortTitle: "Tour Guide",
      icon: Compass,
      color: "bg-violet-500/10 text-violet-600",
      badge: "Guide",
      href: "/dashboard/guide",
    };
  } else if (pathname.startsWith("/dashboard/admin")) {
    currentWorkspace = {
      title: "System Administrator",
      shortTitle: "Admin",
      icon: ShieldCheck,
      color: "bg-rose-500/10 text-rose-600",
      badge: "Admin",
      href: "/dashboard/admin",
    };
  }

  const CurrentIcon = currentWorkspace.icon;

  const navigateTo = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-xl border bg-card/80 px-3 py-1.5 text-xs font-semibold shadow-xs backdrop-blur-sm transition-all hover:bg-muted hover:border-primary/40 focus:outline-hidden"
      >
        <div className={`rounded-lg p-1.5 ${currentWorkspace.color}`}>
          <CurrentIcon className="size-3.5" />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[10px] text-muted-foreground leading-none">
            Workspace
          </span>
          <span className="font-semibold text-foreground truncate max-w-[130px]">
            {currentWorkspace.shortTitle}
          </span>
        </div>

        <ChevronDown
          className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Switcher Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border bg-card p-2 shadow-xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 pb-2 border-b">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Switch Workspace
            </p>
          </div>

          <div className="mt-1 space-y-1">
            {/* 1. Tourist / Personal Dashboard */}
            <button
              type="button"
              onClick={() => navigateTo("/dashboard")}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-muted ${
                currentWorkspace.href === "/dashboard"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-blue-500/10 text-blue-600 p-1.5">
                  <User className="size-3.5" />
                </div>
                <div className="text-left">
                  <p className="leading-tight">Traveler View</p>
                  <p className="text-[10px] text-muted-foreground">
                    Bookings & profile
                  </p>
                </div>
              </div>
              {currentWorkspace.href === "/dashboard" && (
                <Check className="size-3.5 text-primary" />
              )}
            </button>

            {/* 2. Hotel Owner Workspace */}
            {hasHotel && (
              <button
                type="button"
                onClick={() => navigateTo("/dashboard/hotels")}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-muted ${
                  currentWorkspace.href === "/dashboard/hotels"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-emerald-500/10 text-emerald-600 p-1.5">
                    <Hotel className="size-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="leading-tight">Hotel Dashboard</p>
                    <p className="text-[10px] text-muted-foreground">
                      Rooms & reservations
                    </p>
                  </div>
                </div>
                {currentWorkspace.href === "/dashboard/hotels" && (
                  <Check className="size-3.5 text-primary" />
                )}
              </button>
            )}

            {/* 3. Restaurant Owner Workspace */}
            {hasRestaurant && (
              <button
                type="button"
                onClick={() => navigateTo("/dashboard/restaurant")}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-muted ${
                  currentWorkspace.href === "/dashboard/restaurant"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-amber-500/10 text-amber-600 p-1.5">
                    <UtensilsCrossed className="size-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="leading-tight">Restaurant Panel</p>
                    <p className="text-[10px] text-muted-foreground">
                      Menus & food orders
                    </p>
                  </div>
                </div>
                {currentWorkspace.href === "/dashboard/restaurant" && (
                  <Check className="size-3.5 text-primary" />
                )}
              </button>
            )}

            {/* 4. Guide Portal */}
            {hasGuide && (
              <button
                type="button"
                onClick={() => navigateTo("/dashboard/guide")}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-muted ${
                  currentWorkspace.href === "/dashboard/guide"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-violet-500/10 text-violet-600 p-1.5">
                    <Compass className="size-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="leading-tight">Tour Guide Portal</p>
                    <p className="text-[10px] text-muted-foreground">
                      Tours & schedules
                    </p>
                  </div>
                </div>
                {currentWorkspace.href === "/dashboard/guide" && (
                  <Check className="size-3.5 text-primary" />
                )}
              </button>
            )}

            {/* 5. Admin Panel */}
            {hasAdmin && (
              <button
                type="button"
                onClick={() => navigateTo("/dashboard/admin")}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-muted ${
                  currentWorkspace.href === "/dashboard/admin"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-rose-500/10 text-rose-600 p-1.5">
                    <ShieldCheck className="size-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="leading-tight">Admin Control Panel</p>
                    <p className="text-[10px] text-muted-foreground">
                      Approvals & oversight
                    </p>
                  </div>
                </div>
                {currentWorkspace.href === "/dashboard/admin" && (
                  <Check className="size-3.5 text-primary" />
                )}
              </button>
            )}
          </div>

          {/* Partner Registration shortcut if not all partner roles owned */}
          {(!hasHotel || !hasRestaurant || !hasGuide) && (
            <div className="mt-2 pt-1.5 border-t">
              <button
                type="button"
                onClick={() => navigateTo("/partner/business-type")}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Add / Register Partner Business</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
