"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  MapPinned,
  Hotel,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface HeroProps{
  backgroundImage?: string
}

export default function Hero({
  backgroundImage = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000&auto=format&fit=crop"
}:HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}

      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Nepal Mountains"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Dark Overlay */}

        <div className="absolute inset-0 bg-black/45" />

        {/* Gradient Overlay */}

        <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/45 to-background" />
      </div>

      {/* Content */}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 pt-28 pb-24 lg:px-8 lg:pt-32">
        <div className="max-w-3xl text-white">
          {/* Badge */}

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/15 px-4 py-2 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-yellow-400" />

            <span className="text-sm font-medium">
              AI Powered Tourism Platform
            </span>
          </div>

          {/* Heading */}

          <h1
            className="
              text-5xl
              font-black
              leading-[1.05]
              tracking-tight
              md:text-6xl
              lg:text-7xl
              [text-shadow:0_3px_20px_rgb(0_0_0_/40%)]
            "
          >
            Discover Nepal
            <br />

            <span className="text-primary">
              Smarter.
            </span>

            <br />

            Travel Better.
          </h1>

          {/* Description */}

          <p
            className="
              mt-8
              max-w-2xl
              text-lg
              leading-8
              text-white/85
              [text-shadow:0_2px_10px_rgb(0_0_0/35%)]
            "
          >
            Plan personalized trips with an AI travel assistant, discover
            verified hotels and restaurants, connect with trusted local guides,
            and experience Nepal like never before.
          </p>

          {/* Buttons */}

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/destinations">
              <Button size="lg" className="gap-2">
                Explore Destinations

                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/sign-up">
              <Button
                size="lg"
                variant="secondary"
                className="border border-white/20 bg-background/90 text-foreground hover:bg-white"
              >
                Start Planning
              </Button>
            </Link>
          </div>

          {/* Stats */}

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/12 p-6 backdrop-blur-md transition duration-300 hover:bg-white/20">
              <MapPinned className="mb-4 h-6 w-6 text-primary" />

              <h3 className="text-2xl font-bold">
                100+
              </h3>

              <p className="mt-1 text-sm text-white/75">
                Destinations
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/12 p-6 backdrop-blur-md transition duration-300 hover:bg-white/20">
              <Hotel className="mb-4 h-6 w-6 text-primary" />

              <h3 className="text-2xl font-bold">
                500+
              </h3>

              <p className="mt-1 text-sm text-white/75">
                Verified Hotels
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/12 p-6 backdrop-blur-md transition duration-300 hover:bg-white/20">
              <Utensils className="mb-4 h-6 w-6 text-primary" />

              <h3 className="text-2xl font-bold">
                300+
              </h3>

              <p className="mt-1 text-sm text-white/75">
                Restaurants
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}