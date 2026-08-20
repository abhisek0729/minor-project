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

const initialHotels = [
  {
    id: 1,
    name: "Lakeside Mountain Resort",
    description: "Boutique lakefront stay with private balconies, mountain views, and organic breakfast.",
    district: "Pokhara",
    province: "Gandaki",
    street: "Lakeside Marg-6",
    phoneNumber: "+977 61-462345",
    roomsCount: 12,
    startingPrice: 5200,
    category: "Lakeside Resorts",
    rating: 4.9,
    coverImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Everest Heights Lodge",
    description: "Cozy alpine lodge featuring traditional Himalayan stone architecture and panoramic vistas.",
    district: "Namche Bazaar",
    province: "Koshi",
    street: "Tenzing Norgay Trail",
    phoneNumber: "+977 38-540123",
    roomsCount: 8,
    startingPrice: 7800,
    category: "Himalayan Lodges",
    rating: 5.0,
    coverImage:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Heritage Courtyard Hotel",
    description: "Restored historic Newari architecture in the heart of old Patan with rooftop garden.",
    district: "Lalitpur",
    province: "Bagmati",
    street: "Patan Durbar Square Road",
    phoneNumber: "+977 1-5521980",
    roomsCount: 15,
    startingPrice: 6500,
    category: "Boutique Heritage",
    rating: 4.8,
    coverImage:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Chitwan Wildlife Villa & Spa",
    description: "Luxury eco-resort overlooking the Rapti River with direct jungle safari access.",
    district: "Chitwan",
    province: "Bagmati",
    street: "Sauraha Tourist Area",
    phoneNumber: "+977 56-580234",
    roomsCount: 10,
    startingPrice: 8900,
    category: "Eco Retreats",
    rating: 4.8,
    coverImage:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Nagarkot Sunrise Retreat",
    description: "Perched atop the ridge for breathtaking sunrise views stretching from Annapurna to Everest.",
    district: "Bhaktapur",
    province: "Bagmati",
    street: "Nagarkot View Tower Marg",
    phoneNumber: "+977 1-6680123",
    roomsCount: 6,
    startingPrice: 4800,
    category: "Himalayan Lodges",
    rating: 4.9,
    coverImage:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Dharan Horizon Boutique Hotel",
    description: "Modern comfortable stay in Eastern Nepal with easy access to Chinde Danda & Bhedetar.",
    district: "Dharan",
    province: "Koshi",
    street: "Bhanuchowk-5",
    phoneNumber: "+977 25-520890",
    roomsCount: 14,
    startingPrice: 3800,
    category: "Boutique Heritage",
    rating: 4.7,
    coverImage:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function HotelsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "Lakeside Resorts",
    "Himalayan Lodges",
    "Boutique Heritage",
    "Eco Retreats",
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
            Verified Accommodations & Stays
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Explore Hotels & Stays in Nepal
          </h1>

          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
            Discover boutique resorts, authentic Himalayan lodges, lakeside villas, and budget-friendly hotels across Nepal. Book directly with instant confirmation.
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
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedCategory("all"); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHotels.map((hotel, idx) => (
              <Card
                key={hotel.id}
                className="group overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full flex flex-col justify-between"
              >
                <div>
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
                        className="bg-black/60 text-white backdrop-blur-md text-xs border-0 font-medium flex items-center gap-1"
                      >
                        <MapPin className="size-3 text-primary" />
                        {hotel.district}, {hotel.province || "Nepal"}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                      {hotel.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                      {hotel.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <MapPin className="size-3.5 shrink-0 text-primary" />
                      <span className="line-clamp-1">{hotel.street || hotel.district}</span>
                    </div>

                    {hotel.phoneNumber && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                        <span>{hotel.phoneNumber}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>Instant Booking Confirmation</span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-6 pt-0 space-y-3">
                  <div className="flex items-baseline justify-between border-t pt-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground block leading-none">Starting from</span>
                      <span className="text-lg font-extrabold text-foreground">
                        NPR {hotel.startingPrice.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-normal"> / night</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {hotel.roomsCount > 0 ? `${hotel.roomsCount} Rooms Available` : "Available"}
                    </Badge>
                  </div>

                  <Link href="/dashboard" className="block">
                    <Button
                      size="sm"
                      className="w-full text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all gap-1.5"
                    >
                      Reserve / View Stay →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </section>
        )}

        {/* Partner Callout */}
        <section className="mt-16 rounded-3xl border bg-muted/30 p-8 sm:p-12 text-center space-y-4">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Building2 className="size-7" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold">Own a Hotel or Boutique Stay in Nepal?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join TravelNepal as a registered hotelier. Manage room categories, track guest bookings, and showcase your property to thousands of global and domestic travelers.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/partner/register?role=hotelOwner">
              <Button className="font-semibold gap-2">
                Register Your Hotel Property →
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
