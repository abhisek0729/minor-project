import { unstable_cache } from "next/cache";
import { db } from "@/app/lib/db";
import { destinationsTable, hotelsTable, restaurantsTable, guidesTable, roomsTable } from "@/app/lib/db/schema";
import { sql } from "drizzle-orm";
import destinationsData from "@/app/lib/db/destinations-data.json";

export interface LandingData {
  featuredHotels: any[];
  featuredRestaurants: any[];
  featuredDestinations: any[];
  featuredGuides: any[];
}

const FALLBACK_HOTEL_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=75";
const FALLBACK_RESTAURANT_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=75";
const FALLBACK_DESTINATION_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=75";
const FALLBACK_GUIDE_IMAGE = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=75";

function sanitizeImageUrl(url: string | null | undefined, fallback: string): string {
  if (!url || typeof url !== "string" || url.trim() === "" || url.includes("1623880840102")) {
    return fallback;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export const getCachedLandingData = unstable_cache(
  async (): Promise<LandingData> => {
    try {
      // 1. Fetch live database records
      const [dbHotels, dbRestaurants, dbDestinations, dbGuides] = await Promise.all([
        db
          .select({
            id: hotelsTable.id,
            name: hotelsTable.name,
            description: hotelsTable.description,
            coverImageUrl: hotelsTable.coverImageUrl,
            district: hotelsTable.district,
            province: hotelsTable.province,
            minPrice: sql<number>`MIN(${roomsTable.pricePerNight})`,
          })
          .from(hotelsTable)
          .leftJoin(roomsTable, sql`${roomsTable.hotelId} = ${hotelsTable.id}`)
          .groupBy(
            hotelsTable.id,
            hotelsTable.name,
            hotelsTable.description,
            hotelsTable.coverImageUrl,
            hotelsTable.district,
            hotelsTable.province
          )
          .limit(12),
        db.select().from(restaurantsTable).limit(12),
        db.select().from(destinationsTable).limit(12),
        db.select().from(guidesTable).limit(12),
      ]);

      const featuredHotels = dbHotels.map((h) => ({
        id: String(h.id),
        title: h.name,
        subtitle: (h.description || "Top rated accommodation in Nepal").slice(0, 55) + "...",
        price: h.minPrice ? `NPR ${Number(h.minPrice).toLocaleString()} / night` : "NPR 3,500 / night",
        rating: 4.9,
        image: sanitizeImageUrl(h.coverImageUrl, FALLBACK_HOTEL_IMAGE),
        tag: "Verified Stay",
        location: `${h.district || "Nepal"}, ${h.province || "Nepal"}`,
      }));

      const featuredRestaurants = dbRestaurants.map((r) => ({
        id: String(r.id),
        title: r.name,
        subtitle: r.cuisine || "Authentic Nepali & Multi-Cuisine",
        price: "NPR 650 / set",
        rating: 4.8,
        image: sanitizeImageUrl(r.restaurantImageUrl, FALLBACK_RESTAURANT_IMAGE),
        tag: r.isOpen ? "Open Now" : "Popular Choice",
        location: r.location || "Nepal",
      }));

      const featuredDestinations = (dbDestinations.length > 0 ? dbDestinations : destinationsData.slice(0, 12)).map((d: any) => ({
        id: String(d.id),
        title: d.name,
        subtitle: d.shortDescription ? d.shortDescription.slice(0, 55) + "..." : "Scenic Himalayan wonder",
        price: d.startingCost || "Free access",
        rating: d.rating || 4.9,
        image: sanitizeImageUrl(d.coverImage, FALLBACK_DESTINATION_IMAGE),
        tag: d.category || "Must Visit",
        location: d.region || "Nepal",
      }));

      const featuredGuides = dbGuides.map((g) => ({
        id: String(g.id),
        title: g.name,
        subtitle: `${g.experienceYears || 5}+ years certified Himalayan leader`,
        price: `NPR ${(g.dailyRate || 3500).toLocaleString()} / day`,
        rating: 5.0,
        image: sanitizeImageUrl(g.guideImageUrl, FALLBACK_GUIDE_IMAGE),
        tag: "Certified Guide",
        location: g.location || "Kathmandu / Pokhara",
      }));

      return {
        featuredHotels,
        featuredRestaurants,
        featuredDestinations,
        featuredGuides,
      };
    } catch (error) {
      console.warn("Falling back to pre-seeded static landing cache:", error);
      return {
        featuredHotels: [],
        featuredRestaurants: [],
        featuredDestinations: destinationsData.slice(0, 12).map((d: any) => ({
          id: String(d.id),
          title: d.name,
          subtitle: d.shortDescription.slice(0, 55) + "...",
          price: d.startingCost,
          rating: d.rating,
          image: sanitizeImageUrl(d.coverImage, FALLBACK_DESTINATION_IMAGE),
          tag: d.category,
          location: d.region,
        })),
        featuredGuides: [],
      };
    }
  },
  ["landing-featured-catalog-v4"],
  {
    revalidate: 3600, // 1 hour edge cache with instant CDN delivery
    tags: ["landing", "hotels", "destinations", "restaurants"],
  }
);
