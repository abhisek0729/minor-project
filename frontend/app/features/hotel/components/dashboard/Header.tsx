import { Bell } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserNav } from "../../../shared/components/UserNav";
import { MobileSidebar } from "./MobileSidebar";
import GlobalWorkspaceSwitcher from "@/app/components/dashboard/GlobalWorkspaceSwitcher";
import NotificationBell from "@/app/components/dashboard/NotificationBell";

interface HeaderProps {
  hotelName: string;
  userName: string;
  userEmail: string;
  approvalStatus:
    | "approved"
    | "pending"
    | "rejected"
    | "suspended";
}

export function Header({ hotelName, userName, userEmail,approvalStatus }: HeaderProps) {
  const initials =
    userName
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MobileSidebar hotelName={hotelName} approvalStatus={approvalStatus} />

          <div>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {hotelName}
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage your hotel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GlobalWorkspaceSwitcher />

          <NotificationBell />

          <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-2 py-1.5 shadow-sm">
            <UserNav name={userName} email={userEmail} />
          </div>
        </div>
      </div>
    </header>
  );
}
