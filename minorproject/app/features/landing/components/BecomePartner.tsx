"use client";

import Link from "next/link";
import {
  ArrowRight,
  Hotel,
  Utensils,
  MapPinned,
  TrendingUp,
  BadgeCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const partners = [
  {
    icon: Hotel,
    title: "Hotel Owners",
    description:
      "Showcase your property, manage bookings, update room availability, and reach more travelers.",
  },
  {
    icon: Utensils,
    title: "Restaurant Owners",
    description:
      "Promote your restaurant, attract tourists, and highlight your local cuisine.",
  },
  {
    icon: MapPinned,
    title: "Local Guides",
    description:
      "Offer guided experiences, trekking services, and local tours to visitors worldwide.",
  },
];

const benefits = [
  "Reach thousands of travelers",
  "Increase bookings",
  "Manage your business from one dashboard",
  "Verified business profile",
];

export default function BecomePartner() {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="overflow-hidden rounded-3xl border bg-linear-to-br from-primary/10 via-background to-background">
          <div className="grid gap-16 p-10 lg:grid-cols-2 lg:p-16">
            {/* Left */}

            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Grow Your Business
              </span>

              <h2 className="mt-4 text-4xl font-bold tracking-tight lg:text-5xl">
                Become Our
                <br />
                Trusted Partner
              </h2>

              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Join Nepal's modern tourism ecosystem and connect with travelers
                searching for hotels, restaurants, local experiences, and
                trusted travel services.
              </p>

              <div className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3"
                  >
                    <BadgeCheck className="h-5 w-5 text-primary" />

                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/partner/register">
                  <Button size="lg">
                    Become a Partner

                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right */}

            <div className="space-y-6">
              {partners.map((partner) => {
                const Icon = partner.icon;

                return (
                  <div
                    key={partner.title}
                    className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-5">
                      <div className="rounded-xl bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold">
                          {partner.title}
                        </h3>

                        <p className="mt-3 leading-7 text-muted-foreground">
                          {partner.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Stats */}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-background p-6 text-center">
                  <Users className="mx-auto h-7 w-7 text-primary" />

                  <h3 className="mt-4 text-3xl font-bold">
                    10K+
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Monthly Visitors
                  </p>
                </div>

                <div className="rounded-2xl border bg-background p-6 text-center">
                  <TrendingUp className="mx-auto h-7 w-7 text-primary" />

                  <h3 className="mt-4 text-3xl font-bold">
                    95%
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Partner Satisfaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}