import { db } from "./index";
import { sql } from "drizzle-orm";
import destinationsData from "./destinations-data.json";

export async function seedDestinations() {
  console.log(`Starting to batch seed ${destinationsData.length} destinations into database...`);

  // Ensure table exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      region VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      altitude VARCHAR(100),
      best_season VARCHAR(255),
      rating DOUBLE PRECISION DEFAULT 4.8,
      reviews INTEGER DEFAULT 100,
      starting_cost VARCHAR(100),
      cover_image TEXT NOT NULL,
      short_description TEXT NOT NULL,
      history_and_culture TEXT,
      activities JSONB,
      highlights JSONB,
      map_query TEXT,
      nearby_attractions JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // Batch insert in chunks of 25
  const chunkSize = 25;
  for (let i = 0; i < destinationsData.length; i += chunkSize) {
    const chunk = destinationsData.slice(i, i + chunkSize);
    
    // Construct single multi-row query
    const valuesClauses = chunk.map((item) => {
      return sql`(${item.id}, ${item.name}, ${item.region}, ${item.category}, ${item.altitude}, ${item.bestSeason}, ${item.rating}, ${item.reviews}, ${item.startingCost}, ${item.coverImage}, ${item.shortDescription}, ${item.historyAndCulture}, ${JSON.stringify(item.activities)}::jsonb, ${JSON.stringify(item.highlights)}::jsonb, ${item.mapQuery}, ${JSON.stringify(item.nearbyAttractions)}::jsonb, NOW())`;
    });

    await db.execute(sql`
      INSERT INTO destinations (
        id, name, region, category, altitude, best_season, rating, reviews, starting_cost,
        cover_image, short_description, history_and_culture, activities, highlights, map_query, nearby_attractions, created_at
      )
      VALUES ${sql.join(valuesClauses, sql`, `)}
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        region = EXCLUDED.region,
        category = EXCLUDED.category,
        altitude = EXCLUDED.altitude,
        best_season = EXCLUDED.best_season,
        rating = EXCLUDED.rating,
        reviews = EXCLUDED.reviews,
        starting_cost = EXCLUDED.starting_cost,
        cover_image = EXCLUDED.cover_image,
        short_description = EXCLUDED.short_description,
        history_and_culture = EXCLUDED.history_and_culture,
        activities = EXCLUDED.activities,
        highlights = EXCLUDED.highlights,
        map_query = EXCLUDED.map_query,
        nearby_attractions = EXCLUDED.nearby_attractions;
    `);

    console.log(`Seeded chunk ${i + 1} to ${Math.min(i + chunkSize, destinationsData.length)}...`);
  }

  console.log(`✅ Successfully seeded all ${destinationsData.length} destinations into PostgreSQL database!`);
}

// Run if called directly
if (require.main === module || process.argv[1]?.includes("seed-destinations")) {
  seedDestinations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to seed destinations:", err);
      process.exit(1);
    });
}
