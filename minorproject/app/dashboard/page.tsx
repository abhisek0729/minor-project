import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  DollarSign,
  Plane,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const stats = [
    { label: "Active Trips", value: "2", icon: Plane },
    { label: "Total Spent", value: "NPR 45,000", icon: DollarSign },
    { label: "Upcoming Bookings", value: "5", icon: Calendar },
    { label: "Savings", value: "NPR 12,500", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Here's your travel overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <Icon className="h-10 w-10 text-primary/30" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access your frequent activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/bookings">
                <Button className="w-full justify-between" variant="outline">
                  <span>View My Bookings</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/trips">
                <Button className="w-full justify-between" variant="outline">
                  <span>Trip Summary</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/ai-planner">
                <Button className="w-full justify-between" variant="outline">
                  <span>Plan New Trip</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button className="w-full justify-between" variant="outline">
                  <span>Edit Profile</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b border-border pb-3 last:border-0">
                <p className="text-sm font-medium text-foreground">
                  Booked Lakeview Haven
                </p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
              <div className="border-b border-border pb-3 last:border-0">
                <p className="text-sm font-medium text-foreground">
                  Planned 3-day Pokhara trip
                </p>
                <p className="text-xs text-muted-foreground">1 week ago</p>
              </div>
              <div className="border-b border-border pb-3 last:border-0">
                <p className="text-sm font-medium text-foreground">
                  Created expense tracker
                </p>
                <p className="text-xs text-muted-foreground">2 weeks ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
