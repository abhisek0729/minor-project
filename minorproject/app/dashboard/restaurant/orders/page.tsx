import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getRestaurantOrders } from "@/app/features/restaurant/actions/orders.action";
import RestaurantOrdersTable from "@/app/features/restaurant/components/orders/RestaurantOrdersTable";

export default async function RestaurantOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const ownerRole = session.user.roles?.find(
    (role) => role.name === "restaurantOwner"
  );

  if (!ownerRole) {
    redirect("/unauthorized");
  }

  if (ownerRole.approvalStatus === "pending") {
    redirect("/dashboard/restaurant/pending");
  }

  const res = await getRestaurantOrders();
  const orders = res.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Orders & Table Bookings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Live kitchen ticket orders, customer table reservations, and order payment reconciliation.
        </p>
      </div>

      <RestaurantOrdersTable initialOrders={orders} />
    </div>
  );
}
