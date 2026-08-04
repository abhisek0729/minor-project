import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getHotelByOwnerId } from "@/app/features/hotel/actions/getHotelByOwnerId";
import { Header } from "@/app/features/hotel/components/dashboard/Header";
import { Sidebar } from "@/app/features/hotel/components/dashboard/Sidebar";

interface HotelDashboardLayoutProps {
  children: ReactNode;
}


export default async function HotelDashboardLayout({
  children,
}: HotelDashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const isHotelOwner = session?.user?.roles!.some(
    (role) => role.name === "hotelOwner"
  );


  if (!isHotelOwner) {
    redirect("/unauthorized");
  }

  const hotel = await getHotelByOwnerId(Number(session.user.id));

  if (!hotel) {
    redirect("/onboarding/hotel");
  }

  const hotelRole = session.user.roles!.find(
    (role) => role.name === "hotelOwner"
  );

  const approvalStatus = hotelRole!.approvalStatus;

return (
  <div className="flex h-dvh overflow-hidden bg-muted/30">
    <Sidebar hotel={hotel} approvalStatus={approvalStatus} />

    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        hotelName={hotel.name}
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
        approvalStatus={approvalStatus}
        
      />

      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  </div>
);
}