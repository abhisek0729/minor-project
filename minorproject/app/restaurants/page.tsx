import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Store,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";

import Navbar from "@/app/features/landing/components/Navbar";
import Footer from "@/app/features/landing/components/Footer";
import { getRestaurants } from "@/app/features/restaurant/services/restaurant.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function RestaurantsPage() {
  let restaurants: Awaited<ReturnType<typeof getRestaurants>> = [];

  try {
    restaurants = await getRestaurants();
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header Section */}
        <section className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <UtensilsCrossed className="size-3.5" />
            Discover Culinary Delights
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Explore Restaurants in Nepal
          </h1>

          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
            Browse authentic local eateries, traditional Nepali kitchens, cozy cafes, and fine dining destinations. Click on any restaurant to browse their food menu and pricing.
          </p>
        </section>

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <Card className="mt-8 border-dashed bg-muted/20 p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
              <Store className="size-8" />
            </div>
            <CardTitle className="text-xl">No restaurants listed yet</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2">
              Restaurant owners can register their business to showcase their menu and dishes to tourists across Nepal.
            </CardDescription>
            <div className="mt-6">
              <Link href="/partner/register?role=restaurantOwner">
                <Button>Become a Restaurant Partner</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant, idx) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="group block"
              >
                <Card className="overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full flex flex-col justify-between">
                  <div>
                    {/* Cover Image & Status Badge */}
                    <div className="relative h-56 w-full bg-muted overflow-hidden">
                      {restaurant.imageUrl ? (
                        <Image
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                          priority={idx < 3}
                          loading={idx < 3 ? "eager" : "lazy"}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                          <Utensils className="size-10 opacity-40" />
                        </div>
                      )}

                      {/* Live Open / Closed Pill */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border ${
                            restaurant.isOpen ?? true
                              ? "bg-emerald-500/90 text-white border-emerald-400/40"
                              : "bg-red-500/90 text-white border-red-400/40"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              restaurant.isOpen ?? true
                                ? "bg-white animate-pulse"
                                : "bg-white"
                            }`}
                          />
                          {restaurant.isOpen ?? true ? "Open Now" : "Closed"}
                        </span>
                      </div>

                      {/* Cuisine Badge */}
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          variant="secondary"
                          className="bg-black/60 text-white backdrop-blur-md text-xs border-0 font-medium"
                        >
                          {restaurant.cuisine || "Multi-Cuisine"}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {restaurant.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {restaurant.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
                        <MapPin className="size-3.5 shrink-0 text-primary" />
                        <span className="line-clamp-1">{restaurant.location}</span>
                      </div>

                      {restaurant.phoneNumber && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                          <span>{restaurant.phoneNumber}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                        <span>
                          {restaurant.openingTime || "09:00 AM"} -{" "}
                          {restaurant.closingTime || "10:00 PM"}
                        </span>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-6 pt-0">
                    <Button
                      variant="outline"
                      className="w-full text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all gap-1.5"
                    >
                      View Food Menu & Dishes →
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
