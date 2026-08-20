import { getServerSession } from "next-auth";
import { DollarSign, Star, TrendingUp, Users } from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  getGuideByUserId,
  getGuideStats,
} from "@/app/features/guide/services/guide.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GuideAnalyticsPage() {
  const session = await getServerSession(authOptions);
  const guide = await getGuideByUserId(Number(session?.user?.id));

  if (!guide) {
    return <div>Guide not found</div>;
  }

  const stats = await getGuideStats(guide.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Earnings & Tour Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review your tour volume, income breakdown, and traveler rating feedback.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Tour Revenue</CardTitle>
            <DollarSign className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              NPR {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From all confirmed bookings</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Tours</CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTours}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Guiding {stats.totalGuests} total travelers
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1.5">
              <span>{stats.avgRating}</span>
              <span className="text-xs font-normal text-muted-foreground">/ 5.0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.reviewCount} customer reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Trekking & Tour Volume Breakdown</CardTitle>
          <CardDescription>
            Financial summary of recent expedition bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentBookings.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">
                No revenue recorded yet. Confirmed bookings will automatically generate earnings logs.
              </p>
            ) : (
              stats.recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 text-xs"
                >
                  <div>
                    <span className="font-semibold text-foreground">{b.itemName || "Guided Trek"}</span>
                    <p className="text-muted-foreground">Client: {b.customerName} • {b.guests} Guests</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-emerald-600">
                      NPR {Number(b.totalAmount).toLocaleString()}
                    </span>
                    <p className="text-[11px] text-muted-foreground capitalize">{b.paymentStatus}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
