import Link from "next/link";
import {
  Clock3,
  Hotel,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import {
  getAdminPlatformStats,
  getPendingApprovals,
} from "@/app/features/admin/actions/admin.action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PendingApprovalsTable from "@/app/features/admin/components/approvals/PendingApprovalsTable";

export default async function AdminDashboardPage() {
  const [statsRes, pendingRes] = await Promise.all([
    getAdminPlatformStats(),
    getPendingApprovals(),
  ]);

  const stats = statsRes.data || {
    totalUsers: 0,
    totalRestaurants: 0,
    totalHotels: 0,
    pendingRestaurants: 0,
    pendingHotels: 0,
    totalPending: 0,
  };

  const pendingRestaurants = pendingRes.data?.restaurants || [];
  const pendingHotels = pendingRes.data?.hotels || [];

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" />
            Platform Control & Approvals
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor partner applications, verify business listings, and manage platform resources.
          </p>
        </div>

        {stats.totalPending > 0 && (
          <Badge className="bg-amber-500 text-white px-3 py-1 text-xs font-bold animate-pulse">
            ⚠️ {stats.totalPending} New Partner Application{stats.totalPending > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals */}
        <Card className={`border shadow-xs ${stats.totalPending > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock3 className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.totalPending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingRestaurants} restaurants, {stats.pendingHotels} hotels
            </p>
          </CardContent>
        </Card>

        {/* Total Restaurants */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <UtensilsCrossed className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
            <Link
              href="/dashboard/admin/restaurants"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              View all restaurants →
            </Link>
          </CardContent>
        </Card>

        {/* Total Hotels */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Hotels & Stays</CardTitle>
            <Hotel className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHotels}</div>
            <Link
              href="/dashboard/admin/hotels"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              View all hotels →
            </Link>
          </CardContent>
        </Card>

        {/* Registered Users */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <Link
              href="/dashboard/admin/users"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              Manage accounts →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Section: Pending Approvals Queue */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Clock3 className="size-5 text-amber-500" />
              Partner Approval Applications
            </h2>
            <p className="text-xs text-muted-foreground">
              Review details and approve or reject partner registrations to unlock their dashboard and list them publicly.
            </p>
          </div>
        </div>

        <PendingApprovalsTable
          initialRestaurants={pendingRestaurants}
          initialHotels={pendingHotels}
        />
      </div>
    </div>
  );
}
