import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getGuideByUserId } from "@/app/features/guide/services/guide.service";
import GuideOnboardingForm from "@/app/features/guide/components/onboarding/GuideOnboardingForm";

export default async function GuideOnboardingPage() {
  const session = await getServerSession(authOptions);

  // 1. Unauthenticated Check
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // 2. Unauthorized Check
  const isGuide = session.user.roles?.some((role) => role.name === "guide");
  if (!isGuide) {
    redirect("/unauthorized");
  }

  // 3. Already Onboarded Check
  const existingGuide = await getGuideByUserId(Number(session.user.id));
  if (existingGuide) {
    redirect("/dashboard/guide");
  }

  return (
    <main className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <GuideOnboardingForm
          userEmail={session.user.email ?? ""}
          defaultName={session.user.name ?? ""}
        />
      </div>
    </main>
  );
}
