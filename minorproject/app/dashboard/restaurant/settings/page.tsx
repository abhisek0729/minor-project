import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getRestaurantByOwnerId } from "@/app/features/restaurant/services/restaurant.service";
import RestaurantSettingsForm from "@/app/features/restaurant/components/settings/RestaurantSettingsForm";

export default async function RestaurantSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const ownerRole = session.user.roles?.find(
    (role) => role.name === "restaurantOwner"
  );

  if (!ownerRole) {
    redirect("/unauthorized");
  }

  if (ownerRole.approvalStatus === "pending") {
    redirect("/dashboard/restaurant/pending");
  }

  const restaurant = await getRestaurantByOwnerId(Number(session.user.id));

  if (!restaurant) {
    redirect("/onboarding/restaurant");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Restaurant Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update your business branding, cuisine type, contact info, and location.
        </p>
      </div>

      <RestaurantSettingsForm
        initialData={{
          name: restaurant.name,
          description: restaurant.description,
          establishedDate: restaurant.establishedDate,
          cuisine: restaurant.cuisine,
          phoneNumber: restaurant.phoneNumber,
          location: restaurant.location,
          restaurantImageUrl: restaurant.restaurantImageUrl,
        }}
      />
    </div>
  );
}
