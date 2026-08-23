import Link from "next/link";
import Image from "next/image";
import { Clock3, ArrowLeft, Compass, Phone, Languages, Award, DollarSign, Edit3, Mail, MapPin } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getGuideByUserId } from "@/app/features/guide/services/guide.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function GuidePendingPage() {
  const session = await getServerSession(authOptions);
  const guide = session?.user?.id ? await getGuideByUserId(Number(session.user.id)) : null;

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
              <h2 className="text-xl font-bold tracking-tight">Tour Guide Application Under Review</h2>
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                Pending Approval
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your trekking credentials, languages, and license information are currently being verified by our team.
            </p>
          </div>
        </div>

        <Link href="/dashboard/guide/settings">
          <Button size="sm" className="gap-1.5 font-semibold text-xs rounded-xl shadow-xs">
            <Edit3 className="size-3.5" /> Edit Guide Profile
          </Button>
        </Link>
      </div>

      {/* Submitted Guide Profile Details Card */}
      {guide ? (
        <Card className="rounded-3xl border shadow-sm overflow-hidden bg-card">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Compass className="size-5 text-primary" /> Submitted Tour Guide Credentials
                </CardTitle>
                <CardDescription className="text-xs">
                  Review the details submitted during your guide registration process.
                </CardDescription>
              </div>
              <Link href="/dashboard/guide/settings">
                <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 rounded-xl">
                  <Edit3 className="size-3.5" /> Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Guide Photo & Bio */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {guide.guideImageUrl ? (
                <div className="relative size-28 rounded-2xl overflow-hidden border shrink-0 shadow-xs">
                  <Image
                    src={guide.guideImageUrl}
                    alt={guide.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="size-28 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border shrink-0">
                  <Compass className="size-10 opacity-40" />
                </div>
              )}

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-foreground">{guide.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {guide.experienceYears || 1} Years Experience
                  </Badge>
                  {guide.licenseNumber && (
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      License: {guide.licenseNumber}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {guide.description}
                </p>

                <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Phone className="size-3.5 text-primary" /> {guide.phoneNumber}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <MapPin className="size-3.5 text-primary" /> {guide.location}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Languages className="size-3.5 text-primary" /> {guide.languages || "Nepali, English"}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="size-3.5" /> NPR {guide.dailyRate?.toLocaleString() || "2,500"} / day
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps & Support Help */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t text-xs">
              <span className="text-muted-foreground">
                Need to submit additional certifications or contact administration?
              </span>
              <div className="flex gap-2">
                <Link href="mailto:support@tourism.com">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                    <Mail className="size-3.5" /> Contact Support
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
          <p className="text-sm text-muted-foreground">No tour guide registration data found.</p>
          <Link href="/onboarding/guide" className="mt-3 inline-block">
            <Button size="sm">Start Guide Onboarding</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
