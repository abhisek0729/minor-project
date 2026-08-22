"use client";

import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Compass,
  Hotel,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    description: "Manage your restaurant profile, food menus, tables, and reservations.",
    icon: UtensilsCrossed,
    href: "/dashboard/restaurant",
  },
  hotelOwner: {
    title: "Hotel Owner",
    description: "Manage hotel rooms, facilities, availability, and guest bookings.",
    icon: Hotel,
    href: "/dashboard/hotels",
  },
  guide: {
    title: "Tour Guide",
    description: "Manage tour packages, guiding calendar, and traveler requests.",
    icon: Compass,
    href: "/dashboard/guide",
  },
  admin: {
    title: "System Administrator",
    description: "Platform management, partner approvals, and system analytics.",
    icon: ShieldCheck,
    href: "/dashboard/admin",
  },
} as const;

export default function WorkspaceSelector({
  userName,
  roles,
}: WorkspaceSelectorProps) {
  const router = useRouter();

  // Filter roles: Only show business partner / admin workspaces that are present in the user's active roles
  const activeRoles = roles.filter(
    (r) => r.name in standardWorkspaces
  );

  const handleRoleClick = (roleName: string, href: string) => {
    const roleInfo = roles.find((r) => r.name === roleName);

    if (roleInfo?.approvalStatus === "pending") {
      if (roleName === "restaurantOwner") {
        router.push("/onboarding/restaurant");
        return;
      }
      if (roleName === "hotelOwner") {
        router.push("/onboarding/hotel");
        return;
      }
      if (roleName === "guide") {
        router.push("/dashboard/guide");
        return;
      }
      if (roleName === "admin") {
        router.push("/dashboard/admin/pending");
        return;
      }
    }

    router.push(href);
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 className="size-8" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Choose your workspace
        </h1>

        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          Welcome back{userName ? `, ${userName}` : ""}. Select the workspace you want to manage.
        </p>
      </div>

      {activeRoles.length === 0 ? (
        <Card className="border-dashed bg-muted/15 p-12 text-center">
          <p className="font-semibold text-base">No partner workspaces found</p>
          <p className="text-xs text-muted-foreground mt-1">
            You don't have an active partner workspace yet. Register as a partner or continue to explore.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/partner/business-type")}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              Become a Partner
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="px-4 py-2 text-sm font-semibold rounded-lg border bg-background hover:bg-muted transition-colors cursor-pointer"
            >
              Go to Profile
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {activeRoles.map((role) => {
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
                  <div className="rounded-xl bg-primary/10 p-3.5 group-hover:scale-105 transition-transform text-primary shrink-0">
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

                      {isApproved && (
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
        </div>
      )}
    </div>
  );
}