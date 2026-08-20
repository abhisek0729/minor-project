import { getPendingApprovals } from "@/app/features/admin/actions/admin.action";
import PendingApprovalsTable from "@/app/features/admin/components/approvals/PendingApprovalsTable";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const pendingRes = await getPendingApprovals();

  const pendingRestaurants = pendingRes.data?.restaurants || [];
  const pendingHotels = pendingRes.data?.hotels || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Partner Verification & Approvals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review restaurant and hotel partner registrations. Approving an account grants full dashboard access and lists their establishment on the public tourism portal.
        </p>
      </div>

      <PendingApprovalsTable
        initialRestaurants={pendingRestaurants}
        initialHotels={pendingHotels}
      />
    </div>
  );
}
