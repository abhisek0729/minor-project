import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Globe,
  Languages,
  MapPin,
  Mountain,
  Package,
  Phone,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import Navbar from "@/app/features/landing/components/Navbar";
import Footer from "@/app/features/landing/components/Footer";
import { db } from "@/app/lib/db";
import { guidesTable, packagesTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GuideBookingModal from "./components/GuideBookingModal";

interface GuideDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

import { guidesMap } from "../guidesData";

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { id } = await params;
  const guideId = parseInt(id, 10);

  if (isNaN(guideId)) {
    notFound();
  }

  const fallbackGuide = guidesMap[guideId] || guidesMap[1];
  let guide = fallbackGuide;

  try {
    const [dbGuide] = await db.select().from(guidesTable).where(eq(guidesTable.id, guideId));
    if (dbGuide) {
      const dbPackages = await db.select().from(packagesTable).where(eq(packagesTable.guideId, guideId));
      guide = {
        ...fallbackGuide,
        ...dbGuide,
        name: dbGuide.name || fallbackGuide?.name,
        specialty: fallbackGuide?.specialty || "Certified Guide",
        image: dbGuide.guideImageUrl || fallbackGuide?.image,
        packages: dbPackages.length > 0 ? dbPackages.map(p => ({
          id: p.id,
          title: p.title,
          duration: `${p.durationDays} Day/s`,
          price: p.price,
          description: p.description,
        })) : fallbackGuide?.packages || [],
      };
    }
  } catch (error) {
    console.error("Failed to query guide detail:", error);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8 w-full flex-1 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to All Tour Guides</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden border bg-card shadow-sm">
          <div className="grid md:grid-cols-12">
            {/* Guide Photo */}
            <div className="relative h-72 md:h-full md:col-span-4 min-h-[280px] bg-muted">
              <Image
                src={guide.image}
                alt={guide.name}
                fill
                className="object-cover object-top"
                unoptimized
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
            </div>

            {/* Guide Info */}
            <div className="p-6 sm:p-8 md:col-span-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <ShieldCheck className="size-3.5" /> Certified Guide
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {guide.experienceYears}+ Years Experience
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-xs">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span>5.0 (Verified Rating)</span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {guide.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <MapPin className="size-4 text-primary shrink-0" />
                    <span>{guide.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Languages className="size-4 text-primary shrink-0" />
                    <span>{guide.languages}</span>
                  </div>

                  {guide.licenseNumber && (
                    <div className="flex items-center gap-1.5">
                      <Award className="size-4 text-muted-foreground shrink-0" />
                      <span>Lic: {guide.licenseNumber}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed pt-2">
                  {guide.description}
                </p>
              </div>

              <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-muted-foreground block leading-none">Daily Guide Rate</span>
                  <span className="text-2xl font-extrabold text-foreground">
                    NPR {(guide.dailyRate || 3000).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground font-normal"> / day</span>
                </div>

                <GuideBookingModal
                  guideId={guide.id}
                  guideName={guide.name}
                  dailyRate={guide.dailyRate || 3000}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Curated Trekking & Tour Packages */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Compass className="size-6 text-primary" /> Curated Tour & Trekking Packages
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Handcrafted itineraries guided directly by {guide.name}.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {guide.packages.map((pkg: any) => (
              <Card key={pkg.id} className="p-6 border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-foreground">{pkg.title}</h3>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {pkg.duration}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block leading-none">Package Price</span>
                    <span className="text-xl font-extrabold text-foreground">
                      NPR {pkg.price.toLocaleString()}
                    </span>
                  </div>

                  <GuideBookingModal
                    guideId={guide.id}
                    guideName={guide.name}
                    dailyRate={pkg.price}
                    packageTitle={pkg.title}
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
