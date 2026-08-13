"use client";

import {
  BrainCircuit,
  ShieldCheck,
  Hotel,
  MapPinned,
  Wallet,
  Clock3,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Personalized Planning",
    description:
      "Create travel itineraries tailored to your interests, budget, travel style, and duration in seconds.",
  },
  {
    icon: Hotel,
    title: "Verified Hotels",
    description:
      "Book trusted accommodations with authentic information, ratings, and amenities.",
  },
  {
    icon: MapPinned,
    title: "Discover Hidden Gems",
    description:
      "Explore local attractions, restaurants, and experiences beyond the usual tourist destinations.",
  },
  {
    icon: Wallet,
    title: "Budget Estimation",
    description:
      "Know your expected expenses before you travel, including hotels, food, transportation, and activities.",
  },
  {
    icon: Clock3,
    title: "Save Hours of Planning",
    description:
      "Skip researching multiple websites and get a complete travel plan in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable Information",
    description:
      "Access accurate destination details, verified listings, and trusted recommendations.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-muted/75 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Why Travelers Choose Us
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight lg:text-5xl">
            Everything You Need
            <br />
            For Your Next Adventure
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            From AI-powered itinerary generation to verified hotels,
            restaurants, and local recommendations,
            our platform simplifies every step of your journey.
          </p>
        </div>

        {/* Feature Grid */}

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border bg-background p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Stats */}

        <div className="mt-20 grid gap-8 rounded-3xl border bg-background p-10 md:grid-cols-4">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-primary">100+</h3>
            <p className="mt-2 text-muted-foreground">
              Destinations
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-4xl font-bold text-primary">500+</h3>
            <p className="mt-2 text-muted-foreground">
              Hotels
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-4xl font-bold text-primary">300+</h3>
            <p className="mt-2 text-muted-foreground">
              Restaurants
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-4xl font-bold text-primary">24/7</h3>
            <p className="mt-2 text-muted-foreground">
              AI Assistance
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}