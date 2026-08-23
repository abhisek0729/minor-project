import Link from "next/link";
import Image from "next/image";
import { Clock3, Mail, ArrowLeft, Hotel, MapPin, Phone, Globe, Edit3, CheckCircle2, ShieldAlert } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getHotelByOwnerId } from "@/app/features/hotel/actions/getHotelByOwnerId";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HotelPendingPage() {
  const session = await getServerSession(authOptions);
  const hotel = session?.user?.id ? await getHotelByOwnerId(Number(session.user.id)) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      {/* Top Banner Alert */}
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <Clock3 className="size-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Hotel Registration Under Review</h2>
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                Pending Approval
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your property details and credentials have been submitted. Our administrators typically verify listings within <strong>1–2 business days</strong>.
            </p>
          </div>
        </div>

        <Link href="/dashboard/hotels/settings">
          <Button size="sm" className="gap-1.5 font-semibold text-xs rounded-xl shadow-xs">
            <Edit3 className="size-3.5" /> Edit Profile Details
          </Button>
        </Link>
      </div>

      {/* Submitted Hotel Profile Details Card */}
      {hotel ? (
        <Card className="rounded-3xl border shadow-sm overflow-hidden bg-card">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Hotel className="size-5 text-primary" /> Submitted Onboarding Information
                </CardTitle>
                <CardDescription className="text-xs">
                  Here are the details you entered during registration. You can edit them anytime before or after approval.
                </CardDescription>
              </div>
              <Link href="/dashboard/hotels/settings">
                <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 rounded-xl">
                  <Edit3 className="size-3.5" /> Edit Details
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Top Identity & Cover */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {hotel.coverImageUrl ? (
                <div className="relative h-32 w-full sm:w-48 rounded-2xl overflow-hidden border shrink-0 shadow-xs">
                  <Image
                    src={hotel.coverImageUrl}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-32 w-full sm:w-48 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border shrink-0">
                  <Hotel className="size-10 opacity-40" />
                </div>
              )}

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-foreground">{hotel.name}</h3>
                  {hotel.establishedYear && (
                    <Badge variant="secondary" className="text-xs">
                      Est. {hotel.establishedYear}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {hotel.description}
                </p>

                <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Phone className="size-3.5 text-primary" /> {hotel.phoneNumber}
                  </span>
                  {hotel.website && (
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Globe className="size-3.5 text-primary" /> {hotel.website}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Location & GPS Coordinates */}
            <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-4 text-primary" /> Verified Property Location & Map Coordinates
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-background/80 p-2.5 rounded-xl border">
                  <span className="text-muted-foreground block text-[10px] font-semibold">Province</span>
                  <span className="font-bold text-foreground">{hotel.province} Province</span>
                </div>
                <div className="bg-background/80 p-2.5 rounded-xl border">
                  <span className="text-muted-foreground block text-[10px] font-semibold">District & City</span>
                  <span className="font-bold text-foreground">{hotel.municipality}, {hotel.district}</span>
                </div>
                <div className="bg-background/80 p-2.5 rounded-xl border">
                  <span className="text-muted-foreground block text-[10px] font-semibold">Street / Ward</span>
                  <span className="font-bold text-foreground">{hotel.street} (Ward {hotel.ward})</span>
                </div>
                <div className="bg-background/80 p-2.5 rounded-xl border">
                  <span className="text-muted-foreground block text-[10px] font-semibold">GPS Coordinates</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {hotel.latitude ? `${Number(hotel.latitude).toFixed(4)}, ${Number(hotel.longitude).toFixed(4)}` : "Pinned via Address"}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps & Support Help */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t text-xs">
              <span className="text-muted-foreground">
                Need to update business documents or have urgent questions?
              </span>
              <div className="flex gap-2">
                <Link href="mailto:support@tourism.com">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                    <Mail className="size-3.5" /> Email Support
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
                    <ArrowLeft className="size-3.5" /> Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center rounded-3xl border">
          <p className="text-sm text-muted-foreground">No hotel registration data found.</p>
          <Link href="/onboarding/hotel" className="mt-3 inline-block">
            <Button size="sm">Start Hotel Onboarding</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}