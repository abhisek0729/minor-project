"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ArrowUpRight, Globe, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import AdminMobileSidebar from "./AdminMobileSidebar";
import NotificationBell from "@/app/components/dashboard/NotificationBell";

interface AdminHeaderProps {
  adminName: string;
  adminEmail: string;
  pendingCount?: number;
}

export default function AdminHeader({
  adminName,
  adminEmail,
  pendingCount = 0,
}: AdminHeaderProps) {
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <AdminMobileSidebar adminName={adminName} pendingCount={pendingCount} />

          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold leading-none">Admin Control Center</h2>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold border-primary/40 text-primary">
                ADMIN
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{adminEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          {/* Redirect to Main Platform Website */}
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-semibold gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10 cursor-pointer shadow-xs"
            >
              <Globe className="size-3.5" />
              <span>Main Platform</span>
              <ArrowUpRight className="size-3 text-muted-foreground" />
            </Button>
          </Link>

          {/* Trigger In-place Sign Out Modal */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSignOutOpen(true)}
            className="size-9 rounded-full text-destructive hover:bg-destructive/10 cursor-pointer"
            title="Log out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* SIGN OUT CONFIRMATION MODAL */}
      {isSignOutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-card border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-500/10 shrink-0">
                <LogOut className="size-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Sign Out</h3>
                <p className="text-xs text-muted-foreground">End current admin session</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to sign out from the Super Admin portal? You will need to log back in as <strong className="text-foreground">{adminEmail}</strong> to access administrative tools.
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
