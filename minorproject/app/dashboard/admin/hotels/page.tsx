import { getAllHotelsAdmin } from "@/app/features/admin/actions/admin.action";
import AdminHotelsTable from "@/app/features/admin/components/hotels/AdminHotelsTable";

export const dynamic = "force-dynamic";

export default async function AdminHotelsPage() {
  const result = await getAllHotelsAdmin();
  const hotels = result.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage All Hotels & Resorts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View all registered accommodations across Nepal and control hotel partner listings.
        </p>
      </div>

      <AdminHotelsTable initialHotels={hotels} />
    </div>
  );
}
