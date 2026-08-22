import { getAllGuidesAdmin } from "@/app/features/admin/actions/admin.action";
import AdminGuidesTable from "@/app/features/admin/components/guides/AdminGuidesTable";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  const res = await getAllGuidesAdmin();
  const guides = res.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tour Guides Directory</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View registered tour guides, inspect profiles, daily rates, languages, and manage workspaces.
        </p>
      </div>

      <AdminGuidesTable initialGuides={guides} />
    </div>
  );
}
