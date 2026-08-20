"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Compass,
  ExternalLink,
  Info,
  MapPin,
  Mountain,
  Navigation,
  Sparkles,
  Star,
  SunMedium,
  Users,
} from "lucide-react";

import Navbar from "@/app/features/landing/components/Navbar";
import Footer from "@/app/features/landing/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import allDestinationsData from "@/app/lib/db/destinations-data.json";

interface DestinationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DestinationDetailPage({ params }: DestinationDetailPageProps) {
  const { id } = use(params);
  const destId = Number(id);

  const destination = allDestinationsData.find((d) => d.id === destId);

  if (!destination) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-32 text-center space-y-4">
          <h1 className="text-3xl font-bold">Destination Not Found</h1>
          <p className="text-sm text-muted-foreground">
            The requested travel destination could not be found in our verified Nepal catalog.
          </p>
          <Link href="/destinations">
            <Button className="font-semibold rounded-xl">← Return to Destinations</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 w-full flex-1 space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to all 150 destinations
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-muted/40 font-medium">
              {destination.category}
            </Badge>
            <Badge className="bg-primary/90 text-primary-foreground text-xs font-semibold">
              {destination.region}
            </Badge>
          </div>
        </div>

        {/* Hero Banner Section */}
        <section className="relative overflow-hidden rounded-3xl border shadow-xl bg-muted h-[440px] sm:h-[500px]">
          <Image
            src={destination.coverImage}
            alt={destination.name}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Floating Details on Hero */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                {destination.rating?.toFixed(1) || "4.8"} ({destination.reviews || 100}+ reviews)
              </div>

              {destination.altitude && (
                <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium backdrop-blur-md">
                  <Mountain className="size-3.5 text-emerald-400" />
                  Altitude: {destination.altitude}
                </div>
              )}

              {destination.bestSeason && (
                <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium backdrop-blur-md">
                  <SunMedium className="size-3.5 text-amber-400" />
                  Best Time: {destination.bestSeason}
                </div>
              )}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl drop-shadow-md">
              {destination.name}
            </h1>

            <p className="max-w-3xl text-sm sm:text-base text-white/90 leading-relaxed drop-shadow-xs">
              {destination.shortDescription}
            </p>
          </div>
        </section>

        {/* Action Grid: AI Assistant, Map & Quick Stats */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Overview & Culture */}
            <Card className="rounded-3xl border shadow-xs bg-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="size-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">History, Heritage & Culture</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {destination.historyAndCulture || destination.shortDescription}
              </p>
            </Card>

            {/* Key Highlights */}
            {destination.highlights && destination.highlights.length > 0 && (
              <Card className="rounded-3xl border shadow-xs bg-card p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-amber-500" />
                  <h2 className="text-xl font-bold tracking-tight">Key Highlights & Experiences</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {destination.highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2.5 rounded-2xl bg-muted/40 p-3.5 border text-xs font-medium"
                    >
                      <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        ✓
                      </span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Activities */}
            {destination.activities && destination.activities.length > 0 && (
              <Card className="rounded-3xl border shadow-xs bg-card p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Popular Activities & Tours</h2>
                <div className="flex flex-wrap gap-2">
                  {destination.activities.map((act) => (
                    <Badge key={act} variant="secondary" className="px-3 py-1.5 text-xs font-semibold rounded-xl">
                      {act}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar Column: Plan & Map */}
          <div className="space-y-6">
            {/* AI Trip Planner Card */}
            <Card className="rounded-3xl border shadow-md bg-gradient-to-br from-primary/5 via-card to-primary/10 p-6 space-y-4">
              <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Sparkles className="size-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold">Plan Trip to {destination.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Let TravelNepal AI create an instant itinerary, suggest top rated hotels, estimated budget, and certified tour guides.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("open-ai-chat", {
                        detail: {
                          message: `Plan me a 3-day complete trip to ${destination.name} in ${destination.region}, including hotels, transport, itinerary, and budget breakdown.`,
                        },
                      })
                    );
                  }}
                  className="w-full font-bold gap-2 rounded-2xl h-11 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Sparkles className="size-4" /> Generate AI Itinerary
                </Button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.mapQuery || `${destination.name}, Nepal`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full text-xs font-semibold gap-2 rounded-2xl h-10 cursor-pointer">
                    <Navigation className="size-4 text-primary" /> Open in Google Maps
                  </Button>
                </a>
              </div>
            </Card>

            {/* Quick Facts */}
            <Card className="rounded-3xl border shadow-xs bg-card p-6 space-y-3.5 text-xs">
              <h4 className="font-bold text-sm text-foreground">Travel Information</h4>

              <div className="flex items-center justify-between border-b pb-2 text-muted-foreground">
                <span>Region</span>
                <span className="font-semibold text-foreground">{destination.region}</span>
              </div>

              {destination.altitude && (
                <div className="flex items-center justify-between border-b pb-2 text-muted-foreground">
                  <span>Elevation</span>
                  <span className="font-semibold text-foreground">{destination.altitude}</span>
                </div>
              )}

              {destination.bestSeason && (
                <div className="flex items-center justify-between border-b pb-2 text-muted-foreground">
                  <span>Best Season</span>
                  <span className="font-semibold text-foreground">{destination.bestSeason}</span>
                </div>
              )}

              {destination.startingCost && (
                <div className="flex items-center justify-between pt-1 text-muted-foreground">
                  <span>Estimated Budget</span>
                  <span className="font-bold text-primary text-sm">{destination.startingCost}</span>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* Nearby Attractions */}
        {destination.nearbyAttractions && destination.nearbyAttractions.length > 0 && (
          <section className="space-y-6 pt-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <MapPin className="size-6 text-primary" />
                Nearby Attractions & Day Trips
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complementary sights and viewpoints to combine with your visit to {destination.name}.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destination.nearbyAttractions.map((attraction: any, idx: number) => (
                <Card
                  key={idx}
                  className="overflow-hidden border rounded-3xl shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between bg-card"
                >
                  <div>
                    <div className="relative h-44 w-full bg-muted overflow-hidden">
                      <Image
                        src={attraction.image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"}
                        alt={attraction.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <CardContent className="p-5 space-y-2">
                      <h3 className="font-bold text-base line-clamp-1">{attraction.name}</h3>
                      <span className="text-[11px] font-semibold text-primary block">
                        {attraction.distance}
                      </span>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {attraction.description}
                      </p>
                    </CardContent>
                  </div>

                  <div className="p-5 pt-0 border-t">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.mapQuery || `${attraction.name}, Nepal`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline pt-2"
                    >
                      <Navigation className="size-3.5" /> View on Map →
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
