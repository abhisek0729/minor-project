"use client";

import Link from "next/link";
import {
  Search,
  Sparkles,
  Hotel,
  Plane,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Tell Us Your Travel Plans",
    description:
      "Search destinations or simply describe your trip. Tell us your destination, budget, travel dates, and preferences.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Receive an AI Itinerary",
    description:
      "Our AI creates a personalized itinerary with recommended attractions, restaurants, hotels, transportation, and estimated costs.",
  },
  {
    number: "03",
    icon: Hotel,
    title: "Book & Explore",
    description:
      "Reserve hotels, discover nearby places, and organize your trip—all from one platform.",
  },
  {
    number: "04",
    icon: Plane,
    title: "Enjoy Your Journey",
    description:
      "Travel confidently with your itinerary, bookings, and recommendations available whenever you need them.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-muted/75 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Simple Process
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight lg:text-5xl">
            How It Works
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Plan your perfect trip in just a few simple steps with our
            AI-powered travel platform.
          </p>
        </div>

        {/* Steps */}

        <div className="relative mt-20 grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-2xl border bg-background p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Connecting Line */}

                {index < steps.length - 1 && (
                  <div className="absolute left-full top-16 hidden h-0.5 w-10 bg-border xl:block" />
                )}

                {/* Step Number */}

                <span className="text-sm font-bold text-primary">
                  {step.number}
                </span>

                {/* Icon */}

                <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>

                {/* Content */}

                <h3 className="mt-6 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-semibold">
            Ready to plan your next adventure?
          </h3>

          <p className="mt-3 text-muted-foreground">
            Let AI build your personalized itinerary in seconds.
          </p>

          <Link href="/ai-planner">
            <Button size="lg" className="mt-8">
              Start Planning

              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}