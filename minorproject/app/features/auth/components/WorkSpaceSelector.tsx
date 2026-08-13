"use client";

import { useRouter } from "next/navigation";
import {
  Building2,
  Hotel,
  MapPinned,
  Shield,
  User,
  UtensilsCrossed,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface WorkspaceSelectorProps {
  userName: string;
  roles: string[];
}

const workspaces = {
  tourist: {
    title: "Tourist",
    description: "Plan trips, manage bookings, and explore destinations.",
    icon: User,
    href: "/dashboard/tourist",
  },
  hotelOwner: {
    title: "Hotel Owner",
    description: "Manage hotels, rooms, bookings, and guests.",
    icon: Hotel,
    href: "/dashboard/hotels",
  },
  restaurantOwner: {
    title: "Restaurant Owner",
    description: "Manage restaurants, menus, and reservations.",
    icon: UtensilsCrossed,
    href: "/dashboard/restaurant",
  },
  guide: {
    title: "Tour Guide",
    description: "Manage tours, schedules, and customer requests.",
    icon: MapPinned,
    href: "/dashboard/guide",
  },
  admin: {
    title: "Administrator",
    description: "Manage users, businesses, approvals, and the platform.",
    icon: Shield,
    href: "/dashboard/admin",
  },
} as const;

export default function WorkspaceSelector({
  userName,
  roles,
}: WorkspaceSelectorProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Choose your workspace
        </h1>

        <p className="mt-2 text-muted-foreground">
          Welcome back
          {userName ? `, ${userName}` : ""}. Select the workspace you want to
          continue with.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => {
          const workspace =
            workspaces[role as keyof typeof workspaces];

          if (!workspace) return null;

          const Icon = workspace.icon;

          return (
            <Card
              key={role}
              onClick={() => router.push(workspace.href)}
              className="cursor-pointer transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
            >
              <CardContent className="flex items-start gap-5 p-6">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Icon className="h-7 w-7 text-primary" />
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-semibold">
                    {workspace.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {workspace.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}