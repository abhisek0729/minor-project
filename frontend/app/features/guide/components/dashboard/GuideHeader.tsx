"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, LogOut, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GlobalWorkspaceSwitcher from "@/app/components/dashboard/GlobalWorkspaceSwitcher";
import NotificationBell from "@/app/components/dashboard/NotificationBell";

import GuideMobileSidebar from "./GuideMobileSidebar";

interface GuideHeaderProps {
  guideName: string;
  location: string;
  isAvailable: boolean;
  dailyRate: number;
  approvalStatus?: "approved" | "pending" | "rejected" | "suspended";
}

export default function GuideHeader({
  guideName,
  location,
  isAvailable,
  dailyRate,
  approvalStatus = "pending",
}: GuideHeaderProps) {
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <GuideMobileSidebar
            guideName={guideName}
            approvalStatus={approvalStatus}
          />

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-emerald-600" />
            <span>{location || "Nepal"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GlobalWorkspaceSwitcher />

          <NotificationBell />

          {/* Sign Out Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSignOutOpen(true)}
            className="size-9 rounded-full text-destructive hover:bg-destructive/10 cursor-pointer"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* SIGN OUT CONFIRMATION MODAL */}
      {isSignOutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-card border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 shrink-0">
                <LogOut className="size-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Sign Out</h3>
                <p className="text-xs text-muted-foreground">End current guide session</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to sign out from the Guide Dashboard? You will need to log back in to manage your guide profile and treks.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoggingOut}
                onClick={() => setIsSignOutOpen(false)}
                className="rounded-xl cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                size="sm"
                disabled={isLoggingOut}
                onClick={handleSignOut}
                className="rounded-xl font-bold gap-1.5 cursor-pointer shadow-xs"
              >
                {isLoggingOut ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
                Yes, Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
