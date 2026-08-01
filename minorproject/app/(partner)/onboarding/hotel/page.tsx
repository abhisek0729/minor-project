import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import HotelOnboardingForm from "@/app/features/hotel/components/HotelOnboardingForm";
import { getFacilities } from "@/app/features/hotel/actions/getFacilities";
import { getHotelByOwnerId } from "@/app/features/hotel/actions/getHotelByOwnerId";

export default async function HotelOnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if(!session?.user?.roles?.some((role) => role.name === "hotelOwner")){
    redirect("/unauthorized")
  }

  const hotel = await getHotelByOwnerId(Number(session.user.id));

  if (hotel) {
    redirect("/dashboard/hotels");
  }

  const result = await getFacilities();

  if (!result.success) {
    throw new Error(result.message);
  }

  return <HotelOnboardingForm facilities={result.data} />;
}