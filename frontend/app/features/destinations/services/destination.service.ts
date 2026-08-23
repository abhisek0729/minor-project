import { db } from "@/app/lib/db";
import { destinationsTable } from "@/app/lib/db/schema";
import { asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import fallbackDestinations from "@/app/lib/db/destinations-data.json";

export type DestinationItem = {
  id: number;
  name: string;
  region: string;
  category: string;
  altitude?: string | null;
  bestSeason?: string | null;
  rating?: number | null;
  reviews?: number | null;
  startingCost?: string | null;
  coverImage: string;
  shortDescription: string;
  historyAndCulture?: string | null;
  activities?: string[] | null;
  highlights?: string[] | null;
  mapQuery?: string | null;
  nearbyAttractions?: any[] | null;
};

/**
 * Get all destinations with search & filter support from DB (with fallback to local JSON)
 */
export async function getAllDestinations(options?: {
  search?: string;
  category?: string;
  region?: string;
  limit?: number;
}): Promise<DestinationItem[]> {
  try {
    const conditions: any[] = [];

    if (options?.search) {
      const q = `%${options.search.trim().toLowerCase()}%`;
      conditions.push(
        or(
          ilike(destinationsTable.name, q),
          ilike(destinationsTable.region, q),
          ilike(destinationsTable.shortDescription, q),
          ilike(destinationsTable.category, q)
        )
      );
    }

    if (options?.category && options.category !== "all") {
      conditions.push(eq(destinationsTable.category, options.category));
    }

    if (options?.region && options.region !== "all") {
      conditions.push(eq(destinationsTable.region, options.region));
    }

    let query = db.select().from(destinationsTable);
    
    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(sql.join(conditions, sql` AND `));
    }

    // @ts-ignore
    query = query.orderBy(asc(destinationsTable.id));

    if (options?.limit) {
      // @ts-ignore
      query = query.limit(options.limit);
    }

    const rows = await query;
    if (rows && rows.length > 0) {
      return rows as unknown as DestinationItem[];
    }
  } catch (error) {
    console.warn("DB Destination query fallback to JSON:", error);
  }

  // Fallback to in-memory JSON data
  let filtered = [...fallbackDestinations] as DestinationItem[];

  if (options?.search) {
    const s = options.search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(s) ||
        d.region.toLowerCase().includes(s) ||
        d.shortDescription.toLowerCase().includes(s) ||
        d.category.toLowerCase().includes(s)
    );
  }

  if (options?.category && options.category !== "all") {
    filtered = filtered.filter((d) => d.category === options.category);
  }

  if (options?.region && options.region !== "all") {
    filtered = filtered.filter((d) => d.region === options.region);
  }

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

/**
 * Get single destination detail by ID
 */
export async function getDestinationById(id: number): Promise<DestinationItem | null> {
  try {
    const [row] = await db
      .select()
      .from(destinationsTable)
      .where(eq(destinationsTable.id, id));

    if (row) {
      return row as unknown as DestinationItem;
    }
  } catch (error) {
    console.warn(`DB getDestinationById(${id}) fallback:`, error);
  }

  const fallback = (fallbackDestinations as DestinationItem[]).find((d) => d.id === id);
  return fallback || null;
}
