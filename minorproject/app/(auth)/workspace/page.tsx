import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import WorkspaceSelector from "@/app/features/auth/components/WorkSpaceSelector";

function getDashboardPath(role: string) {
  switch (role) {
    case "tourist":
      return "/dashboard/tourist";

    case "hotelOwner":
      return "/dashboard/hotels";

    case "restaurantOwner":
      return "/dashboard/restaurant";

    case "guide":
      return "/dashboard/guide";

    case "admin":
      return "/dashboard/admin";

    default:
      return "/";
  }
}

export default async function WorkspacePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const roles = session.user.roles ?? [];

  if (roles.length === 0) {
    redirect("/");
  }

  if (roles.length === 1) {
    redirect(getDashboardPath(roles[0].name));
  }

  const user_roles = roles.map((role) => role.name);
  console.log("User Roles:", user_roles);

  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center px-6 py-12">
      <WorkspaceSelector
        userName={session.user.name ?? ""}
        roles={user_roles}
      />
    </main>
  );
}