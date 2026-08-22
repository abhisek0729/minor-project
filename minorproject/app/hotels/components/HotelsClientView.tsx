"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BedDouble,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Hotel,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Star,
  Users,
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

export interface HotelListing {
  id: number;
  name: string;
  description: string;
  district: string;
  province: string;
  street: string;
  phoneNumber: string;
  roomsCount: number;
  startingPrice: number;
  category: string;
  rating: number;
  coverImage: string;
}

interface HotelsClientViewProps {
  initialHotels: HotelListing[];
}

export default function HotelsClientView({ initialHotels }: HotelsClientViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "Lakeside Resorts",
    "Himalayan Lodges",
    "Boutique Heritage",
    "Eco Retreats",
    "City Hotels",
  ];

  const filteredHotels = initialHotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(search.toLowerCase()) ||
      hotel.district.toLowerCase().includes(search.toLowerCase()) ||
      hotel.street.toLowerCase().includes(search.toLowerCase()) ||
      hotel.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || hotel.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header Section */}
        <section className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Hotel className="size-3.5" />
            Verified Accommodations ({initialHotels.length} Stays Listed)
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Explore Hotels & Stays in Nepal
          </h1>

          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
            Discover boutique resorts, authentic Himalayan lodges, lakeside villas, and budget-friendly hotels across Nepal. Book directly with instant Khalti confirmation.
          </p>
        </section>

        {/* Search & Category Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by hotel name, Pokhara, Dharan, Kathmandu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Showing {filteredHotels.length} of {initialHotels.length} accommodations
            </p>
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
                {cat === "all" ? "All Hotels & Stays" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Hotels Grid */}
        {filteredHotels.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-muted/20 p-12 text-center space-y-3">
            <p className="text-lg font-bold text-foreground">No matching hotels found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search query or switching categories.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHotels.map((hotel) => (
              <Card
                key={hotel.id}
                className="group overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full flex flex-col justify-between"
              >
                <Link href={`/hotels/${hotel.id}`} className="block flex-1">
                  {/* Cover Image & Rating Badge */}
                  <div className="relative h-56 w-full bg-muted overflow-hidden">
                    <Image
                      src={hotel.coverImage}
                      alt={hotel.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Rating Tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                      {hotel.rating}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md text-[10px] font-semibold border-0">
                        {hotel.category}
                      </Badge>
                    </div>

                    {/* District Badge */}
                    <div className="absolute bottom-3 left-3">
                      <Badge
                        variant="secondary"
                        className="bg-black/60 text-white backdrop-blur-md text-[11px] font-medium border-0 flex items-center gap-1"
                      >
                        <MapPin className="size-3 text-red-400" />
                        {hotel.district}, {hotel.province}
                      </Badge>
                    </div>
                  </div>

                  {/* Body Content */}
                  <CardHeader className="space-y-1.5 pb-2">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                      {hotel.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {hotel.description}
                    </CardDescription>
                  </CardHeader>
                </Link>

                {/* Footer Section with Price & Action Button */}
                <CardContent className="pt-2 border-t mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                        Starts From
                      </span>
                      <span className="text-sm font-extrabold text-foreground">
                        NPR {hotel.startingPrice.toLocaleString()}
                        <span className="text-[11px] font-normal text-muted-foreground"> / night</span>
                      </span>
                    </div>

                    <Link href={`/hotels/${hotel.id}`}>
                      <Button size="sm" className="font-semibold text-xs gap-1.5 rounded-xl">
                        View & Book <ExternalLink className="size-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
