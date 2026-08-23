import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "150+ Top Nepal Destinations, Trekking Routes & Viewpoints",
  description:
    "Explore over 150 curated travel destinations across Nepal. Filter by province, elevation, trekking trails (Annapurna, EBC, Langtang), lakes, and UNESCO World Heritage sites.",
  keywords: [
    "Nepal Destinations",
    "Nepal Trekking Routes",
    "Pokhara Viewpoints",
    "Everest Base Camp",
    "Annapurna Circuit",
    "Mustang Caves",
    "Lumbini Birthplace",
    "Chitwan National Park",
    "Bhedetar Dharan",
    "Travelling Nepal Places",
  ],
  openGraph: {
    title: "150+ Top Nepal Destinations & Trekking Trails | TravelNepal",
    description:
      "Explore curated travel destinations, alpine viewpoints, and heritage monuments across all 7 provinces of Nepal.",
    images: ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200"],
  },
  alternates: {
    canonical: "/destinations",
  },
};

export default function DestinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
