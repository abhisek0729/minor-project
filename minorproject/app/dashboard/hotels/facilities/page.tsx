import { redirect } from "next/navigation";

export default function HotelFacilitiesPage() {
  redirect("/dashboard/hotels");
  return null;
}
