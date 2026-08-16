import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const roles = session.user.roles || [];

  if (roles.some((r) => r.name === "admin")) {
    redirect("/dashboard/admin");
  }

  if (roles.some((r) => r.name === "restaurantOwner")) {
    redirect("/dashboard/restaurant");
  }

  if (roles.some((r) => r.name === "hotelOwner")) {
    redirect("/dashboard/hotels");
  }

  if (roles.length > 1) {
    redirect("/workspace");
  }

  redirect("/profile");
}
