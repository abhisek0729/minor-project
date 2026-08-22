import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getGuideByUserId } from "@/app/features/guide/services/guide.service";
import GuideSidebar from "@/app/features/guide/components/dashboard/GuideSidebar";
import GuideHeader from "@/app/features/guide/components/dashboard/GuideHeader";
import { db } from "@/app/lib/db";
import { guidesTable } from "@/app/lib/db/schema";

interface GuideLayoutProps {
  children: ReactNode;
}

export default async function GuideDashboardLayout({ children }: GuideLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { getUserRoles } = await import("@/app/features/auth/services/roles.service");
  const userRoles = await getUserRoles(Number(session.user.id));
  const guideRole = userRoles.find((role) => role.name === "guide");

  if (!guideRole) {
    redirect("/unauthorized");
  }

  const guide = await getGuideByUserId(Number(session.user.id));

  if (!guide) {
    redirect("/onboarding/guide");
  }

  const approvalStatus = guideRole.approvalStatus ?? "pending";

  return (
    <div className="flex h-dvh overflow-hidden bg-muted/30">
      <GuideSidebar guide={guide} approvalStatus={approvalStatus} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <GuideHeader
          guideName={guide.name}
          location={guide.location}
          isAvailable={guide.isAvailable ?? true}
          dailyRate={guide.dailyRate ?? 2500}
        />

        {approvalStatus === "pending" && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                <strong>Verification Pending:</strong> Your Tour Guide application is awaiting platform administrator approval. Your profile will be listed publicly on TravelNepal once approved.
              </span>
            </div>
            <span className="font-semibold text-[11px] bg-amber-500/20 px-2 py-0.5 rounded-md">
              Under Review
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
