import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getGuideByUserId } from "@/app/features/guide/services/guide.service";
import GuideProfileForm from "@/app/features/guide/components/settings/GuideProfileForm";

export default async function GuideSettingsPage() {
  const session = await getServerSession(authOptions);
  const guide = await getGuideByUserId(Number(session?.user?.id));

  if (!guide) {
    return <div>Guide profile not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guide Profile & Credentials</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update your public bio, spoken languages, daily guiding rates, and official license details.
        </p>
      </div>

      <GuideProfileForm initialGuide={guide} />
    </div>
  );
}
