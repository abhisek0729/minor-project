import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Clock, Info, ShieldCheck, Sparkles, Store } from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getRestaurantByOwnerId } from "@/app/features/restaurant/services/restaurant.service";
import StatusToggleCard from "@/app/features/restaurant/components/availability/StatusToggleCard";
import HoursForm from "@/app/features/restaurant/components/availability/HoursForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RestaurantAvailabilityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const isOwner = session.user.roles?.some(
    (role) => role.name === "restaurantOwner"
  );

  if (!isOwner) {
    redirect("/unauthorized");
  }

  const restaurant = await getRestaurantByOwnerId(Number(session.user.id));

  if (!restaurant) {
    redirect("/onboarding/restaurant");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Store Availability & Operating Hours
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Control your live restaurant status (Open / Closed) and define your daily operating schedule.
        </p>
      </div>

      {/* Live Status Toggle Card */}
      <StatusToggleCard
        initialIsOpen={restaurant.isOpen ?? true}
        restaurantName={restaurant.name}
      />

      {/* Operating Hours Form */}
      <HoursForm
        initialOpeningTime={restaurant.openingTime || "09:00 AM"}
        initialClosingTime={restaurant.closingTime || "10:00 PM"}
      />

      {/* Availability Tips Card */}
      <Card className="border bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Tips for Managing Restaurant Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p className="flex items-start gap-2">
            <span className="font-bold text-foreground">•</span>
            <span>
              <strong>Emergency Closure:</strong> If the kitchen runs out of gas/supplies or is on break, toggle <strong>"Closed"</strong> to immediately notify travelers.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="font-bold text-foreground">•</span>
            <span>
              <strong>Individual Dishes:</strong> To mark a single dish out of stock without closing the whole restaurant, go to the <strong>Menu Items</strong> page and toggle its individual switch.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="font-bold text-foreground">•</span>
            <span>
              <strong>Festival / Holiday Timings:</strong> Keep your opening and closing hours updated during Dashain, Tihar, or holidays to avoid customer complaints.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
