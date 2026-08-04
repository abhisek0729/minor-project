"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="overflow-hidden rounded-3xl border bg-linear-to-r from-primary to-primary/85 text-primary-foreground shadow-2xl">
          <div className="px-8 py-16 text-center md:px-16">
            {/* Badge */}

            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
              <Sparkles className="h-4 w-4" />
              AI-Powered Travel Platform
            </div>

            {/* Heading */}

            <h2 className="mx-auto mt-8 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              Ready to Plan Your Next Adventure?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/90">
              Discover destinations, generate personalized AI itineraries, book
              trusted hotels, and explore unforgettable experiences— all from
              one platform.
            </p>

            {/* Buttons */}

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="min-w-55">
                  Start Planning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/partner/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="
                        min-w-55
                        border-primary-foreground/20
                        bg-primary-foreground/10
                        text-primary-foreground
                        backdrop-blur
                        hover:bg-primary-foreground
                        hover:text-primary
                      "
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Become a Partner
                </Button>
              </Link>
            </div>

            {/* Small text */}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/80">
              <span>✓ AI Trip Planner</span>
              <span>✓ Verified Hotels</span>
              <span>✓ Secure Booking</span>
              <span>✓ Personalized Recommendations</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
