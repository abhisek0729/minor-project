import { getAllDestinationsAdmin } from "@/app/features/admin/actions/destination-admin.action";
import AdminDestinationsTable from "@/app/features/admin/components/destinations/AdminDestinationsTable";

export const dynamic = "force-dynamic";

export default async function AdminDestinationsPage() {
  const res = await getAllDestinationsAdmin();
  const destinations = res.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Destinations Catalog & Hotspots</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage, add, and publish destinations, trekking spots, and cultural landmarks across Nepal.
        </p>
      </div>

      <AdminDestinationsTable initialDestinations={destinations} />
    </div>
  );
}
