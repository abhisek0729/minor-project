"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Maximize2, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const destinations = [
  {
    id: 1,
    name: "Pokhara",
    description: "Lakes, valley views, and adventure-filled afternoons",
    image:
      "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1200&auto=format&fit=crop",
    rating: 5.0,
    reviews: 342,
    activities: ["Paragliding", "Lake activities", "Mountain views"],
    price: "NPR 12,500",
  },
  {
    id: 2,
    name: "Kathmandu",
    description: "Ancient temples, vibrant culture, and historic landmarks",
    image:
      "https://images.unsplash.com/photo-1584632170055-7837c3dbe475?q=80&w=1200&auto=format&fit=crop",
    rating: 4.8,
    reviews: 521,
    activities: ["Temple tours", "Cultural experiences", "Local cuisine"],
    price: "NPR 10,000",
  },
  {
    id: 3,
    name: "Everest Base Camp",
    description: "Epic trekking trail with breathtaking ridge views",
    image:
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1200&auto=format&fit=crop",
    rating: 4.9,
    reviews: 283,
    activities: ["Trekking", "Mountain photography", "Cultural villages"],
    price: "NPR 28,000",
  },
  {
    id: 4,
    name: "Chitwan National Park",
    description: "Wildlife safari, jungle experiences, and exotic nature",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
    rating: 4.7,
    reviews: 198,
    activities: ["Jungle safari", "Wildlife spotting", "Boat rides"],
    price: "NPR 15,000",
  },
  {
    id: 5,
    name: "Mustang",
    description: "Dry cliffs, monasteries, and high-altitude landscapes",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    rating: 4.8,
    reviews: 145,
    activities: ["Trekking", "Photography", "Monastery visits"],
    price: "NPR 16,800",
  },
  {
    id: 6,
    name: "Lumbini",
    description: "Birthplace of Buddha, spiritual sites, and sacred gardens",
    image:
      "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?q=80&w=1200&auto=format&fit=crop",
    rating: 4.6,
    reviews: 127,
    activities: ["Meditation", "Spiritual tours", "Temple visits"],
    price: "NPR 8,500",
  },
];

export default function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const filteredDestinations = destinations.filter((dest) =>
    dest.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Explore Destinations
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover incredible places to visit across Nepal
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">
              Search destinations
            </label>
            <Input
              placeholder="Find your next adventure..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-2"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Destinations Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((destination) => (
            <Card
              key={destination.id}
              className="group overflow-hidden border-border transition-all hover:shadow-lg"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {destination.rating.toFixed(1)}
                </div>
              </div>

              <CardContent className="space-y-4 p-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {destination.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {destination.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {destination.reviews} reviews
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Popular Activities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {destination.activities.map((activity) => (
                      <span
                        key={activity}
                        className="rounded-full border border-border bg-muted px-2 py-1 text-xs text-foreground"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-lg font-bold text-foreground">
                    {destination.price}
                  </span>
                  <Link href="/">
                    <Button size="sm" variant="default">
                      Explore
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
