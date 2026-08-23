"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Phone,
  ShoppingBag,
  User,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "../../actions/orders.action";

interface RestaurantOrdersTableProps {
  initialOrders: any[];
}

export default function RestaurantOrdersTable({
  initialOrders,
}: RestaurantOrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders || []);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (
    orderId: number,
    status: "pending" | "preparing" | "served" | "completed" | "cancelled"
  ) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status);
      if (res.success) {
        toast.success(res.message);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      } else {
        toast.error(res.message);
      }
    });
  };

  const handlePaymentToggle = (orderId: number, currentPayment: string) => {
    const nextPayment = currentPayment === "completed" ? "pending" : "completed";
    startTransition(async () => {
      const res = await updateOrderPaymentStatus(orderId, nextPayment);
      if (res.success) {
        toast.success(res.message);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: nextPayment } : o))
        );
      } else {
        toast.error(res.message);
      }
    });
  };

  if (orders.length === 0) {
    return (
      <Card className="border-dashed bg-muted/10 p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3">
          <UtensilsCrossed className="size-7" />
        </div>
        <h3 className="text-lg font-semibold">No orders or reservations yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          When customers order dishes or book tables from your restaurant listing, they will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {orders.map((order) => {
        let items: Array<{ name: string; price: number; qty: number }> = [];
        try {
          items = JSON.parse(order.itemsJson || "[]");
        } catch (e) {
          items = [];
        }

        return (
          <Card key={order.id} className="border shadow-xs flex flex-col justify-between">
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-foreground">
                      Order #{order.id}
                    </span>
                    <Badge variant="outline" className="text-[11px] uppercase">
                      {order.orderType || "Dine-In"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <User className="size-3.5 text-primary" /> {order.customerName} • Table {order.tableNumber || "T-1"}
                  </p>
                </div>

                <Badge
                  className={
                    order.status === "completed" || order.status === "served"
                      ? "bg-emerald-600 text-white text-xs"
                      : order.status === "cancelled"
                      ? "bg-red-500/10 text-red-600 border-red-500/20 text-xs"
                      : order.status === "preparing"
                      ? "bg-blue-600 text-white text-xs"
                      : "bg-amber-500 text-white text-xs"
                  }
                >
                  {order.status.toUpperCase()}
                </Badge>
              </div>

              {/* Items ordered list */}
              <div className="space-y-1.5 py-2 border-y">
                <span className="font-semibold text-muted-foreground text-[11px] uppercase">Dishes Ordered:</span>
                {items.length === 0 ? (
                  <p className="text-muted-foreground italic">Table Reservation</p>
                ) : (
                  items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>{item.qty}x {item.name}</span>
                      <span className="font-medium">NPR {((item.price || 0) * (item.qty || 1)).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-1.5 text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" /> Contact:
                  </span>
                  <span className="font-medium text-foreground">{order.customerPhone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total Bill:</span>
                  <span className="font-bold text-base text-foreground">
                    NPR {Number(order.totalAmount).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Payment:</span>
                  <button
                    onClick={() => handlePaymentToggle(order.id, order.paymentStatus)}
                    className="cursor-pointer"
                  >
                    <Badge
                      variant="outline"
                      className={
                        order.paymentStatus === "completed"
                          ? "text-emerald-600 border-emerald-500/30 font-semibold"
                          : "text-amber-600 border-amber-500/30 font-semibold"
                      }
                    >
                      {order.paymentStatus === "completed" ? "PAID (Click to toggle)" : "UNPAID (Click to mark paid)"}
                    </Badge>
                  </button>
                </div>
              </div>
            </CardContent>

            <div className="p-4 pt-0 border-t flex items-center justify-end gap-2">
              {order.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange(order.id, "cancelled")}
                    className="text-xs h-8"
                  >
                    <X className="size-3.5 mr-1" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange(order.id, "preparing")}
                    className="text-xs h-8 bg-primary text-primary-foreground"
                  >
                    <UtensilsCrossed className="size-3.5 mr-1" /> Start Preparing
                  </Button>
                </>
              )}

              {order.status === "preparing" && (
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleStatusChange(order.id, "served")}
                  className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Check className="size-3.5 mr-1" /> Mark Served
                </Button>
              )}

              {order.status === "served" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleStatusChange(order.id, "completed")}
                  className="text-xs h-8"
                >
                  <CheckCircle2 className="size-3.5 mr-1 text-emerald-600" /> Complete & Close Order
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
