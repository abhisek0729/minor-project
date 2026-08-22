import Navbar from "./features/landing/components/Navbar";
import Hero from "./features/landing/components/Hero";
import ModuleExplorer from "./features/landing/components/ModuleExplorer";
import Footer from "./features/landing/components/Footer";
import CTA from "./features/landing/components/CTA";
import { db } from "./lib/db";
import { destinationsTable, hotelsTable, restaurantsTable, guidesTable, roomsTable } from "./lib/db/schema";
import { eq } from "drizzle-orm";

export const revalidate = 60; // revalidate every 60 seconds

export default async function Home() {
  let featuredHotels: any[] = [];
  let featuredRestaurants: any[] = [];
  let featuredDestinations: any[] = [];
  let featuredGuides: any[] = [];

  try {
    const [dbHotels, dbRestaurants, dbDestinations, dbGuides] = await Promise.all([
      db.select().from(hotelsTable).limit(3),
      db.select().from(restaurantsTable).limit(3),
      db.select().from(destinationsTable).limit(3),
      db.select().from(guidesTable).limit(3),
    ]);

    featuredHotels = await Promise.all(
      dbHotels.map(async (h) => {
        const [room] = await db
          .select()
          .from(roomsTable)
          .where(eq(roomsTable.hotelId, h.id))
          .limit(1);

        return {
          id: String(h.id),
          title: h.name,
          subtitle: h.description.slice(0, 55) + "...",
          price: room?.pricePerNight ? `NPR ${Number(room.pricePerNight).toLocaleString()} / night` : "NPR 4,500 / night",
          rating: 4.9,
          image: h.coverImageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
          tag: "Verified Stay",
          location: `${h.district}, ${h.province || "Nepal"}`,
        };
      })
    );

    featuredRestaurants = dbRestaurants.map((r) => ({
      id: String(r.id),
      title: r.name,
      subtitle: r.cuisine || "Authentic Nepali & Multi-Cuisine",
      price: "NPR 650 / set",
      rating: 4.8,
      image: r.restaurantImageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",
      tag: r.isOpen ? "Open Now" : "Popular Choice",
      location: r.location || "Nepal",
    }));

    featuredDestinations = dbDestinations.map((d) => ({
      id: String(d.id),
      title: d.name,
      subtitle: d.shortDescription ? d.shortDescription.slice(0, 55) + "..." : "Scenic Himalayan wonder",
      price: d.startingCost || "Free access",
      rating: d.rating || 4.9,
      image: d.coverImage || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200",
      tag: d.category || "Must Visit",
      location: d.region || "Nepal",
    }));

    featuredGuides = dbGuides.map((g) => ({
      id: String(g.id),
      title: g.name,
      subtitle: `${g.experienceYears || 5}+ years certified Himalayan leader`,
      price: `NPR ${(g.dailyRate || 3500).toLocaleString()} / day`,
      rating: 5.0,
      image: g.guideImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800",
      tag: "Certified Guide",
      location: g.location || "Kathmandu / Pokhara",
    }));
  } catch (error) {
    console.error("Failed to load featured landing data:", error);
  }

  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <Hero />
      <ModuleExplorer
        featuredHotels={featuredHotels}
        featuredRestaurants={featuredRestaurants}
        featuredDestinations={featuredDestinations}
        featuredGuides={featuredGuides}
      />
      <CTA />
      <Footer />
    </div>
  );
}
