import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Compass,
  Languages,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";

import Navbar from "@/app/features/landing/components/Navbar";
import Footer from "@/app/features/landing/components/Footer";
import { db } from "@/app/lib/db";
import { guidesTable, userRolesTable, usersTable } from "@/app/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { desc, eq } from "drizzle-orm";

export default async function GuidesExplorePage() {
  const guides = await db
    .select({
      id: guidesTable.id,
      name: guidesTable.name,
      description: guidesTable.description,
      location: guidesTable.location,
      phoneNumber: guidesTable.phoneNumber,
      experienceYears: guidesTable.experienceYears,
      languages: guidesTable.languages,
      dailyRate: guidesTable.dailyRate,
      isAvailable: guidesTable.isAvailable,
      licenseNumber: guidesTable.licenseNumber,
    })
    .from(guidesTable)
    .orderBy(desc(guidesTable.id));

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header Section */}
        <section className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Compass className="size-3.5" />
            Certified Mountain & Cultural Guides
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Explore Local Tour Guides in Nepal
          </h1>

          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
            Hire licensed Sherpa trekking guides, Kathmandu heritage historians, and expert wilderness leaders across the Himalayas.
          </p>
        </section>

        {/* Guides Grid */}
        {guides.length === 0 ? (
          <Card className="mt-8 border-dashed bg-muted/20 p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto mb-4">
              <Compass className="size-8" />
            </div>
            <CardTitle className="text-xl">No tour guides listed yet</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2">
              Are you a licensed guide in Nepal? Register your services to connect with travelers worldwide.
            </CardDescription>
            <div className="mt-6">
              <Link href="/partner/register?role=guide">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Become a Certified Guide
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Card
                key={guide.id}
                className="overflow-hidden border hover:border-emerald-500/50 transition-all duration-300 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-emerald-600" />
                        <span>{guide.location}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-emerald-500/10 text-emerald-600 font-bold"
                      >
                        NPR {guide.dailyRate?.toLocaleString()} / day
                      </Badge>
                    </div>

                    <CardTitle className="text-xl font-bold line-clamp-1">
                      {guide.name}
                    </CardTitle>

                    {guide.licenseNumber && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="size-3.5 text-emerald-600" /> License: {guide.licenseNumber}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-2.5 text-xs text-muted-foreground pt-0">
                    <p className="line-clamp-2 leading-relaxed text-foreground/90">
                      "{guide.description}"
                    </p>

                    <div className="space-y-1.5 pt-2 border-t text-[11px]">
                      <div className="flex items-center justify-between">
                        <span>Experience:</span>
                        <span className="font-semibold text-foreground">{guide.experienceYears} Years</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><Languages className="size-3" /> Languages:</span>
                        <span className="font-medium text-foreground">{guide.languages}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 border-t mt-4">
                  <Link href={`/partner/register?role=guide`} className="block w-full">
                    <Button
                      variant="outline"
                      className="w-full text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-all gap-1.5"
                    >
                      Book Tour Guide →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
