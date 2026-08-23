"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Backpack,
  Briefcase,
  Hotel,
  MapPinned,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import AuthLayout from "@/app/features/auth/components/AuthLayout";
import AuthLogo from "@/app/features/auth/components/AuthLogo";
import AuthHeading from "@/app/features/auth/components/AuthHeading";
import AuthFooter from "@/app/features/auth/components/AuthFooter";

export default function ChooseAccountTypePage() {
  const router = useRouter();

  const [selected, setSelected] = useState<
    "tourist" | "partner" | null
  >(null);

  function handleContinue() {
    if (selected === "tourist") {
      router.push("/sign-up");
      return;
    }

    if (selected === "partner") {
      router.push("/partner/business-type");
    }
  }

  return (
    <AuthLayout showBackground={true}>
      <AuthLogo />

      <AuthHeading
        title="Create Your Account"
        description="Choose how you'd like to use TravelNepal."
      />

      <div className="mt-8 space-y-4">
        {/* Traveler */}

        <button
          type="button"
          onClick={() => setSelected("tourist")}
          className={`w-full rounded-2xl border p-5 text-left transition-all ${
            selected === "tourist"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "hover:border-primary/40 hover:shadow-sm"
          }`}
        >
          <div className="flex gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                selected === "tourist"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Backpack className="size-6" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold">
                Traveler
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Plan AI-powered trips, discover destinations,
                book hotels and restaurants, and explore Nepal.
              </p>
            </div>
          </div>
        </button>

        {/* Partner */}

        <button
          type="button"
          onClick={() => setSelected("partner")}
          className={`w-full rounded-2xl border p-5 text-left transition-all ${
            selected === "partner"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "hover:border-primary/40 hover:shadow-sm"
          }`}
        >
          <div className="flex gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                selected === "partner"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Briefcase className="size-6" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold">
                Become a Partner
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Register your tourism business and manage everything
                from your partner dashboard.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                  <Hotel className="size-3" />
                  Hotel
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                  <Utensils className="size-3" />
                  Restaurant
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                  <MapPinned className="size-3" />
                  Guide
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <Button
        className="mt-6 h-11 w-full"
        disabled={!selected}
        onClick={handleContinue}
      >
        Continue

        <ArrowRight className="ml-2 size-4" />
      </Button>

      <AuthFooter
        text="Already have an account?"
        linkText="Sign In"
        href="/sign-in"
      />
    </AuthLayout>
  );
}