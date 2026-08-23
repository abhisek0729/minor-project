import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Verified Hotels & Stays in Nepal | Instant Khalti Payment",
  description:
    "Find and book verified boutique hotels, mountain lodges, and lakeside resorts across Pokhara, Kathmandu, Chitwan, and Dharan. Instant reservation confirmation with Khalti digital wallet.",
  keywords: [
    "Hotels in Nepal",
    "Pokhara Hotels",
    "Kathmandu Stays",
    "Lakeside Resort Pokhara",
    "Boutique Heritage Hotels Nepal",
    "Khalti Hotel Booking",
    "Budget Lodges Nepal",
    "Nepal Hotel Reservation",
  ],
  openGraph: {
    title: "Verified Hotels & Lodges in Nepal | TravelNepal",
    description:
      "Direct verified hotel bookings across Nepal with starting prices, room amenities, and digital Khalti checkout.",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200"],
  },
  alternates: {
    canonical: "/hotels",
  },
};

export default function HotelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
