"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Phone,
  Search,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";

import Navbar from "@/app/features/landing/components/Navbar";
import Footer from "@/app/features/landing/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RestaurantsClientView({
  initialRestaurants,
}: {
  initialRestaurants: any[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");

  const cuisines = [
    "all",
    "Traditional Nepali",
    "Multi-Cuisine",
    "Newari Specialty",
    "Local Nepali",
    "Tharu & Continental",
    "Cafe & Fast Food",
  ];

  const filteredRestaurants = initialRestaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
      (restaurant.location &&
        restaurant.location.toLowerCase().includes(search.toLowerCase())) ||
      (restaurant.description &&
        restaurant.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCuisine =
      selectedCuisine === "all" ||
      (restaurant.cuisine &&
        restaurant.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase()));

    return matchesSearch && matchesCuisine;
  });

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

        {/* Search & Cuisine Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by restaurant name, location, Thamel, Dharan, Pokhara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Cuisine Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {cuisines.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCuisine(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCuisine === c
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {c === "all" ? "All Cuisines" : c}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        {filteredRestaurants.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-muted/20 p-12 text-center space-y-3">
            <p className="text-lg font-bold text-foreground">No matching restaurants found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search query or switching cuisine categories.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCuisine("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
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
                          loading="lazy"
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
                      className="w-full text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all gap-1.5 cursor-pointer"
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
