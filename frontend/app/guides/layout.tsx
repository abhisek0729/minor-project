import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire Certified Himalayan Tour Guides & Trek Leaders in Nepal",
  description:
    "Connect with licensed, verified local tour guides in Nepal. High-altitude mountain leaders, heritage specialists, and wildlife safari naturalists with transparent daily rates.",
  keywords: [
    "Hire Guide Nepal",
    "Licensed Trekking Guide",
    "Sherpa Guides Nepal",
    "Kathmandu Heritage Guide",
    "Annapurna Trek Leader",
    "Chitwan Safari Naturalist",
    "Nepal Tour Guides Booking",
  ],
  openGraph: {
    title: "Certified Tour Guides & Trek Leaders | TravelNepal",
    description:
      "Find and book licensed Himalayan tour guides with verified experience ratings and direct contact info.",
    images: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200"],
  },
  alternates: {
    canonical: "/guides",
  },
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
