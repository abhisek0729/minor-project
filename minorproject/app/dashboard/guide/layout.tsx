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

  const isGuide = session.user.roles?.some((role) => role.name === "guide");
  if (!isGuide) {
    redirect("/unauthorized");
  }

  let guide = await getGuideByUserId(Number(session.user.id));

  if (!guide) {
    // Auto-create guide entry if missing
    const [newGuide] = await db
      .insert(guidesTable)
      .values({
        userId: Number(session.user.id),
        name: session.user.name || "Tour Guide",
        description: "Certified mountain and cultural tour guide in Nepal.",
        location: "Kathmandu, Nepal",
        phoneNumber: "9800000000",
        guideImageUrl: "",
        experienceYears: 2,
        languages: "Nepali, English",
        dailyRate: 2500,
        isAvailable: true,
      })
      .returning();

    guide = newGuide;
  }

  const guideRole = session.user.roles?.find((r) => r.name === "guide");
  const approvalStatus = guideRole?.approvalStatus ?? "approved";

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

        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
