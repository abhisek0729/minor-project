import { getAllUsersAdmin } from "@/app/features/admin/actions/admin.action";
import AdminUsersTable from "@/app/features/admin/components/users/AdminUsersTable";

export default async function AdminUsersPage() {
  const result = await getAllUsersAdmin();
  const users = result.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registered Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View all registered accounts on the TravelNepal platform.
        </p>
      </div>

      <AdminUsersTable initialUsers={users} />
    </div>
  );
}
