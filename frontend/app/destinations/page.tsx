"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  MapPin,
  Mountain,
  Navigation,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Navbar from "@/app/features/landing/components/Navbar";
import Footer from "@/app/features/landing/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import allDestinationsData from "@/app/lib/db/destinations-data.json";

export default function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [visibleCount, setVisibleCount] = useState(24);

  const categories = [
    "all",
    "Lakes & Mountains",
    "Culture & Heritage",
    "High Altitude Trek",
    "Wildlife & Safari",
    "Viewpoint & Adventure",
    "Spiritual & Pilgrimage",
    "Expedition & Culture",
    "Scenic Viewpoint",
  ];

  const provinces = [
    "all",
    "Koshi Province",
    "Madhesh Province",
    "Bagmati Province",
    "Gandaki Province",
    "Lumbini Province",
    "Karnali Province",
    "Sudurpashchim Province",
  ];

  const filteredDestinations = useMemo(() => {
    return allDestinationsData.filter((dest) => {
      const q = search.toLowerCase();
      const matchesSearch =
        dest.name.toLowerCase().includes(q) ||
        dest.region.toLowerCase().includes(q) ||
        dest.shortDescription.toLowerCase().includes(q) ||
        dest.category.toLowerCase().includes(q) ||
        (dest.activities && dest.activities.some((a) => a.toLowerCase().includes(q)));

      const matchesCat = selectedCategory === "all" || dest.category === selectedCategory;
      const matchesProv = selectedProvince === "all" || dest.region.includes(selectedProvince);

      return matchesSearch && matchesCat && matchesProv;
    });
  }, [search, selectedCategory, selectedProvince]);

  const displayedDestinations = filteredDestinations.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header Section */}
        <section className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Mountain className="size-3.5" />
            150+ Verified Nepal Destinations
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Explore Nepal Destinations
          </h1>

          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
            From majestic Himalayan peaks and high passes to serene glacial lakes, ancient UNESCO heritage cities, wildlife national parks, and sacred shrines.
          </p>
        </section>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, region, trekking trail, lake, temple..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(24);
                }}
                className="pl-10 h-11 bg-card rounded-2xl"
              />
            </div>

            <div className="text-xs text-muted-foreground font-semibold">
              Showing {displayedDestinations.length} of {filteredDestinations.length} destinations
            </div>
          </div>

          {/* Province Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {provinces.map((prov) => (
              <button
                key={prov}
                type="button"
                onClick={() => {
                  setSelectedProvince(prov);
                  setVisibleCount(24);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedProvince === prov
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {prov === "all" ? "All Provinces" : prov}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(24);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-muted/20 p-12 text-center space-y-3">
            <p className="text-lg font-bold text-foreground">No matching destinations found</p>
            <p className="text-xs text-muted-foreground">Try clearing search keywords or switching province / category filters.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setSelectedProvince("all");
              }}
              className="rounded-xl cursor-pointer"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedDestinations.map((destination) => (
              <Card
                key={destination.id}
                className="group overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full flex flex-col justify-between rounded-3xl bg-card"
              >
                <Link href={`/destinations/${destination.id}`} className="block flex-1">
                  <div className="relative h-56 w-full bg-muted overflow-hidden">
                    <Image
                      src={destination.coverImage}
                      alt={destination.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Rating */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                      {destination.rating?.toFixed(1) || "4.8"}
                    </div>

                    {/* Category */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md text-[10px] font-semibold border-0">
                        {destination.category}
                      </Badge>
                    </div>

                    {/* Region Pill */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                      <span className="flex items-center gap-1 line-clamp-1">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        {destination.region}
                      </span>
                      {destination.altitude && (
                        <span className="text-[11px] text-white/80 shrink-0">
                          {destination.altitude}
                        </span>
                      )}
                    </div>
                  </div>

                  <CardContent className="space-y-3 p-5">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                      {destination.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {destination.shortDescription}
                    </p>

                    {/* Activities Tags */}
                    {destination.activities && destination.activities.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex flex-wrap gap-1.5">
                          {destination.activities.slice(0, 4).map((act) => (
                            <span
                              key={act}
                              className="rounded-lg border bg-muted/50 px-2 py-0.5 text-[11px] text-foreground font-medium"
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Link>

                <div className="p-5 pt-0 border-t space-y-2.5">
                  <div className="flex items-center justify-between pt-3">
                    <Link
                      href={`/destinations/${destination.id}`}
                      className="text-xs font-bold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      Explore Details →
                    </Link>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.mapQuery || `${destination.name}, Nepal`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                    >
                      <Navigation className="size-3" /> Live Map
                    </a>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("open-ai-chat", {
                          detail: { message: `Plan me a detailed trip and itinerary for ${destination.name} in ${destination.region}` },
                        })
                      );
                    }}
                    className="w-full text-xs font-semibold gap-1.5 rounded-xl cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Sparkles className="size-3.5" /> Plan Trip with AI Agent
                  </Button>
                </div>
              </Card>
            ))}
          </section>
        )}

        {/* Load More Button */}
        {visibleCount < filteredDestinations.length && (
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="rounded-2xl px-8 font-bold text-xs cursor-pointer shadow-xs"
            >
              Load More Destinations ({filteredDestinations.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
