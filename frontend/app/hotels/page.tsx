import { eq } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { hotelsTable, roomsTable } from "@/app/lib/db/schema";
import HotelsClientView, { HotelListing } from "./components/HotelsClientView";

export const dynamic = "force-dynamic";

export default async function HotelsPage() {
  let hotels: HotelListing[] = [];

  try {
    if (db) {
      const dbHotels = await db.select().from(hotelsTable);

      hotels = await Promise.all(
        dbHotels.map(async (h: typeof hotelsTable.$inferSelect) => {
          const rooms = await db
            .select()
            .from(roomsTable)
            .where(eq(roomsTable.hotelId, h.id));

          const startingPrice = rooms.length > 0
            ? Math.min(...rooms.map((r: any) => Number(r.pricePerNight)))
            : 3500;

          // Categorize by location / name keywords
          let category = "City Hotels";
          const hName = h.name.toLowerCase();
          const hDist = h.district.toLowerCase();

          if (hName.includes("resort") || hDist.includes("pokhara") || hDist.includes("phewa")) {
            category = "Lakeside Resorts";
          } else if (hName.includes("lodge") || hDist.includes("namche") || hDist.includes("mustang") || hDist.includes("everest")) {
            category = "Himalayan Lodges";
          } else if (hName.includes("heritage") || hDist.includes("bhaktapur") || hDist.includes("patan") || hDist.includes("lalitpur") || hDist.includes("dharan")) {
            category = "Boutique Heritage";
          } else if (hName.includes("wildlife") || hName.includes("eco") || hDist.includes("chitwan") || hDist.includes("sauraha")) {
            category = "Eco Retreats";
          }

          return {
            id: h.id,
            name: h.name,
            description: h.description,
            district: h.district,
            province: h.province || "Nepal",
            street: h.street || "Main Road",
            phoneNumber: h.phoneNumber || "+977 1-4200000",
            roomsCount: rooms.length || 1,
            startingPrice,
            category,
            rating: 4.8,
            coverImage:
              h.coverImageUrl ||
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
          };
        })
      );
    }
  } catch (error) {
    console.error("Failed to fetch hotels from database:", error);
  }

  return <HotelsClientView initialHotels={hotels} />;
}
