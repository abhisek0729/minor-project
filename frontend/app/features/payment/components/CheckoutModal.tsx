"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CreditCard, DollarSign, Loader2, ShieldCheck, Wallet, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initiatePayment } from "../actions/payment.action";

interface CheckoutModalProps {
  bookingId: number;
  amount: number;
  productName: string;
  triggerButton?: React.ReactNode;
}

export default function CheckoutModal({
  bookingId,
  amount,
  productName,
  triggerButton,
}: CheckoutModalProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"esewa" | "khalti" | "stripe" | "cash">("esewa");
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    startTransition(async () => {
      const res = await initiatePayment({
        bookingId,
        amount,
        paymentMethod,
        productName,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      if (paymentMethod === "esewa" && res.data?.esewaPayload) {
        // Submit auto-generated eSewa Form
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        Object.entries(res.data.esewaPayload).forEach(([key, val]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(val);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      toast.success(res.message || "Payment processed successfully!");
      setOpen(false);
    });
  };

  return (
    <>
      {triggerButton ? (
        <span onClick={() => setOpen(true)}>{triggerButton}</span>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
        >
          <CreditCard className="size-4" /> Pay Now (NPR {amount.toLocaleString()})
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-card border shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold">Complete Secure Payment</h3>
                <p className="text-xs text-muted-foreground">
                  Choose your digital payment gateway in Nepal.
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Order Summary */}
              <div className="p-3.5 rounded-xl border bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground">{productName}</span>
                  <p className="text-xs text-muted-foreground">Booking ID #{bookingId}</p>
                </div>
                <span className="text-lg font-bold text-emerald-600">
                  NPR {amount.toLocaleString()}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* eSewa */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("esewa")}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === "esewa"
                        ? "bg-emerald-500/10 border-emerald-600 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Wallet className="size-4 text-emerald-600" />
                    <span>eSewa Wallet</span>
                  </button>

                  {/* Khalti */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("khalti")}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === "khalti"
                        ? "bg-purple-500/10 border-purple-600 text-purple-600 shadow-xs"
                        : "hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Wallet className="size-4 text-purple-600" />
                    <span>Khalti Digital</span>
                  </button>

                  {/* Card / Stripe */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe")}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === "stripe"
                        ? "bg-blue-500/10 border-blue-600 text-blue-600 shadow-xs"
                        : "hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <CreditCard className="size-4 text-blue-600" />
                    <span>Credit / Debit</span>
                  </button>

                  {/* Cash On Arrival */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === "cash"
                        ? "bg-amber-500/10 border-amber-600 text-amber-600 shadow-xs"
                        : "hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <DollarSign className="size-4 text-amber-600" />
                    <span>Pay on Arrival</span>
                  </button>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" /> 256-Bit SSL Encrypted
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={isPending}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    `Confirm & Pay NPR ${amount.toLocaleString()}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
