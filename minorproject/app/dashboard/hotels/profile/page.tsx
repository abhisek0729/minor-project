import { redirect } from "next/navigation";

export default function HotelProfileRedirectPage() {
  redirect("/dashboard/hotels/settings");
}
