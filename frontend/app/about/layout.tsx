import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About TravelNepal | AI-Powered Smart Tourism Ecosystem",
  description:
    "Learn about TravelNepal's mission to digitize tourism across Nepal with verified accommodations, licensed guides, cultural dining, and AI itinerary intelligence.",
  keywords: [
    "About TravelNepal",
    "Nepal Tourism Technology",
    "AI Tourism Nepal Platform",
    "Verified Nepal Travel Network",
  ],
  openGraph: {
    title: "About TravelNepal | Building Modern Tourism in Nepal",
    description:
      "Bridging the gap between travelers, local hospitality partners, and cultural experiences in Nepal.",
    images: ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200"],
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
