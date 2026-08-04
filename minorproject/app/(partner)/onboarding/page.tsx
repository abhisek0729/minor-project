// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { getServerSession } from "next-auth";

// import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// export default async function OnboardingPage() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     redirect("/sign-in");
//   }

//   const cookieStore = await cookies();
//   const partnerRole = cookieStore.get("partner_role")?.value;

//   const userRoles = session.user.roles;

//   if(userRoles!.length > 1) {
//     redirect("/dashboard/tourist");
//   }

//   switch (partnerRole) {
//     case "hotelOwner":
//       redirect("/onboarding/hotel");

//     case "restaurantOwner":
//       redirect("/onboarding/restaurant");

//     case "guide":
//       redirect("/onboarding/guide");

//     default:
//       redirect("/dashboard/tourist");
//   }
// }