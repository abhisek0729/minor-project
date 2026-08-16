"use client";

import Link from "next/link";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
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
        {pendingCount > 0 && (
          <Link href="/dashboard/admin/approvals">
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 hover:bg-amber-500/25 transition-colors cursor-pointer">
              ⚠️ {pendingCount} Pending Approval{pendingCount > 1 ? "s" : ""}
            </Badge>
          </Link>
        )}

        <Link href="/profile">
          <Button variant="ghost" size="icon" className="size-9 rounded-full">
            <User className="size-4 text-muted-foreground" />
          </Button>
        </Link>

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
