"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Award,
  Calendar,
  CheckCircle2,
  Compass,
  Globe,
  Languages,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
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

const initialGuides = [
  {
    id: 1,
    name: "Aarav Sharma",
    description: "Specialized in Kathmandu Valley heritage, sacred courtyards, ancient Newari architecture, and folklore.",
    location: "Kathmandu & Patan",
    experienceYears: 7,
    languages: "Nepali, English, Hindi",
    dailyRate: 3200,
    licenseNumber: "NTA-GUIDE-4812",
    specialty: "Heritage & Culture",
    packagesCount: 3,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Bikram Rai",
    description: "High-altitude mountain guide certified in Annapurna Circuit, Mardi Himal, and Poon Hill trekking trails.",
    location: "Pokhara & Annapurna",
    experienceYears: 10,
    languages: "Nepali, English, Gurung",
    dailyRate: 4600,
    licenseNumber: "NTA-TREK-1092",
    specialty: "High Altitude Trekking",
    packagesCount: 4,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Sunita Tamang",
    description: "Eco-tourism and wildlife naturalist leading jeep safaris, bird-watching, and cultural homestay tours.",
    location: "Chitwan & Sauraha",
    experienceYears: 6,
    languages: "Nepali, English, Tharu",
    dailyRate: 3800,
    licenseNumber: "NTA-WILD-3301",
    specialty: "Wildlife Safari",
    packagesCount: 2,
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Pemba Sherpa",
    description: "Everest region veteran with decades of high-pass navigation, Sagarmatha expeditions, and alpine safety.",
    location: "Namche & Khumbu",
    experienceYears: 14,
    languages: "Nepali, English, Tibetan",
    dailyRate: 5500,
    licenseNumber: "NTA-EXP-8890",
    specialty: "High Altitude Trekking",
    packagesCount: 5,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Rajesh Shrestha",
    description: "Spiritual tour leader and historian covering Lumbini sacred gardens, Kapilvastu, and Buddhist pilgrimage sites.",
    location: "Lumbini & Kapilvastu",
    experienceYears: 8,
    languages: "Nepali, English, Japanese",
    dailyRate: 3500,
    licenseNumber: "NTA-GUIDE-5120",
    specialty: "Heritage & Culture",
    packagesCount: 2,
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Pooja Gurung",
    description: "Adventure and paragliding enthusiast guiding Chinde Danda, Bhedetar, and scenic trails of Eastern Nepal.",
    location: "Dharan & Bhedetar",
    experienceYears: 5,
    languages: "Nepali, English",
    dailyRate: 3000,
    licenseNumber: "NTA-EAST-2104",
    specialty: "Adventure & Paragliding",
    packagesCount: 2,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function GuidesPage() {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const specialties = [
    "all",
    "High Altitude Trekking",
    "Heritage & Culture",
    "Wildlife Safari",
    "Adventure & Paragliding",
  ];

  const filteredGuides = initialGuides.filter((guide) => {
    const matchesSearch =
      guide.name.toLowerCase().includes(search.toLowerCase()) ||
      guide.location.toLowerCase().includes(search.toLowerCase()) ||
      guide.languages.toLowerCase().includes(search.toLowerCase()) ||
      guide.description.toLowerCase().includes(search.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === "all" || guide.specialty === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header Section */}
        <section className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Compass className="size-3.5" />
            Certified & Verified Tour Guides
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Explore Local Tour Guides in Nepal
          </h1>

          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
            Connect with verified local storytellers, mountain trekking experts, and wildlife naturalists. Get authentic experiences, customized itineraries, and safe travel assistance.
          </p>
        </section>

        {/* Search & Specialty Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by guide name, location, Pokhara, Everest, language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Specialty Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {specialties.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSpecialty(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedSpecialty === s
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {s === "all" ? "All Certified Guides" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Guides Grid */}
        {filteredGuides.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-muted/20 p-12 text-center space-y-3">
            <p className="text-lg font-bold text-foreground">No matching tour guides found</p>
            <p className="text-xs text-muted-foreground">Try searching by language or switching specialties.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedSpecialty("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGuides.map((guide, idx) => (
              <Card
                key={guide.id}
                className="group overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full flex flex-col justify-between"
              >
                <Link href={`/guides/${guide.id}`} className="block flex-1">
                  {/* Guide Photo & License Tag */}
                  <div className="relative h-60 w-full bg-muted overflow-hidden">
                    <Image
                      src={guide.image}
                      alt={guide.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Certified Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 text-white px-2.5 py-1 text-xs font-semibold backdrop-blur-md shadow-xs">
                      <ShieldCheck className="size-3.5" />
                      Verified
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                      5.0
                    </div>

                    {/* Specialty Badge */}
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md text-[10px] font-semibold border-0">
                        {guide.specialty}
                      </Badge>
                    </div>

                    {/* Location Pill */}
                    <div className="absolute bottom-3 left-3">
                      <Badge
                        variant="secondary"
                        className="bg-black/60 text-white backdrop-blur-md text-xs border-0 font-medium flex items-center gap-1"
                      >
                        <MapPin className="size-3 text-primary" />
                        {guide.location}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                        {guide.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground border-border shrink-0">
                        {guide.experienceYears}+ Yrs Exp
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 text-xs leading-relaxed mt-1">
                      {guide.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2.5 text-xs text-muted-foreground pt-1">
                    {/* Languages */}
                    <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <Languages className="size-3.5 shrink-0 text-primary" />
                      <span className="line-clamp-1">{guide.languages}</span>
                    </div>

                    {/* License */}
                    {guide.licenseNumber && (
                      <div className="flex items-center gap-1.5">
                        <Award className="size-3.5 shrink-0 text-muted-foreground" />
                        <span>Lic: {guide.licenseNumber}</span>
                      </div>
                    )}

                    {/* Tour Packages Count */}
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                      <Compass className="size-3.5 shrink-0" />
                      <span>{guide.packagesCount} Curated Tour Packages Available</span>
                    </div>
                  </CardContent>
                </Link>

                <div className="p-6 pt-0 space-y-3">
                  <div className="flex items-baseline justify-between border-t pt-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground block leading-none">Daily Guide Rate</span>
                      <span className="text-lg font-extrabold text-foreground">
                        NPR {guide.dailyRate.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-normal"> / day</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Available
                    </Badge>
                  </div>

                  <Link href={`/guides/${guide.id}`} className="block">
                    <Button
                      size="sm"
                      className="w-full text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all gap-1.5 cursor-pointer"
                    >
                      View Profile & Packages →
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
            <Users className="size-7" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold">Are you a Licensed Tour Guide in Nepal?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join the TravelNepal verified guide community. Publish your custom trekking packages, set your daily tour rates, manage booking requests, and guide travelers from around the world.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/partner/register?role=guide">
              <Button className="font-semibold gap-2">
                Register as a Tour Guide →
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
