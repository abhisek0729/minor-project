import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getUserRoles } from "@/app/features/auth/services/roles.service";
import AdminSidebar from "@/app/features/admin/components/dashboard/AdminSidebar";
import AdminHeader from "@/app/features/admin/components/dashboard/AdminHeader";
import { getPendingApprovals } from "@/app/features/admin/actions/admin.action";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Get live roles from session or database fallback
  const userRoles =
    session.user.roles || (await getUserRoles(Number(session.user.id)));

  const adminRole = userRoles.find((r) => r.name === "admin");

  if (!adminRole) {
    redirect("/unauthorized");
  }

  if (adminRole.approvalStatus !== "approved") {
    redirect("/dashboard/admin/pending");
  }

  let pendingCount = 0;
  try {
    const pendingRes = await getPendingApprovals();
    if (pendingRes.success && pendingRes.data) {
      pendingCount =
        (pendingRes.data.restaurants?.length || 0) +
        (pendingRes.data.hotels?.length || 0) +
        (pendingRes.data.guides?.length || 0);
    }
  } catch (error) {
    console.error("Failed to count pending requests:", error);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-muted/30">
      <AdminSidebar
        adminName={session.user.name ?? "Administrator"}
        pendingCount={pendingCount}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          adminName={session.user.name ?? "Administrator"}
          adminEmail={session.user.email ?? ""}
          pendingCount={pendingCount}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
