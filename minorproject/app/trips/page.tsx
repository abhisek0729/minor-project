"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  DollarSign,
  MapPin,
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

type SummaryData = {
  upcomingBookings: number;
  totalExpenses: number;
  activeTrips: number;
  savedItineraries: number;
  bookings: Array<{
    id: number;
    entity_name: string;
    location: string;
    booking_status: string;
    total_cost: number;
    check_in_date?: string;
  }>;
  expenses: Array<{
    id: number;
    name: string;
    amount: number;
    type: string;
  }>;
};

export default function TripSummaryPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const [bookingsRes, expensesRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/expenses"),
      ]);

      let bookings = [];
      let expenses = [];

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        bookings = (data.bookings || []).slice(0, 5);
      }

      if (expensesRes.ok) {
        const data = await expensesRes.json();
        expenses = (data.expenses || []).slice(0, 5);
      }

      const totalExpenses = expenses.reduce(
        (sum: number, e: any) => sum + (e.amount || 0),
        0,
      );

      setSummary({
        upcomingBookings: bookings.filter(
          (b: any) => b.booking_status === "confirmed",
        ).length,
        totalExpenses,
        activeTrips: bookings.length,
        savedItineraries: 3, // Mock value
        bookings,
        expenses,
      });
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Trip Summary
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Overview of your bookings, expenses, and itineraries
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Upcoming Bookings
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {summary?.upcomingBookings || 0}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Expenses
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    NPR {(summary?.totalExpenses || 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Trips</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {summary?.activeTrips || 0}
                  </p>
                </div>
                <Plane className="h-10 w-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Saved Itineraries
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {summary?.savedItineraries || 0}
                  </p>
                </div>
                <BookOpen className="h-10 w-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Bookings */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Your latest reservations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>
              ) : (summary?.bookings || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No bookings yet. Start planning your trip!
                </p>
              ) : (
                <div className="space-y-4">
                  {(summary?.bookings || []).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {booking.entity_name}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {booking.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          NPR {booking.total_cost.toLocaleString()}
                        </p>
                        <span className="text-xs capitalize text-yellow-600">
                          {booking.booking_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/bookings">
                <Button className="mt-6 w-full" variant="outline">
                  View All Bookings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>
                    Track your spending by category
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>
              ) : (summary?.expenses || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No expenses recorded yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {(summary?.expenses || []).map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {expense.name}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {expense.type}
                        </p>
                      </div>
                      <div className="h-2 flex-1 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min((expense.amount / (summary?.totalExpenses || 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="ml-4 font-semibold text-foreground">
                        NPR {expense.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Ready for your next adventure?
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Plan a new trip with our AI-powered itinerary builder
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/ai-planner">
                    <Button variant="default" size="lg">
                      Plan New Trip
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" size="lg">
                      Explore Destinations
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
