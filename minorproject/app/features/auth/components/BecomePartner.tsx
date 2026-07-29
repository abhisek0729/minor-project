"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Hotel,
  Utensils,
  MapPinned,
  Plane,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

import { setPartnerRole } from "@/app/features/auth/actions/partner-role";
import { UserRole } from "@/app/features/auth/types/register";

const partnerTypes = [
  {
    id: "hotelOwner",
    title: "Hotel Owner",
    description: "Manage rooms, bookings, pricing and availability.",
    icon: Hotel,
  },
  {
    id: "restaurantOwner",
    title: "Restaurant Owner",
    description: "Showcase your restaurant, menus and receive reservations.",
    icon: Utensils,
  },
  {
    id: "guide",
    title: "Local Guide",
    description: "Offer guided tours, trekking and unique local experiences.",
    icon: MapPinned,
  },
];

const benefits = [
  "Reach thousands of travelers",
  "Increase bookings and revenue",
  "Verified business profile",
  "Manage everything from one dashboard",
];

export default function BecomePartnerPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<string>();

  async function handleContinue() {
    if (!selectedRole) return;

    try {
      await setPartnerRole(selectedRole as UserRole);

      router.push(`/partner/register?role=${selectedRole}`);
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <section className="flex min-h-screen items-center bg-muted/20 py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-3 lg:px-5">
        <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="grid gap-10 p-6 lg:grid-cols-[1fr_1.1fr] lg:p-10">
            {/* Left */}

            <div className="flex flex-col justify-center">
              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                Partner Program
              </span>

              <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-4xl">
                Grow Your Business
                <br />
                with TravelNepal
              </h1>

              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Join Nepal's AI-powered tourism ecosystem and connect with
                thousands of travelers searching for hotels, restaurants, guides
                and travel services.
              </p>

              <div className="mt-10 space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <BadgeCheck className="h-5 w-5 text-primary" />

                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex gap-4">
                <Button
                  size="lg"
                  disabled={!selectedRole}
                  onClick={handleContinue}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button variant="outline" size="lg">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>

            {/* Right */}

            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-semibold">
                Choose Your Business Type
              </h2>

              <p className="mt-2 text-muted-foreground">
                Select the category that best describes your business.
              </p>

              <div className="mt-8 space-y-5">
                {partnerTypes.map((partner) => {
                  const Icon = partner.icon;

                  const selected = selectedRole === partner.id;

                  return (
                    <button
                      key={partner.id}
                      type="button"
                      onClick={() => setSelectedRole(partner.id)}
                      className={`group flex w-full items-center gap-5 rounded-2xl border p-6 text-left transition-all duration-300 ${
                        selected
                          ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                          : "bg-background hover:border-primary/40 hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                        }`}
                      >
                        <Icon className="size-7" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {partner.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {partner.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {selected ? (
                          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                            ✓ Selected
                          </span>
                        ) : (
                          <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
