import { db } from "@/app/lib/db";
import { rolesTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";

const roles = [
  { name: "tourist" as const },
  { name: "hotelOwner" as const },
  { name: "restaurantOwner" as const },
  { name: "guide" as const },
  { name: "admin" as const },
];

async function seedRoles() {
  try {
    console.log("Starting to seed roles...");

    for (const role of roles) {
      // Check if role already exists
      const existingRole = await db
        .select()
        .from(rolesTable)
        .where(eq(rolesTable.name, role.name));

      if (existingRole.length === 0) {
        await db.insert(rolesTable).values(role);
        console.log(`✓ Inserted role: ${role.name}`);
      } else {
        console.log(`✓ Role already exists: ${role.name}`);
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding roles:", error);
    process.exit(1);
  }
}

seedRoles();
