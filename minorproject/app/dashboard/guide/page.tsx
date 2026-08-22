import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  MapPin,
  Package,
  Plus,
  Star,
  Users,
} from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  getGuideByUserId,
  getGuideStats,
} from "@/app/features/guide/services/guide.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function GuideDashboardPage() {
  const session = await getServerSession(authOptions);
  const guide = await getGuideByUserId(Number(session?.user?.id));

  if (!guide) {
    return <div>Guide not initialized</div>;
  }

  const stats = await getGuideStats(guide.id);

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Namaste, {guide.name}! 🏔️
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your trekking packages, track upcoming traveler bookings, and schedule availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/guide/packages">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
              <Plus className="size-4" />
              Create Tour Package
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Tour Earnings</CardTitle>
            <DollarSign className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              NPR {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {stats.totalTours} completed tours
            </p>
          </CardContent>
        </Card>

        {/* Active Packages */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Published Packages</CardTitle>
            <Package className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePackages}</div>
            <Link
              href="/dashboard/guide/packages"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              Manage tour packages →
            </Link>
          </CardContent>
        </Card>

        {/* Travelers Guided */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Travelers Guided</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingRequests} booking request{stats.pendingRequests === 1 ? "" : "s"} waiting
            </p>
          </CardContent>
        </Card>

        {/* Guide Rating */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Guide Rating</CardTitle>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1.5">
              <span>{stats.avgRating}</span>
              <span className="text-xs font-normal text-muted-foreground">/ 5.0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {stats.reviewCount} traveler review{stats.reviewCount === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Bookings & Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings (2 Cols) */}
        <Card className="lg:col-span-2 border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Tour Bookings</CardTitle>
              <CardDescription>Latest travel requests and confirmed expeditions.</CardDescription>
            </div>
            <Link href="/dashboard/guide/bookings">
              <Button variant="ghost" size="sm" className="text-xs">
                View All ({stats.recentBookings.length}) →
              </Button>
            </Link>
          </CardHeader>

          <CardContent>
            {stats.recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-xl border border-dashed">
                <Compass className="size-8 text-muted-foreground mb-2" />
                <p className="font-semibold text-sm">No bookings yet</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Publish packages so tourists can discover and book your services.
                </p>
                <Link href="/dashboard/guide/packages">
                  <Button size="sm" className="gap-1.5">
                    <Plus className="size-3.5" /> Add Package
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">{b.itemName || "Custom Trek/Guide Service"}</p>
                      <p className="text-xs text-muted-foreground">
                        Customer: <span className="text-foreground font-medium">{b.customerName}</span> ({b.guests} Guests) • Dates: {b.checkInDate || "TBD"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={b.status === "confirmed" ? "default" : "outline"}
                        className={
                          b.status === "confirmed"
                            ? "bg-emerald-600 text-white text-xs"
                            : "text-amber-600 border-amber-500/40 text-xs"
                        }
                      >
                        {b.status.toUpperCase()}
                      </Badge>
                      <span className="font-bold text-sm">
                        NPR {b.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guide Quick Profile Card (1 Col) */}
        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Guide Profile</CardTitle>
            <CardDescription>Your public guide credentials</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Location:</span>
                <span className="font-medium text-foreground">{guide.location}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Daily Rate:</span>
                <span className="font-medium text-foreground">NPR {guide.dailyRate?.toLocaleString()} / day</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Experience:</span>
                <span className="font-medium text-foreground">{guide.experienceYears} Years</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Languages:</span>
                <span className="font-medium text-foreground">{guide.languages}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2 border-t line-clamp-3">
              "{guide.description}"
            </p>

            <div className="pt-2">
              <Link href="/dashboard/guide/settings" className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Edit Guide Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
