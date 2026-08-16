import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { checkHasRestaurant } from "@/app/features/restaurant/services/restaurant.service";
import RestaurantOnboardingForm from "@/app/features/restaurant/components/onboarding/RestaurantOnboardingForm";

export default async function RestaurantOnboardingPage() {
  const session = await getServerSession(authOptions);

  // 1. Unauthenticated User Check
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // 2. Unauthorized User Check
  const isRestaurantOwner = session.user.roles?.some(
    (role) => role.name === "restaurantOwner"
  );
  if (!isRestaurantOwner) {
    redirect("/unauthorized");
  }

  // 3. Unverified User Check (Assuming approvalStatus exists on the role pivot)
  const ownerRole = session.user.roles?.find((r) => r.name === "restaurantOwner");
  if (ownerRole?.approvalStatus === "pending") {
    redirect("/dashboard/restaurant/pending");
  }

  // 4. Already Onboarded Check
  const hasRestaurant = await checkHasRestaurant(Number(session.user.id));
  if (hasRestaurant) {
    redirect("/dashboard/restaurant");
  }

  return (
    <main className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <RestaurantOnboardingForm userEmail={session.user.email ?? ""} />
      </div>
    </main>
  );
}