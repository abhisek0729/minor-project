import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentic Nepali Food, Thakali & Newari Dining Guide",
  description:
    "Discover the best food spots in Nepal. From traditional Newari feasts in Kathmandu and authentic Thakali thali in Pokhara to organic cafes and mountain bakeries.",
  keywords: [
    "Nepali Food Guide",
    "Thakali Khana Set",
    "Newari Khaja Kathmandu",
    "Pokhara Lakeside Restaurants",
    "Authentic Nepali Cuisine",
    "Where to eat in Nepal",
    "Best momo in Kathmandu",
  ],
  openGraph: {
    title: "Authentic Dining & Food Guide in Nepal | TravelNepal",
    description:
      "Explore curated culinary spots, local food culture, menus, and dining viewpoints across Nepal.",
    images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200"],
  },
  alternates: {
    canonical: "/restaurants",
  },
};

export default function RestaurantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
