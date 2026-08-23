"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const pidx = searchParams.get("pidx");
  const purchaseOrderId = searchParams.get("purchase_order_id");
  let rawBookingId = searchParams.get("booking_id") || searchParams.get("bookingId");
  if (!rawBookingId && purchaseOrderId && purchaseOrderId.startsWith("BK-")) {
    rawBookingId = purchaseOrderId.split("-")[1];
  }

  const txnId = searchParams.get("txnId") || searchParams.get("tidx");
  const amountParam = searchParams.get("amount") || searchParams.get("total_amount");

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [details, setDetails] = useState<any>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    async function verifyTransaction() {
      if (!pidx) {
        setLoading(false);
        setVerified(false);
        return;
      }

      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pidx,
            bookingId: rawBookingId,
            transaction_id: txnId,
          }),
        });

        const data = await res.json();
        if (data.verified && (data.status === "Completed" || data.success)) {
          setVerified(true);
          setDetails(data);
        } else {
          setVerified(false);
          setDetails(data);
        }
      } catch (err) {
        console.error("Verification fetch error:", err);
        setVerified(false);
      } finally {
        setLoading(false);
      }
    }

    verifyTransaction();
  }, [pidx, rawBookingId, txnId]);

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {loading ? (
          <Card className="p-8 text-center border shadow-lg space-y-4">
            <Loader2 className="size-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Verifying Khalti Payment...</h2>
            <p className="text-xs text-muted-foreground">
              Please wait while we secure your booking receipt and confirm with the payment gateway.
            </p>
          </Card>
        ) : verified ? (
          <Card className="border-2 border-emerald-500/40 bg-card shadow-2xl rounded-3xl overflow-hidden animate-in fade-in duration-300">
            {/* Header banner */}
            <div className="bg-emerald-600 text-white p-6 text-center space-y-2">
              <div className="size-16 rounded-full bg-white/20 flex items-center justify-center mx-auto backdrop-blur-xs">
                <CheckCircle2 className="size-10 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">Payment Successful!</h1>
              <p className="text-xs text-emerald-100 font-medium">
                Your reservation has been confirmed and paid with Khalti.
              </p>
            </div>

            <CardContent className="p-6 space-y-5">
              {/* Receipt details */}
              <div className="space-y-3 rounded-2xl bg-muted/40 p-4 border text-xs">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Receipt className="size-3.5" /> Payment Method
                  </span>
                  <Badge className="bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px] font-bold">
                    Khalti Digital Wallet
                  </Badge>
                </div>

                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-muted-foreground">Gateway Transaction Ref</span>
                  <span className="font-mono font-bold text-foreground truncate max-w-[180px]">
                    {details?.transaction_id || pidx || "TXN-KHALTI-VERIFIED"}
                  </span>
                </div>

                {(details?.bookingId || rawBookingId) && (
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Booking ID</span>
                    <span className="font-mono font-bold text-foreground">#{details?.bookingId || rawBookingId}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-foreground text-sm">Total Paid</span>
                  <span className="font-extrabold text-base text-emerald-600">
                    NPR {details?.amount ? details.amount.toLocaleString() : (amountParam ? (parseInt(amountParam) / 100).toLocaleString() : "Verified")}
                  </span>
                </div>
              </div>

              {/* Status perks */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-xs">
                <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
                <p className="leading-tight">
                  Instant e-receipt generated. Your booking is marked as <strong>Confirmed & Paid</strong>.
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <Link href="/dashboard" className="block w-full">
                  <Button className="w-full font-bold gap-2 h-11 rounded-xl cursor-pointer">
                    View in Dashboard <ArrowRight className="size-4" />
                  </Button>
                </Link>

                <Link href="/" className="block w-full">
                  <Button variant="outline" className="w-full text-xs h-10 rounded-xl cursor-pointer">
                    Return to Homepage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-rose-500/40 p-6 text-center space-y-4 shadow-xl">
            <AlertCircle className="size-12 text-rose-600 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Payment Verification Issue</h2>
            <p className="text-xs text-muted-foreground">
              We could not verify the payment transaction. If amount was deducted, please check your Khalti app or contact support.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
