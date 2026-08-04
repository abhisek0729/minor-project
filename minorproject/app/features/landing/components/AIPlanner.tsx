"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Sparkles,
  Clock3,
  Wallet,
  MapPinned,
  Route,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const prompts = [
  "3-day trip to Pokhara",
  "Budget trek under NPR 25,000",
  "Family vacation in Nepal",
  "Luxury honeymoon itinerary",
];

const features = [
  {
    icon: Route,
    title: "Smart Itinerary",
    description:
      "Generate personalized day-by-day travel plans based on your interests.",
  },
  {
    icon: Wallet,
    title: "Budget Estimation",
    description:
      "Estimate accommodation, food, transportation and activity costs.",
  },
  {
    icon: Clock3,
    title: "Save Time",
    description:
      "Skip hours of planning and receive an itinerary within seconds.",
  },
  {
    icon: MapPinned,
    title: "Local Recommendations",
    description:
      "Discover hidden gems, restaurants and attractions loved by locals.",
  },
];

export default function AIPlanner() {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">

        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

          {/* Left */}

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                AI Powered Travel Assistant
              </span>
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-tight lg:text-5xl">
              Plan Your Entire Trip
              <br />
              with AI Agent
            </h2>

            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Tell our AI where you want to go, your budget,
              travel style and number of days.
              It will instantly build a complete itinerary,
              recommend hotels, restaurants,
              attractions and estimate your expenses.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/ai-planner">
                <Button size="lg">
                  Start Planning

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/destinations">
                <Button
                  size="lg"
                  variant="outline"
                >
                  Explore Destinations
                </Button>
              </Link>
            </div>

          </div>

          {/* Right */}

          <div className="rounded-3xl border bg-card p-8 shadow-xl">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary p-3 text-primary-foreground">
                <Bot className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-xl font-semibold">
                  AI Trip Planner
                </h3>

                <p className="text-sm text-muted-foreground">
                  Ask anything...
                </p>
              </div>
            </div>

            {/* Fake Chat */}

            <div className="mt-8 space-y-4">

              <div className="rounded-xl bg-muted p-4">
                Plan a 5-day trip to Nepal under NPR 40,000.
              </div>

              <div className="rounded-xl border bg-background p-4">
                Sure! Here's a personalized itinerary including:

                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>✅ Hotels within your budget</li>
                  <li>✅ Tourist attractions</li>
                  <li>✅ Local restaurants</li>
                  <li>✅ Transportation guide</li>
                  <li>✅ Estimated total cost</li>
                </ul>
              </div>

            </div>

            {/* Example Prompts */}

            <div className="mt-8">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                Try asking
              </p>

              <div className="flex flex-wrap gap-3">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="rounded-full border px-4 py-2 text-sm transition hover:bg-primary hover:text-primary-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Features */}

        <div className="mt-24 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border bg-card p-6 transition hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}