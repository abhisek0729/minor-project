import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getHotelByOwnerId } from "@/app/features/hotel/actions/getHotelByOwnerId";
import HotelSettingsForm from "@/app/features/hotel/components/settings/HotelSettingsForm";

export default async function HotelSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const hotel = await getHotelByOwnerId(Number(session.user.id));

  if (!hotel) {
    redirect("/onboarding/hotel");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hotel Profile & Property Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your hotel's public information, cover photo, location contact, and check-in / check-out policies.
        </p>
      </div>

      <HotelSettingsForm
        initialData={{
          name: hotel.name,
          phoneNumber: hotel.phoneNumber,
          description: hotel.description,
          district: hotel.district,
          province: hotel.province,
          street: hotel.street,
          coverImageUrl: hotel.coverImageUrl || "",
          latitude: hotel.latitude,
          longitude: hotel.longitude,
        }}
      />
    </div>
  );
}
