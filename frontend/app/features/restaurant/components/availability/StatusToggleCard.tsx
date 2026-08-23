"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Power, Store, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toggleRestaurantOpenStatus } from "../../actions/availability.action";

interface StatusToggleCardProps {
  initialIsOpen: boolean;
  restaurantName: string;
}

export default function StatusToggleCard({
  initialIsOpen,
  restaurantName,
}: StatusToggleCardProps) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !isOpen;
    startTransition(async () => {
      setIsOpen(nextState);
      const res = await toggleRestaurantOpenStatus(nextState);
      if (res.success) {
        toast.success(res.message);
      } else {
        setIsOpen(!nextState); // rollback
        toast.error(res.message);
      }
    });
  };

  return (
    <Card className="overflow-hidden border shadow-sm">
      <div
        className={`h-2 transition-colors duration-500 ${
          isOpen ? "bg-emerald-500" : "bg-red-500"
        }`}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Store className="size-5 text-primary" />
            Live Restaurant Status
          </CardTitle>
          <CardDescription>
            Control whether customers can browse and place orders at{" "}
            <span className="font-semibold text-foreground">{restaurantName}</span>.
          </CardDescription>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            isOpen
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
          }`}
        >
          <span
            className={`size-2 rounded-full ${
              isOpen ? "bg-emerald-500 animate-ping" : "bg-red-500"
            }`}
          />
          {isOpen ? "Currently OPEN" : "Currently CLOSED"}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-12 items-center justify-center rounded-xl transition-all ${
                isOpen
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/15 text-red-600 dark:text-red-400"
              }`}
            >
              {isOpen ? (
                <CheckCircle2 className="size-6" />
              ) : (
                <XCircle className="size-6" />
              )}
            </div>
            <div>
              <p className="font-semibold text-base">
                {isOpen ? "Accepting Customers & Orders" : "Closed to Customers"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOpen
                  ? "Your restaurant shows as OPEN on the platform."
                  : "Customers are informed that your kitchen is currently closed."}
              </p>
            </div>
          </div>

          <Button
            type="button"
            disabled={isPending}
            onClick={handleToggle}
            variant={isOpen ? "destructive" : "default"}
            className="w-full sm:w-auto font-medium gap-2 shadow-sm"
          >
            <Power className="size-4" />
            {isOpen ? "Switch to Closed" : "Open Restaurant Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
