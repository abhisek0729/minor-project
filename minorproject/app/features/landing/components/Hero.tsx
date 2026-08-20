"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  MapPin,
  Sparkles,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface HeroProps {
  backgroundImage?: string;
}

export default function Hero({
  backgroundImage = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000&auto=format&fit=crop",
}: HeroProps) {
  return (
    <section className="relative min-h-[420px] overflow-hidden bg-background md:min-h-[480px]">
      <div className="absolute inset-0 h-full w-full">
        <Image
          src={backgroundImage}
          alt="Nepal Mountains"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-background" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[420px] max-w-7xl items-end px-4 pb-6 pt-20 md:min-h-[480px] md:pb-8 md:pt-24 lg:px-8">
        <div className="w-full max-w-3xl text-white">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-medium text-white/90 md:text-xs">
              AI-powered travel planning
            </span>
          </div>

          <h1 className="text-[2.1rem] font-black leading-[1.02] tracking-[-0.05em] text-white md:text-4xl lg:text-[3.3rem] [text-shadow:0_8px_25px_rgba(0,0,0,0.25)]">
            Discover your
            <span className="block text-primary/90">next unforgettable</span>
            trip in Nepal.
          </h1>

          <p className="mt-3 max-w-xl text-xs leading-5 text-white/85 md:text-sm md:leading-6">
            Explore handpicked hotels, food spots, destinations, local guides,
            smart travel routes, and trip expense tracking in one seamless flow.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/destinations">
              <Button
                size="lg"
                className="h-9 gap-2 rounded-full bg-primary px-4 text-xs text-primary-foreground hover:bg-primary/90 md:h-10 md:px-5 md:text-sm"
              >
                Explore stays
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/ai-planner">
              <Button
                size="lg"
                variant="secondary"
                className="h-9 rounded-full border border-white/20 bg-white/10 px-4 text-xs text-white hover:bg-white/15 md:h-10 md:px-5 md:text-sm"
              >
                Plan with AI
              </Button>
            </Link>
          </div>

          <div className="mt-5 grid max-w-xl gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md">
              <MapPin className="mb-2 h-3.5 w-3.5 text-primary" />
              <p className="text-lg font-bold text-white md:text-xl">100+</p>
              <p className="text-[10px] text-white/75 md:text-xs">
                destinations
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md">
              <BedDouble className="mb-2 h-3.5 w-3.5 text-primary" />
              <p className="text-lg font-bold text-white md:text-xl">500+</p>
              <p className="text-[10px] text-white/75 md:text-xs">stays</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md">
              <Utensils className="mb-2 h-3.5 w-3.5 text-primary" />
              <p className="text-lg font-bold text-white md:text-xl">300+</p>
              <p className="text-[10px] text-white/75 md:text-xs">food spots</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
