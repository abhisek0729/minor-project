"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Hotel,
  KeyRound,
  Loader2,
  MapPinned,
  Shield,
  ShieldCheck,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requestAdminAccess } from "@/app/features/admin/actions/request-admin.action";

interface WorkspaceRole {
  name: string;
  approvalStatus?: string;
}

interface WorkspaceSelectorProps {
  userName: string;
  roles: WorkspaceRole[];
}

const standardWorkspaces = {
  restaurantOwner: {
    title: "Restaurant Owner",
    description: "Manage restaurants, menus, and reservations.",
    icon: UtensilsCrossed,
    href: "/dashboard/restaurant",
  },
  hotelOwner: {
    title: "Hotel Owner",
    description: "Manage hotels, rooms, bookings, and guests.",
    icon: Hotel,
    href: "/dashboard/hotels",
  },
  tourist: {
    title: "Tourist",
    description: "Plan trips, manage bookings, and explore destinations.",
    icon: User,
    href: "/profile",
  },
  guide: {
    title: "Tour Guide",
    description: "Manage tours, schedules, and customer requests.",
    icon: MapPinned,
    href: "/dashboard/guide",
  },
} as const;

export default function WorkspaceSelector({
  userName,
  roles,
}: WorkspaceSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const adminRole = roles.find((r) => r.name === "admin");
  const isAdminApproved = adminRole?.approvalStatus === "approved";
  const isAdminPending = adminRole?.approvalStatus === "pending";

  const handleAdminClick = () => {
    if (isAdminApproved) {
      router.push("/dashboard/admin");
      return;
    }

    if (isAdminPending) {
      router.push("/dashboard/admin/pending");
      return;
    }

    // Request admin access
    startTransition(async () => {
      const res = await requestAdminAccess();
      if (res.success) {
        toast.success(res.message);
        router.push("/dashboard/admin/pending");
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleRoleClick = (roleName: string, href: string) => {
    const roleInfo = roles.find((r) => r.name === roleName);
    if (roleInfo?.approvalStatus === "pending") {
      if (roleName === "restaurantOwner") {
        router.push("/dashboard/restaurant/pending");
        return;
      }
      if (roleName === "hotelOwner") {
        router.push("/dashboard/hotels/pending");
        return;
      }
    }
    router.push(href);
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 className="size-8" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Choose your workspace
        </h1>

        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          Welcome back{userName ? `, ${userName}` : ""}. Select the workspace you want to continue with.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* User's Assigned Business & Tourist Workspaces */}
        {roles
          .filter((r) => r.name !== "admin")
          .map((role) => {
            const workspace =
              standardWorkspaces[role.name as keyof typeof standardWorkspaces];

            if (!workspace) return null;

            const Icon = workspace.icon;
            const isApproved = role.approvalStatus === "approved";
            const isPendingApproval = role.approvalStatus === "pending";

            return (
              <Card
                key={role.name}
                onClick={() => handleRoleClick(role.name, workspace.href)}
                className="cursor-pointer transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg border bg-card relative overflow-hidden group"
              >
                <CardContent className="flex items-start gap-5 p-6">
                  <div className="rounded-xl bg-primary/10 p-3 group-hover:scale-105 transition-transform text-primary shrink-0">
                    <Icon className="size-7" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-semibold truncate">
                        {workspace.title}
                      </h2>

                      {isPendingApproval && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px]"
                        >
                          <Clock3 className="size-3 mr-1" /> Pending
                        </Badge>
                      )}

                      {isApproved && role.name !== "tourist" && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px]"
                        >
                          <CheckCircle2 className="size-3 mr-1" /> Active
                        </Badge>
                      )}
                    </div>

                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {workspace.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

        {/* Administrator Workspace Card (Always Available Beside Other Workspaces) */}
        <Card
          onClick={handleAdminClick}
          className="cursor-pointer transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg border bg-card relative overflow-hidden group border-primary/30"
        >
          <CardContent className="flex items-start gap-5 p-6">
            <div className="rounded-xl bg-primary text-primary-foreground p-3 group-hover:scale-105 transition-transform shrink-0 shadow-md">
              {isPending ? (
                <Loader2 className="size-7 animate-spin" />
              ) : (
                <Shield className="size-7" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold truncate flex items-center gap-1.5">
                  Administrator
                </h2>

                {isAdminApproved ? (
                  <Badge className="bg-emerald-600 text-white text-[11px] font-semibold">
                    <CheckCircle2 className="size-3 mr-1" /> Approved
                  </Badge>
                ) : isAdminPending ? (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[11px] font-semibold"
                  >
                    <Clock3 className="size-3 mr-1" /> Pending Approval
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[11px] border-primary/40 text-primary"
                  >
                    Request Access
                  </Badge>
                )}
              </div>

              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isAdminApproved
                  ? "Manage platform users, verify businesses, and review pending applications."
                  : "Manage users, approve restaurants & hotels. Requires website owner database approval."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}