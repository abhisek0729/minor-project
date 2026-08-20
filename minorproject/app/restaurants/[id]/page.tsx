import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Utensils,
  UtensilsCrossed,
  Navigation,
  ExternalLink,
} from "lucide-react";

import Navbar from "@/app/features/landing/components/Navbar";
import Footer from "@/app/features/landing/components/Footer";
import {
  getRestaurantById,
  getRestaurantMenu,
} from "@/app/features/restaurant/services/restaurant.service";
import {
  getRatingSummary,
  getReviewsForTarget,
} from "@/app/features/reviews/services/reviews.service";
import ReviewsSection from "@/app/features/reviews/components/ReviewsSection";
import { Badge } from "@/components/ui/badge";
import PublicRestaurantMenu from "@/app/features/restaurant/components/public/PublicRestaurantMenu";

interface RestaurantDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { id } = await params;
  const restaurantId = parseInt(id, 10);

  if (isNaN(restaurantId)) {
    notFound();
  }

  const [restaurant, menuItems, reviews, ratingSummary] = await Promise.all([
    getRestaurantById(restaurantId),
    getRestaurantMenu(restaurantId),
    getReviewsForTarget("restaurant", restaurantId),
    getRatingSummary("restaurant", restaurantId),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8 w-full flex-1 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to All Restaurants</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden border bg-card shadow-sm">
          {/* Cover Photo */}
          <div className="relative h-64 sm:h-80 w-full bg-muted">
            {restaurant.restaurantImageUrl ? (
              <Image
                src={restaurant.restaurantImageUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
                unoptimized
                priority
                loading="eager"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                <Utensils className="size-16 opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Live Open / Closed Status Badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-md border ${
                  restaurant.isOpen ?? true
                    ? "bg-emerald-500/90 text-white border-emerald-400/40"
                    : "bg-red-500/90 text-white border-red-400/40"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    restaurant.isOpen ?? true ? "bg-white animate-pulse" : "bg-white"
                  }`}
                />
                {restaurant.isOpen ?? true ? "OPEN FOR ORDERS" : "CLOSED NOW"}
              </span>
            </div>

            {/* Bottom Title on Hero */}
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
                  {restaurant.cuisine || "Multi-Cuisine"} Cuisine
                </Badge>
                {restaurant.establishedDate && (
                  <Badge variant="secondary" className="text-xs font-semibold backdrop-blur-md bg-white/20 text-white border-white/30">
                    Est. {restaurant.establishedDate}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                {restaurant.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <span>{restaurant.location}</span>
                </div>

                {restaurant.phoneNumber && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-4 text-primary shrink-0" />
                    <span>{restaurant.phoneNumber}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-primary shrink-0" />
                  <span>
                    Hours: {restaurant.openingTime || "09:00 AM"} -{" "}
                    {restaurant.closingTime || "10:00 PM"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="p-6 border-t bg-card/60">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              About the Restaurant
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {restaurant.description}
            </p>
          </div>
        </div>

        {/* Menu Section */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
                <UtensilsCrossed className="size-6 text-primary" />
                Food & Drinks Menu
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Freshly prepared local and international culinary offerings ({menuItems.length} items available).
              </p>
            </div>
          </div>

          {/* Public Menu Items Component */}
          <PublicRestaurantMenu items={menuItems} />
        </section>

        {/* Interactive Location & Navigation Map */}
        <section className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                Find Restaurant on Google Maps
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {restaurant.location}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name}, ${restaurant.location}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-all shrink-0"
            >
              <Navigation className="size-3.5" />
              <span>Get Driving Directions</span>
              <ExternalLink className="size-3 ml-0.5" />
            </a>
          </div>

          <div className="relative w-full h-72 rounded-2xl overflow-hidden border shadow-inner bg-muted/40">
            <iframe
              title={`Map for ${restaurant.name}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${restaurant.name}, ${restaurant.location}`)}&z=15&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </section>

        {/* Guest Reviews & Rating Section */}
        <ReviewsSection
          targetType="restaurant"
          targetId={restaurantId}
          targetName={restaurant.name}
          reviews={reviews}
          avgRating={ratingSummary.avgRating}
          totalReviews={ratingSummary.totalReviews}
        />
      </main>

      <Footer />
    </div>
  );
}
