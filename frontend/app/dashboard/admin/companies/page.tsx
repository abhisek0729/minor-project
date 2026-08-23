import { Building2, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { getAllCompaniesAdmin } from "@/app/features/admin/actions/admin.action";
import CompaniesTable from "@/app/features/admin/components/companies/CompaniesTable";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const companiesRes = await getAllCompaniesAdmin();
  const companies = companiesRes.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="size-6 text-primary" />
            Companies & Partner Workspaces
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Super Admin directory of all verified and pending hotel businesses, restaurants, tour guides, and travel agencies across Nepal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/approvals">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 rounded-xl cursor-pointer">
              Review Approvals Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Companies Table with Modals */}
      <CompaniesTable initialCompanies={companies} />
    </div>
  );
}
