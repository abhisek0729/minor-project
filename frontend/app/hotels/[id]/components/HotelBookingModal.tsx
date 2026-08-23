"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

interface HotelBookingModalProps {
  hotelId: number;
  hotelName: string;
  roomId: number;
  roomType: string;
  pricePerNight: number;
}

export default function HotelBookingModal({
  hotelId,
  hotelName,
  roomId,
  roomType,
  pricePerNight,
}: HotelBookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"khalti" | "cash">("khalti");
  const router = useRouter();

  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(2);
  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [specialRequests, setSpecialRequests] = useState("");

  const totalCost = pricePerNight * (nights || 1);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create Booking Record
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: "hotel",
          item_id: hotelId,
          item_name: `${hotelName} - ${roomType}`,
          guests,
          check_in_date: checkInDate,
          total_cost: totalCost,
          booking_notes: `Room: ${roomType} (${nights} Night/s). ${specialRequests}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Booking transaction failed");
      }

      const bookingId = data.booking?.id;

      // 2. If Khalti is selected, initiate payment gateway
      if (paymentMethod === "khalti") {
        toast.info("Connecting to Khalti secure payment gateway...");
        const payRes = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId,
            amount: totalCost,
            itemName: `${hotelName} (${roomType})`,
          }),
        });

        const payData = await payRes.json();

        if (payData.success && payData.payment_url) {
          window.location.href = payData.payment_url;
          return;
        } else {
          toast.warning("Payment gateway initialization notice. Redirecting to dashboard...");
        }
      }

      toast.success(`Reservation placed for ${roomType} at ${hotelName}!`);
      setIsOpen(false);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="font-semibold gap-1.5 rounded-xl cursor-pointer"
      >
        <BedDouble className="size-3.5" /> Book Room Now
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="size-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary text-[10px]">Instant Booking</Badge>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Verified Partner</Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground mt-1">
                Reserve {roomType}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hotelName} • NPR {pricePerNight.toLocaleString()} / night
              </p>
            </div>

            <form onSubmit={handleBooking} className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <Field className="space-y-1">
                  <FieldLabel className="text-xs font-semibold">Check-In Date</FieldLabel>
                  <Input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                  />
                </Field>

                <Field className="space-y-1">
                  <FieldLabel className="text-xs font-semibold">Total Nights</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={nights}
                    onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                  />
                </Field>
              </div>

              <Field className="space-y-1">
                <FieldLabel className="text-xs font-semibold">Number of Guests</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
              </Field>

              <Field className="space-y-1">
                <FieldLabel className="text-xs font-semibold">Special Requests (Optional)</FieldLabel>
                <Input
                  placeholder="e.g. Early check-in, high floor, mountain view"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </Field>

              {/* Payment Method Selection */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-foreground block">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("khalti")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 relative ${
                      paymentMethod === "khalti"
                        ? "border-purple-600 bg-purple-500/10 shadow-xs ring-1 ring-purple-600"
                        : "border-border bg-muted/30 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="size-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                        K
                      </div>
                      {paymentMethod === "khalti" && (
                        <CheckCircle2 className="size-4 text-purple-600" />
                      )}
                    </div>
                    <p className="font-bold text-xs text-foreground">Pay with Khalti</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Instant verification & e-ticket
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                      paymentMethod === "cash"
                        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                        : "border-border bg-muted/30 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <DollarSign className="size-5 text-muted-foreground" />
                      {paymentMethod === "cash" && (
                        <CheckCircle2 className="size-4 text-primary" />
                      )}
                    </div>
                    <p className="font-bold text-xs text-foreground">Pay on Arrival</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Cash or POS at hotel desk
                    </p>
                  </button>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="rounded-2xl bg-muted/50 p-4 border space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{roomType} × {nights} night(s)</span>
                  <span>NPR {totalCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-base text-foreground border-t pt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">NPR {totalCost.toLocaleString()}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold gap-2 rounded-xl h-11 cursor-pointer text-white shadow-md ${
                  paymentMethod === "khalti"
                    ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                    : "bg-primary hover:bg-primary/90 shadow-primary/20"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Processing Booking...
                  </>
                ) : paymentMethod === "khalti" ? (
                  <>
                    <Wallet className="size-4" /> Pay NPR {totalCost.toLocaleString()} via Khalti
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> Confirm Reservation (Pay Later)
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
