import { getAllRestaurantsAdmin } from "@/app/features/admin/actions/admin.action";
import AdminRestaurantsTable from "@/app/features/admin/components/restaurants/AdminRestaurantsTable";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
  const result = await getAllRestaurantsAdmin();
  const restaurants = result.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage All Restaurants</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View all registered dining businesses across Nepal, check their status, and manage partner accounts.
        </p>
      </div>

      <AdminRestaurantsTable initialRestaurants={restaurants} />
    </div>
  );
}
