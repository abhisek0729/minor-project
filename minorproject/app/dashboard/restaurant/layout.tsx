import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getRestaurantByOwnerId } from "@/app/features/restaurant/services/restaurant.service";
import RestaurantSidebar from "@/app/features/restaurant/components/dashboard/RestaurantSidebar";
import RestaurantHeader from "@/app/features/restaurant/components/dashboard/RestaurantHeader";

interface RestaurantDashboardLayoutProps {
  children: ReactNode;
}

export default async function RestaurantDashboardLayout({
  children,
}: RestaurantDashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const isRestaurantOwner = session?.user?.roles?.some(
    (role) => role.name === "restaurantOwner"
  );

  if (!isRestaurantOwner) {
    redirect("/unauthorized");
  }

  const restaurant = await getRestaurantByOwnerId(Number(session.user.id));

  if (!restaurant) {
    redirect("/onboarding/restaurant");
  }

  const ownerRole = session.user.roles?.find(
    (role) => role.name === "restaurantOwner"
  );

  const approvalStatus = ownerRole?.approvalStatus ?? "pending";

  return (
    <div className="flex h-dvh overflow-hidden bg-muted/30">
      <RestaurantSidebar
        restaurant={restaurant}
        approvalStatus={approvalStatus}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <RestaurantHeader
          restaurantName={restaurant.name}
          userName={session.user.name ?? "Owner"}
          userEmail={session.user.email ?? ""}
          isOpen={restaurant.isOpen ?? true}
          approvalStatus={approvalStatus}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}