"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type Booking = {
  id: number;
  entity_type: string;
  entity_name: string;
  location: string;
  total_cost: number;
  booking_status: string;
  check_in_date?: string;
  check_out_date?: string;
  created_at: string;
};

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch {
      toast.error("Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetch("/api/bookings")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to fetch bookings");
        const data = await response.json();
        setBookings(data.bookings || []);
      })
      .catch(() => {
        toast.error("Unable to load bookings");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCancel = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to cancel booking");
      toast.success("Booking cancelled");
      fetchBookings();
    } catch {
      toast.error("Unable to cancel booking");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      confirmed: "bg-green-50 text-green-700 border-green-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.booking_status === filter;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            My Bookings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your trip bookings and reservations
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map(
            (status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ),
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-semibold text-foreground">
                No bookings yet
              </p>
              <p className="mt-1 text-muted-foreground">
                Start exploring and book your next adventure
              </p>
              <Link href="/">
                <Button className="mt-4" variant="default">
                  Explore Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card
                key={booking.id}
                className="overflow-hidden border-border bg-card"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {booking.entity_name}
                        </h3>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusColor(booking.booking_status)}`}
                        >
                          {booking.booking_status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.entity_type}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {booking.location}
                        </div>
                        {booking.check_in_date && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(
                              booking.check_in_date,
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Total Cost
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          NPR {booking.total_cost.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {booking.booking_status === "pending" && (
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                            onClick={async () => {
                              try {
                                toast.info("Connecting to Khalti secure checkout...");
                                const res = await fetch("/api/payment/initiate", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    bookingId: booking.id,
                                    amount: booking.total_cost,
                                    itemName: booking.entity_name,
                                  }),
                                });
                                const data = await res.json();
                                if (data.success && data.payment_url) {
                                  window.location.href = data.payment_url;
                                } else {
                                  toast.error(data.error || "Failed to initiate payment");
                                }
                              } catch (error) {
                                toast.error(
                                  error instanceof Error
                                    ? error.message
                                    : "Payment initiation error",
                                );
                              }
                            }}
                          >
                            Pay with Khalti
                          </Button>
                        )}
                        {booking.booking_status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(booking.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href="/dashboard">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
