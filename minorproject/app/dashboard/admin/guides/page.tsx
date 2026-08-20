import { getAllGuidesAdmin } from "@/app/features/admin/actions/admin.action";
import AdminGuidesTable from "@/app/features/admin/components/guides/AdminGuidesTable";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  const res = await getAllGuidesAdmin();
  const guides = res.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide Partner Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Verify licenses, view rates and languages, and control approval statuses for tour guides.
        </p>
      </div>

      <AdminGuidesTable initialGuides={guides} />
    </div>
  );
}
