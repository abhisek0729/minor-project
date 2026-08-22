import { db } from "./index";
import { destinationsTable, hotelsTable, restaurantsTable, guidesTable, roomsTable, menusTable, packagesTable } from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  const [d] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(destinationsTable);
  const [h] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(hotelsTable);
  const [r] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(restaurantsTable);
  const [g] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(guidesTable);
  const [rooms] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(roomsTable);
  const [menus] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(menusTable);
  const [pkgs] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(packagesTable);

  console.log("📊 PostgreSQL Database Summary:");
  console.log("-----------------------------------------");
  console.log(`🗺️ Destinations:      ${d?.count}`);
  console.log(`🏨 Hotels:            ${h?.count} (with ${rooms?.count} rooms)`);
  console.log(`🍽️ Restaurants:       ${r?.count} (with ${menus?.count} menu items)`);
  console.log(`🧭 Tour Guides:       ${g?.count} (with ${pkgs?.count} trekking packages)`);
  console.log("-----------------------------------------");
}

main().then(() => process.exit(0)).catch(console.error);
