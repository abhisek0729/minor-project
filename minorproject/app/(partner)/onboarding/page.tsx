import { redirect } from "next/navigation";

export default function OnboardingPage() {
  redirect("/onboarding/hotel");
  return null;
}
