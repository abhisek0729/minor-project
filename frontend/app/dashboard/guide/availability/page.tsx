import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  getGuideAvailability,
  getGuideByUserId,
} from "@/app/features/guide/services/guide.service";
import GuideAvailabilityManager from "@/app/features/guide/components/availability/GuideAvailabilityManager";

export default async function GuideAvailabilityPage() {
  const session = await getServerSession(authOptions);
  const guide = await getGuideByUserId(Number(session?.user?.id));

  if (!guide) {
    return <div>Guide not found</div>;
  }

  const availabilityList = await getGuideAvailability(guide.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Guide Availability & Trekking Schedule
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Mark dates when you are free to guide travelers or busy on an expedition.
        </p>
      </div>

      <GuideAvailabilityManager
        initialIsAvailable={guide.isAvailable ?? true}
        initialSchedule={availabilityList}
      />
    </div>
  );
}
