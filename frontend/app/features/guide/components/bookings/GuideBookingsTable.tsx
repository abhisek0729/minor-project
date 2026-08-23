"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  User,
  Users,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateGuideBookingStatus } from "../../actions/guide.action";

interface GuideBookingsTableProps {
  initialBookings: any[];
}

export default function GuideBookingsTable({
  initialBookings,
}: GuideBookingsTableProps) {
  const [bookings, setBookings] = useState(initialBookings || []);
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (
    bookingId: number,
    status: "confirmed" | "cancelled" | "completed"
  ) => {
    startTransition(async () => {
      const res = await updateGuideBookingStatus(bookingId, status);
      if (res.success) {
        toast.success(res.message);
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
      } else {
        toast.error(res.message);
      }
    });
  };

  if (bookings.length === 0) {
    return (
      <Card className="border-dashed bg-muted/10 p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto mb-3">
          <Users className="size-7" />
        </div>
        <h3 className="text-lg font-semibold">No booking requests yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          When tourists book your guided treks or custom services, they will appear here for your confirmation.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {bookings.map((booking) => (
        <Card key={booking.id} className="border shadow-xs flex flex-col justify-between">
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-foreground">
                  {booking.itemName || "Guided Mountain Expedition"}
                </h3>
                <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <User className="size-3.5 text-emerald-600" /> {booking.customerName}
                </p>
              </div>

              <Badge
                variant={booking.status === "confirmed" ? "default" : "outline"}
                className={
                  booking.status === "confirmed"
                    ? "bg-emerald-600 text-white"
                    : booking.status === "cancelled"
                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                    : "text-amber-600 border-amber-500/30"
                }
              >
                {booking.status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-1.5 pt-2 border-t text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" /> Email:
                </span>
                <span className="font-medium text-foreground">{booking.customerEmail}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Dates:
                </span>
                <span className="font-medium text-foreground">
                  {booking.checkInDate || "Immediate"}
                  {booking.checkOutDate ? ` to ${booking.checkOutDate}` : ""}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5" /> Group Size:
                </span>
                <span className="font-medium text-foreground">{booking.guests} Guests</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Total Fee:</span>
                <span className="font-bold text-sm text-foreground">
                  NPR {Number(booking.totalAmount).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Payment:</span>
                <Badge
                  variant="outline"
                  className={
                    booking.paymentStatus === "completed"
                      ? "text-emerald-600 border-emerald-500/30 font-semibold"
                      : "text-amber-600 border-amber-500/30 font-semibold"
                  }
                >
                  {booking.paymentStatus === "completed" ? "PAID" : "UNPAID"}
                </Badge>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="p-2.5 rounded bg-muted/40 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Special Request:</span> {booking.specialRequests}
              </div>
            )}
          </CardContent>

          <div className="p-4 pt-0 border-t flex items-center justify-end gap-2">
            {booking.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                  className="text-xs h-8"
                >
                  <X className="size-3.5 mr-1" /> Decline
                </Button>
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                  className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Check className="size-3.5 mr-1" /> Confirm Booking
                </Button>
              </>
            )}

            {booking.status === "confirmed" && (
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleStatusUpdate(booking.id, "completed")}
                className="text-xs h-8"
              >
                <CheckCircle2 className="size-3.5 mr-1 text-emerald-600" /> Mark Completed
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
