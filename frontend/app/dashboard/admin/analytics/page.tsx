import {
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  DollarSign,
  PieChart,
  ShoppingBag,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { getAdminRevenueAnalytics } from "@/app/features/admin/actions/admin.action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const res = await getAdminRevenueAnalytics();
  const data = res.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Revenue & Booking Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gross platform volume, marketplace commissions, booking conversion, and partner transactions.
        </p>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Platform Volume */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Platform Volume</CardTitle>
            <DollarSign className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              NPR {data.grossPlatformVolume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined Hotel, Food & Trek GMV
            </p>
          </CardContent>
        </Card>

        {/* Platform Revenue (10% Commission) */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission (10%)</CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              NPR {data.platformCommission.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Platform retained earnings
            </p>
          </CardContent>
        </Card>

        {/* Stays & Trek Bookings */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bookings Volume</CardTitle>
            <CalendarCheck className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              NPR {data.confirmedBookingVolume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalBookings} reservation requests
            </p>
          </CardContent>
        </Card>

        {/* Food & Restaurant Orders */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Restaurant Sales Volume</CardTitle>
            <ShoppingBag className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              NPR {data.totalRestaurantVolume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dine-in & order checkouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Status & Transaction Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Conversion Breakdown (1 Col) */}
        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Booking Status Breakdown</CardTitle>
            <CardDescription>Fulfillment & completion metrics.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-500/5 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span className="font-semibold">Confirmed / Completed</span>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold">
                  {data.bookingStatusCounts.confirmed}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-500/5 text-xs">
                <div className="flex items-center gap-2">
                  <PieChart className="size-4 text-amber-500" />
                  <span className="font-semibold">Pending Confirmation</span>
                </div>
                <Badge className="bg-amber-500 text-white font-bold">
                  {data.bookingStatusCounts.pending}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-red-500/5 text-xs">
                <div className="flex items-center gap-2">
                  <XCircle className="size-4 text-red-500" />
                  <span className="font-semibold">Cancelled</span>
                </div>
                <Badge variant="outline" className="text-red-600 border-red-500/30 font-bold">
                  {data.bookingStatusCounts.cancelled}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transaction Activity (2 Cols) */}
        <Card className="lg:col-span-2 border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Recent Marketplace Transactions</CardTitle>
            <CardDescription>Live incoming booking transactions across Nepal.</CardDescription>
          </CardHeader>

          <CardContent>
            {data.recentBookings.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-8 text-center">
                No recent booking transactions found.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.recentBookings.map((b: any) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {b.itemName || "Travel Booking"}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {b.bookingType}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Customer: <span className="font-medium text-foreground">{b.customerName}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-foreground">
                        NPR {Number(b.totalAmount).toLocaleString()}
                      </span>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {b.paymentStatus === "completed" ? "✅ Paid" : "⏳ Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
