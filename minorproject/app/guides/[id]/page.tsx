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

const mockGuides: Record<number, any> = {
  1: {
    id: 1,
    name: "Aarav Sharma",
    description: "Specialized in Kathmandu Valley heritage, sacred courtyards, ancient Newari architecture, and folklore with over 7 years of professional storytelling experience.",
    location: "Kathmandu & Patan",
    experienceYears: 7,
    languages: "Nepali, English, Hindi",
    dailyRate: 3200,
    licenseNumber: "NTA-GUIDE-4812",
    specialty: "Heritage & Cultural Walking Tours",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
    packages: [
      { id: 11, title: "Patan & Bhaktapur Ancient Courtyards", duration: "1 Day", price: 3500, description: "Deep cultural walking tour visiting medieval palaces, woodcarving ateliers, and living goddess courtyards." },
      { id: 12, title: "Sacred Temples & Monasteries of Valley", duration: "2 Days", price: 6800, description: "Boudhanath, Swayambhunath, Pashupatinath, and Kopan Monastery spiritual walk." },
    ],
  },
  2: {
    id: 2,
    name: "Bikram Rai",
    description: "Certified mountain trekking leader with 10 years of experience navigating Annapurna Circuit, Mardi Himal, Poon Hill, and Dhaulagiri high alpine trails.",
    location: "Pokhara & Annapurna",
    experienceYears: 10,
    languages: "Nepali, English, Gurung",
    dailyRate: 4600,
    licenseNumber: "NTA-TREK-1092",
    specialty: "High Altitude Alpine Trekking",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
    packages: [
      { id: 21, title: "Poon Hill Sunrise Himalayan Trek", duration: "3 Days", price: 12500, description: "Famous rhododendron forest trail with 360-degree panoramic sunrise over Annapurna and Dhaulagiri." },
      { id: 22, title: "Mardi Himal High Camp Expedition", duration: "5 Days", price: 21000, description: "Ridge-line trek taking you right under the sacred Machapuchare (Fishtail) peak." },
    ],
  },
  3: {
    id: 3,
    name: "Sunita Tamang",
    description: "Subtropical jungle and eco-tourism naturalist guiding wildlife safaris, bird-watching walks, and Tharu community homestays in Chitwan National Park.",
    location: "Chitwan & Sauraha",
    experienceYears: 6,
    languages: "Nepali, English, Tharu",
    dailyRate: 3800,
    licenseNumber: "NTA-WILD-3301",
    specialty: "Wildlife Safari & Nature",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop",
    packages: [
      { id: 31, title: "Chitwan Jungle Safari & Elephant Breeding Walk", duration: "2 Days", price: 8500, description: "One-horned rhino spotting, canoe ride on Rapti River, and Tharu cultural evening dance." },
    ],
  },
};

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { id } = await params;
  const guideId = parseInt(id, 10);

  if (isNaN(guideId)) {
    notFound();
  }

  let guide = mockGuides[guideId] || mockGuides[1];

  try {
    const [dbGuide] = await db.select().from(guidesTable).where(eq(guidesTable.id, guideId));
    if (dbGuide) {
      const dbPackages = await db.select().from(packagesTable).where(eq(packagesTable.guideId, guideId));
      guide = {
        ...dbGuide,
        specialty: guide.specialty,
        image: dbGuide.guideImageUrl || guide.image,
        packages: dbPackages.length > 0 ? dbPackages.map(p => ({
          id: p.id,
          title: p.title,
          duration: `${p.durationDays} Day/s`,
          price: p.price,
          description: p.description,
        })) : guide.packages,
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
