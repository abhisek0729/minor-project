import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Travel Itinerary Planner for Nepal | Custom Budget & Routes",
  description:
    "Generate personalized, smart day-by-day travel itineraries across Nepal using TravelNepal AI. Instant NPR budget estimation, transit routes, hotel options, and activity guides.",
  keywords: [
    "AI Trip Planner Nepal",
    "Nepal Travel Itinerary Generator",
    "Nepal Budget Calculator",
    "3 Day Trip Nepal Plan",
    "Travelling Nepal Itinerary",
    "Custom Himalayan Tour Route",
  ],
  openGraph: {
    title: "AI Travel Planner & Custom Itinerary Generator | TravelNepal",
    description:
      "Design personalized multi-day trip plans in seconds with AI-powered budget calculations and verified local stays.",
    images: ["https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200"],
  },
  alternates: {
    canonical: "/ai-planner",
  },
};

export default function AiPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
