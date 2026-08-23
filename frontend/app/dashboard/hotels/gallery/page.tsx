import { redirect } from "next/navigation";

export default function HotelGalleryPage() {
  redirect("/dashboard/hotels");
  return null;
}
