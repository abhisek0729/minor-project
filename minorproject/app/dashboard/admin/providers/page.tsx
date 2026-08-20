import { getAllTravelProvidersAdmin } from "@/app/features/admin/actions/admin.action";
import AdminProvidersTable from "@/app/features/admin/components/providers/AdminProvidersTable";

export const dynamic = "force-dynamic";

export default async function AdminTravelProvidersPage() {
  const res = await getAllTravelProvidersAdmin();
  const providers = res.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Travel Providers & Agencies</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage and verify registered travel agencies, transport operators, and expedition organizers.
        </p>
      </div>

      <AdminProvidersTable initialProviders={providers} />
    </div>
  );
}
