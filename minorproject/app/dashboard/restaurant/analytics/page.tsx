import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  DollarSign,
  ShoppingBag,
  Star,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getRestaurantAnalytics } from "@/app/features/restaurant/actions/analytics.action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function RestaurantAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const ownerRole = session.user.roles?.find(
    (role) => role.name === "restaurantOwner"
  );

  if (!ownerRole) {
    redirect("/unauthorized");
  }

  if (ownerRole.approvalStatus === "pending") {
    redirect("/dashboard/restaurant/pending");
  }

  const res = await getRestaurantAnalytics();
  const data = res.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Restaurant Sales & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track sales revenue, best-selling dishes, average ticket size, and customer feedback.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Food Sales</CardTitle>
            <DollarSign className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              NPR {data.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {data.totalOrders} total orders
            </p>
          </CardContent>
        </Card>

        {/* Avg Order Value */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Ticket Size</CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              NPR {data.averageOrderValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average per customer order</p>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In-Progress Orders</CardTitle>
            <ShoppingBag className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {data.activeOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently in kitchen / pending</p>
          </CardContent>
        </Card>

        {/* Customer Rating */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Food Quality Rating</CardTitle>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1.5">
              <span>{data.avgRating}</span>
              <span className="text-xs font-normal text-muted-foreground">/ 5.0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {data.reviewCount} customer reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Dishes & Recent Sales Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Dishes */}
        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Top Best-Selling Dishes</CardTitle>
            <CardDescription>Most popular menu items by sales count.</CardDescription>
          </CardHeader>

          <CardContent>
            {data.topDishes.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-6 text-center">
                No dish sales recorded yet. Orders will populate dish popularity.
              </p>
            ) : (
              <div className="space-y-3">
                {data.topDishes.map((dish: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-bold size-6 rounded-full flex items-center justify-center p-0">
                        #{idx + 1}
                      </Badge>
                      <span className="font-semibold text-foreground">{dish.name}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-foreground">{dish.count} Sold</span>
                      <p className="text-[11px] text-muted-foreground">
                        NPR {dish.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Kitchen Transactions */}
        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Recent Order History</CardTitle>
            <CardDescription>Latest customer receipts.</CardDescription>
          </CardHeader>

          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-6 text-center">
                No recent orders found.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">
                        Order #{order.id} • {order.customerName}
                      </span>
                      <p className="text-muted-foreground text-[11px]">
                        Table {order.tableNumber || "T-1"} • Status: <strong className="capitalize">{order.status}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-foreground">
                        NPR {Number(order.totalAmount).toLocaleString()}
                      </span>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {order.paymentStatus}
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
