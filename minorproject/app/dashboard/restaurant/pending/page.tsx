import Link from "next/link";
import Image from "next/image";
import { Clock3, Mail, ArrowLeft, UtensilsCrossed, MapPin, Phone, Edit3, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getRestaurantByOwnerId } from "@/app/features/restaurant/services/restaurant.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function RestaurantPendingPage() {
  const session = await getServerSession(authOptions);
  const restaurant = session?.user?.id ? await getRestaurantByOwnerId(Number(session.user.id)) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      {/* Top Banner Alert */}
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <Clock3 className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Restaurant Verification In Progress</h2>
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                Pending Approval
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your restaurant listing and digital menu details have been submitted. Our administrators will verify your kitchen details and activate public reservations.
            </p>
          </div>
        </div>

        <Link href="/dashboard/restaurant/settings">
          <Button size="sm" className="gap-1.5 font-semibold text-xs rounded-xl shadow-xs">
            <Edit3 className="size-3.5" /> Edit Restaurant Profile
          </Button>
        </Link>
      </div>

      {/* Submitted Restaurant Profile Details Card */}
      {restaurant ? (
        <Card className="rounded-3xl border shadow-sm overflow-hidden bg-card">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <UtensilsCrossed className="size-5 text-primary" /> Submitted Restaurant Information
                </CardTitle>
                <CardDescription className="text-xs">
                  Review the business branding and contact information you provided during onboarding.
                </CardDescription>
              </div>
              <Link href="/dashboard/restaurant/settings">
                <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 rounded-xl">
                  <Edit3 className="size-3.5" /> Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Top Identity & Cover */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {restaurant.restaurantImageUrl ? (
                <div className="relative h-32 w-full sm:w-48 rounded-2xl overflow-hidden border shrink-0 shadow-xs">
                  <Image
                    src={restaurant.restaurantImageUrl}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-32 w-full sm:w-48 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border shrink-0">
                  <UtensilsCrossed className="size-10 opacity-40" />
                </div>
              )}

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-foreground">{restaurant.name}</h3>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {restaurant.cuisine || "Multi-Cuisine"}
                  </Badge>
                  {restaurant.establishedDate && (
                    <span className="text-xs text-muted-foreground">
                      (Est. {restaurant.establishedDate})
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {restaurant.description}
                </p>

                <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Phone className="size-3.5 text-primary" /> {restaurant.phoneNumber}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock3 className="size-3.5 text-primary" /> Hours: {restaurant.openingTime || "09:00 AM"} – {restaurant.closingTime || "10:00 PM"}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Address */}
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-4 text-primary" /> Registered Restaurant Location
              </h4>
              <p className="text-sm font-semibold text-foreground">
                {restaurant.location}
              </p>
            </div>

            {/* Next Steps & Support Help */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t text-xs">
              <span className="text-muted-foreground">
                Need to make modifications or contact verification staff?
              </span>
              <div className="flex gap-2">
                <Link href="mailto:support@tourism.com">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                    <Mail className="size-3.5" /> Contact Support
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
                    <ArrowLeft className="size-3.5" /> Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center rounded-3xl border">
          <p className="text-sm text-muted-foreground">No restaurant registration data found.</p>
          <Link href="/onboarding/restaurant" className="mt-3 inline-block">
            <Button size="sm">Start Restaurant Onboarding</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
