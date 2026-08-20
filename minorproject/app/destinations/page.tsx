"use client";

import { useState } from "react";
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

const destinations = [
  {
    id: 1,
    name: "Chinde Danda & Dharan",
    region: "Sunsari (Eastern Nepal)",
    description: "Panoramic viewpoint above Dharan city famous for paragliding, scenic tea hills, Budha Subba Temple, and authentic local cuisine.",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
    rating: 4.9,
    reviews: 218,
    category: "Viewpoint & Adventure",
    activities: ["Paragliding", "Budha Subba", "Pork Sekuwa", "Sunset Views"],
    startingCost: "NPR 4,500",
    mapQuery: "Chinde Danda, Dharan, Nepal",
  },
  {
    id: 2,
    name: "Pokhara Valley & Phewa Lake",
    region: "Gandaki Province",
    description: "Lakeside paradise nestled beneath the Annapurna range with boating, World Peace Pagoda, and sunrise over Sarangkot.",
    image:
      "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1200&auto=format&fit=crop",
    rating: 5.0,
    reviews: 540,
    category: "Lakes & Mountains",
    activities: ["Boating", "Sarangkot Sunrise", "Peace Pagoda", "Paragliding"],
    startingCost: "NPR 6,500",
    mapQuery: "Phewa Lake, Pokhara, Nepal",
  },
  {
    id: 3,
    name: "Kathmandu & Patan Heritage",
    region: "Bagmati Province",
    description: "Ancient royal squares, living goddesses, centuries-old Buddhist stupas, and bustling artisan alleyways.",
    image:
      "https://images.unsplash.com/photo-1584632170055-7837c3dbe475?q=80&w=1200&auto=format&fit=crop",
    rating: 4.8,
    reviews: 630,
    category: "Culture & Heritage",
    activities: ["Boudhanath", "Patan Durbar", "Swayambhunath", "Newari Food"],
    startingCost: "NPR 3,500",
    mapQuery: "Patan Durbar Square, Nepal",
  },
  {
    id: 4,
    name: "Everest Base Camp & Namche",
    region: "Khumbu (Sagarmatha)",
    description: "World-renowned trekking trail through Sherpa villages, ancient gompas, and breathtaking Himalayan giants.",
    image:
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1200&auto=format&fit=crop",
    rating: 4.9,
    reviews: 380,
    category: "High Altitude Trek",
    activities: ["Himalayan Trek", "Namche Bazaar", "Tengboche Monastery", "Kala Patthar"],
    startingCost: "NPR 35,000",
    mapQuery: "Namche Bazaar, Nepal",
  },
  {
    id: 5,
    name: "Chitwan National Park",
    region: "Terai Lowlands",
    description: "Subtropical jungle safaris with one-horned rhinos, Bengal tigers, elephant breeding centers, and canoe rides.",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
    rating: 4.7,
    reviews: 290,
    category: "Wildlife & Safari",
    activities: ["Jeep Safari", "Canoe Ride", "Tharu Cultural Dance", "Bird Watching"],
    startingCost: "NPR 8,900",
    mapQuery: "Sauraha, Chitwan National Park, Nepal",
  },
  {
    id: 6,
    name: "Upper Mustang & Lo Manthang",
    region: "Trans-Himalayan Plateau",
    description: "The forbidden kingdom of walled mud cities, ancient sky caves, and Tibetan-Buddhist monasteries in red cliffs.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    rating: 4.9,
    reviews: 175,
    category: "Expedition & Culture",
    activities: ["Lo Manthang Tour", "Sky Caves", "Muktinath Temple", "Off-road Overland"],
    startingCost: "NPR 45,000",
    mapQuery: "Lo Manthang, Mustang, Nepal",
  },
  {
    id: 7,
    name: "Lumbini Sacred Gardens",
    region: "Rupandehi",
    description: "UNESCO World Heritage birthplace of Lord Buddha featuring international monasteries, Maya Devi Temple, and peace stupas.",
    image:
      "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?q=80&w=1200&auto=format&fit=crop",
    rating: 4.8,
    reviews: 210,
    category: "Spiritual & Pilgrimage",
    activities: ["Maya Devi Temple", "Monastery Walk", "Meditation Grounds", "Ashoka Pillar"],
    startingCost: "NPR 3,200",
    mapQuery: "Lumbini Sacred Garden, Nepal",
  },
  {
    id: 8,
    name: "Nagarkot Sunrise Ridge",
    region: "Bhaktapur",
    description: "Hilltop escape near Kathmandu offering sunrise views stretching across the Himalayas from Dhaulagiri to Kanchanjunga.",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
    rating: 4.8,
    reviews: 320,
    category: "Scenic Viewpoint",
    activities: ["Sunrise Tower", "Nature Hike", "Boutique Stays", "Panoramic Views"],
    startingCost: "NPR 4,200",
    mapQuery: "Nagarkot View Tower, Nepal",
  },
];

export default function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "Viewpoint & Adventure", "Lakes & Mountains", "Culture & Heritage", "Wildlife & Safari", "High Altitude Trek"];

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(search.toLowerCase()) ||
      dest.region.toLowerCase().includes(search.toLowerCase()) ||
      dest.description.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategory === "all" || dest.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header Section */}
        <section className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Mountain className="size-3.5" />
            Iconic Spots & Hidden Trails
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Explore Nepal Destinations
          </h1>

          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
            From majestic Himalayan viewpoints like Chinde Danda and Sarangkot to sacred heritage squares and lush subtropical jungles.
          </p>
        </section>

        {/* Search & Category Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search Dharan, Pokhara, Everest, Lumbini..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {cat === "all" ? "All Hotspots" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Destinations Grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((destination) => (
            <Card
              key={destination.id}
              className="group overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 w-full bg-muted overflow-hidden">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Rating */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                    {destination.rating.toFixed(1)}
                  </div>

                  {/* Category */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md text-[10px] font-semibold border-0">
                      {destination.category}
                    </Badge>
                  </div>

                  {/* Region Pill */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white text-xs font-medium flex items-center gap-1">
                      <MapPin className="size-3.5 text-primary" />
                      {destination.region}
                    </span>
                  </div>
                </div>

                <CardContent className="space-y-3 p-5">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {destination.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {destination.description}
                  </p>

                  {/* Activities Tags */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Highlights & Activities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {destination.activities.map((act) => (
                        <span
                          key={act}
                          className="rounded-lg border bg-muted/50 px-2 py-0.5 text-[11px] text-foreground font-medium"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0 border-t space-y-3">
                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="text-[10px] text-muted-foreground block leading-none">Estimated Budget</span>
                    <span className="text-base font-extrabold text-foreground">{destination.startingCost}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.mapQuery)}`}
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
                        detail: { message: `Plan me a trip for ${destination.name}` },
                      })
                    );
                  }}
                  className="w-full text-xs font-semibold gap-1.5 rounded-xl cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Sparkles className="size-3.5" /> Plan Trip with AI Assistant →
                </Button>
              </div>
            </Card>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
