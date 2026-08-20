"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Hotel,
  Utensils,
  MapPinned,
  BadgeCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import { setPartnerRole, addPartnerRoleAction } from "@/app/features/auth/actions/partner-role";
import { UserRole } from "@/app/features/auth/types/register";

interface PartnerTypeItem {
  id: UserRole;
  title: string;
  description: string;
  icon: any;
}

const partnerTypes: PartnerTypeItem[] = [
  {
    id: "hotelOwner",
    title: "Hotel Owner",
    description: "Manage rooms, bookings, pricing and guest availability.",
    icon: Hotel,
  },
  {
    id: "restaurantOwner",
    title: "Restaurant Owner",
    description: "Showcase your restaurant, menus and receive live reservations.",
    icon: Utensils,
  },
  {
    id: "guide",
    title: "Tour Guide",
    description: "Offer guided treks, tours and unique local travel experiences.",
    icon: MapPinned,
  },
];

const benefits = [
  "Reach thousands of active travelers",
  "Instant bookings and verified revenue",
  "Verified business partner badge",
  "Full management control in unified dashboard",
];

export default function BecomePartnerPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  // Filter out roles the user already requested (pending or approved)
  const userRoles = session?.user?.roles ?? [];
  const existingRoleNames = new Set(userRoles.map((r) => r.name));

  const availablePartnerTypes = partnerTypes.filter(
    (partner) => !existingRoleNames.has(partner.id)
  );

  async function handleSelectRole(roleId: UserRole) {
    if (loadingRole) return;

    try {
      setLoadingRole(roleId);

      // If user is logged in, directly assign role and take them to workspace / onboarding
      if (session?.user?.id) {
        const res = await addPartnerRoleAction(roleId);
        if (res.success) {
          toast.success(res.message || `Registered as ${roleId}`);
          router.push("/dashboard");
          return;
        } else {
          toast.error(res.message || "Failed to register workspace");
        }
      } else {
        // If not logged in, set partner role cookie and redirect to signup
        await setPartnerRole(roleId as UserRole);
        router.push(`/partner/register?role=${roleId}`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <section className="flex min-h-screen items-center bg-muted/20 py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-3 lg:px-5 w-full">
        <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="grid gap-10 p-6 lg:grid-cols-[1fr_1.1fr] lg:p-10">
            {/* Left Column: Info & Benefits */}
            <div className="flex flex-col justify-center">
              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                Partner Program
              </span>

              <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-4xl">
                Grow Your Business
                <br />
                with TravelNepal
              </h1>

              <p className="mt-6 text-base lg:text-lg leading-relaxed text-muted-foreground">
                Join Nepal's digital tourism ecosystem and connect with thousands
                of travelers searching for hotels, restaurants, and guided treks.
              </p>

              <div className="mt-8 space-y-3.5">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3 text-sm font-medium">
                    <BadgeCheck className="size-5 text-primary shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Business Type Cards (1-Click selection) */}
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-semibold">
                Choose Your Business Type
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Click a category below to immediately register and setup your workspace.
              </p>

              {availablePartnerTypes.length === 0 ? (
                <Card className="mt-8 border-dashed bg-muted/15 p-8 text-center space-y-3">
                  <div className="size-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="font-bold text-lg">All Business Workspaces Registered</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    You have already registered and linked all available partner business workspaces (Hotel, Restaurant, Tour Guide) to your account.
                  </p>
                </Card>
              ) : (
                <div className="mt-8 space-y-4">
                  {availablePartnerTypes.map((partner) => {
                    const Icon = partner.icon;
                    const isCardLoading = loadingRole === partner.id;

                    return (
                      <button
                        key={partner.id}
                        type="button"
                        disabled={!!loadingRole}
                        onClick={() => handleSelectRole(partner.id)}
                        className={`group flex w-full items-center gap-5 rounded-2xl border p-5 sm:p-6 text-left transition-all duration-200 cursor-pointer bg-background hover:border-primary/60 hover:shadow-md hover:bg-primary/5 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <div
                          className={`flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground`}
                        >
                          {isCardLoading ? (
                            <Loader2 className="size-6 animate-spin" />
                          ) : (
                            <Icon className="size-7" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors">
                              {partner.title}
                            </h3>
                          </div>

                          <p className="mt-1 text-xs sm:text-sm leading-snug text-muted-foreground">
                            {partner.description}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {isCardLoading ? (
                            <span className="text-xs font-semibold text-primary flex items-center gap-1">
                              Processing...
                            </span>
                          ) : (
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
