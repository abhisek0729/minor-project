import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getMenuItems } from "@/app/features/restaurant/actions/menu.action";
import MenuTable from "@/app/features/restaurant/components/menu/MenuTable";

export default async function RestaurantMenuPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const isOwner = session.user.roles?.some(
    (role) => role.name === "restaurantOwner"
  );

  if (!isOwner) {
    redirect("/unauthorized");
  }

  const menuResult = await getMenuItems();
  const menuItems = menuResult.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Menu Items Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add new dishes, customize categories, update prices, and control real-time dish availability.
        </p>
      </div>

      <MenuTable initialItems={menuItems} />
    </div>
  );
}
