import { redirect } from "next/navigation";

export default function HotelSettingsPage() {
  redirect("/dashboard/hotels");
  return null;
}
