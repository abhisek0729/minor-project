import Link from "next/link";
import Image from "next/image";
import {
  Award,
  Bot,
  Building2,
  CheckCircle2,
  Compass,
  CreditCard,
  Globe2,
  HeartHandshake,
  Hotel,
  MapPin,
  Mountain,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import Navbar from "@/app/features/landing/components/Navbar";
import Footer from "@/app/features/landing/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const pillars = [
    {
      icon: Hotel,
      title: "Verified Hotels & Stays",
      description: "Direct reservations with verified hotel owners across Nepal with transparent room amenities and pricing.",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: UtensilsCrossed,
      title: "Authentic Local Dining",
      description: "Explore traditional kitchens, local Newari and Himalayan menus, opening hours, and signature specialties.",
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      icon: Compass,
      title: "Licensed Tour Guides",
      description: "Certified mountain guides, cultural specialists, and nature experts providing tailored trekking packages.",
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      icon: Bot,
      title: "Intelligent AI Travel Agent",
      description: "Autonomous multi-step trip planning, contextual memory layer, live Google Maps cards, and automated form execution.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: ReceiptText,
      title: "Real-Time Expense Tracker",
      description: "Seamlessly log daily travel spending, categorize stay vs food vs transit, and maintain personal travel ledgers.",
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      icon: ShieldCheck,
      title: "Partner Workspaces",
      description: "Dedicated dashboard workspaces for hoteliers, restaurateurs, tour guides, and administrators to manage operations.",
      color: "bg-rose-500/10 text-rose-600",
    },
  ];

  const stats = [
    { value: "50+", label: "Top Himalayan Destinations" },
    { value: "100%", label: "Verified Partner Listings" },
    { value: "24/7", label: "Autonomous AI Trip Assistant" },
    { value: "0ms", label: "Zero-Latency Fast Dashboard" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 w-full flex-1 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="size-3.5" />
            Reimagining Tourism in Nepal
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Empowering Travelers & Local Businesses Across Nepal
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            TravelNepal is a modern, unified tourism ecosystem bringing together hotel owners, local restaurants, certified tour guides, and adventurous travelers with next-generation AI intelligence.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <Card key={idx} className="p-6 text-center border bg-card/60 backdrop-blur-xs">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">{s.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">{s.label}</p>
            </Card>
          ))}
        </section>

        {/* Platform Pillars */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Everything You Need for Nepal Travel
            </h2>
            <p className="text-sm text-muted-foreground">
              Built from the ground up to provide seamless booking, intelligent travel memory, and empowered local business operations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <Card key={idx} className="p-6 border hover:border-primary/40 transition-all shadow-2xs space-y-3">
                  <div className={`size-12 rounded-2xl ${p.color} flex items-center justify-center`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Partner Ecosystem CTA */}
        <section className="rounded-3xl border bg-gradient-to-br from-primary/10 via-muted/40 to-background p-8 sm:p-14 text-center space-y-6">
          <div className="size-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-md">
            <HeartHandshake className="size-8" />
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Become a Tourism Partner</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Whether you manage a boutique mountain lodge, run a local restaurant, or lead high-altitude Himalayan treks, our platform provides you with dedicated management workspaces and instant guest exposure.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/partner/business-type">
              <Button size="lg" className="font-semibold gap-2 rounded-xl">
                Register Your Business →
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="font-semibold rounded-xl">
                Explore Dashboard Workspace
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
