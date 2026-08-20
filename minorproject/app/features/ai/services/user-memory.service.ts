import { db } from "@/app/lib/db";
import {
  aiUserMemoriesTable,
  bookingsTable,
  expensesTable,
  guidesTable,
  hotelsTable,
  restaurantsTable,
  usersTable,
} from "@/app/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export interface UserMemoryProfile {
  userId: number;
  userName: string;
  userRoles: string[];
  recentDestinations: string[];
  totalTrackedExpenses: number;
  topExpenseCategory: string;
  spendingHabit: string;
  ownedBusinesses: {
    hotel?: string;
    restaurant?: string;
    guide?: string;
  };
  customPreferences: Record<string, string>;
  summaryPromptText: string;
}

export async function getUserMemoryProfile(
  userId: number,
  userName: string,
  userRoles: string[]
): Promise<UserMemoryProfile> {
  try {
    // 1. Fetch bookings, expenses, partner businesses & saved memories concurrently
    const [bookings, expenses, hotels, restaurants, guides, memories] =
      await Promise.all([
        db
          .select()
          .from(bookingsTable)
          .where(eq(bookingsTable.userId, userId))
          .orderBy(desc(bookingsTable.createdAt))
          .limit(5),
        db
          .select()
          .from(expensesTable)
          .where(eq(expensesTable.userId, userId))
          .orderBy(desc(expensesTable.createdAt))
          .limit(20),
        db
          .select()
          .from(hotelsTable)
          .where(eq(hotelsTable.userId, userId))
          .limit(1),
        db
          .select()
          .from(restaurantsTable)
          .where(eq(restaurantsTable.userId, userId))
          .limit(1),
        db
          .select()
          .from(guidesTable)
          .where(eq(guidesTable.userId, userId))
          .limit(1),
        db
          .select()
          .from(aiUserMemoriesTable)
          .where(eq(aiUserMemoriesTable.userId, userId)),
      ]);

    // 2. Aggregate Recent Destinations
    const destinationsSet = new Set<string>();
    for (const b of bookings) {
      if (b.itemName) destinationsSet.add(b.itemName);
    }
    for (const e of expenses) {
      if (e.location && e.location !== "Nepal") destinationsSet.add(e.location);
    }

    // 3. Aggregate Expenses & Spending Tier
    let totalExpenses = 0;
    const categoryTotals: Record<string, number> = {};
    for (const e of expenses) {
      totalExpenses += e.amount;
      categoryTotals[e.type] = (categoryTotals[e.type] || 0) + e.amount;
    }

    let topCategory = "General Sightseeing";
    let maxCatVal = 0;
    for (const [cat, val] of Object.entries(categoryTotals)) {
      if (val > maxCatVal) {
        maxCatVal = val;
        topCategory = cat;
      }
    }

    let spendingHabit = "Balanced Explorer";
    if (totalExpenses > 30000) {
      spendingHabit = "Premium & Comfort Traveler";
    } else if (totalExpenses > 0 && totalExpenses <= 10000) {
      spendingHabit = "Budget Conscious / Smart Traveler";
    }

    // 4. Custom key-value memories (diet, travel style, companions)
    const customPreferences: Record<string, string> = {};
    for (const m of memories) {
      customPreferences[m.memoryKey] = m.memoryValue;
    }

    // 5. Build Compact Memory Context for AI
    const ownedBusinesses: any = {};
    if (hotels[0]) ownedBusinesses.hotel = hotels[0].name;
    if (restaurants[0]) ownedBusinesses.restaurant = restaurants[0].name;
    if (guides[0]) ownedBusinesses.guide = guides[0].name;

    const summaryParts: string[] = [];
    summaryParts.push(`User: ${userName} (Roles: ${userRoles.join(", ") || "Traveler"})`);
    if (destinationsSet.size > 0) {
      summaryParts.push(`Past Destinations: ${Array.from(destinationsSet).slice(0, 4).join(", ")}`);
    }
    summaryParts.push(`Spending Profile: ${spendingHabit} (Tracked: NPR ${totalExpenses.toLocaleString()}, Main Focus: ${topCategory})`);

    if (ownedBusinesses.hotel) summaryParts.push(`Owns Hotel: ${ownedBusinesses.hotel}`);
    if (ownedBusinesses.restaurant) summaryParts.push(`Owns Restaurant: ${ownedBusinesses.restaurant}`);
    if (ownedBusinesses.guide) summaryParts.push(`Registered Tour Guide: ${ownedBusinesses.guide}`);

    for (const [k, v] of Object.entries(customPreferences)) {
      summaryParts.push(`${k}: ${v}`);
    }

    return {
      userId,
      userName,
      userRoles,
      recentDestinations: Array.from(destinationsSet),
      totalTrackedExpenses: totalExpenses,
      topExpenseCategory: topCategory,
      spendingHabit,
      ownedBusinesses,
      customPreferences,
      summaryPromptText: summaryParts.join(" | "),
    };
  } catch (error) {
    console.error("Failed to load user memory profile:", error);
    return {
      userId,
      userName,
      userRoles,
      recentDestinations: [],
      totalTrackedExpenses: 0,
      topExpenseCategory: "General",
      spendingHabit: "Standard Traveler",
      ownedBusinesses: {},
      customPreferences: {},
      summaryPromptText: `User: ${userName}`,
    };
  }
}

export async function updateUserMemory(
  userId: number,
  memoryKey: string,
  memoryValue: string
) {
  try {
    const existing = await db
      .select()
      .from(aiUserMemoriesTable)
      .where(eq(aiUserMemoriesTable.userId, userId));

    const match = existing.find((m) => m.memoryKey === memoryKey);

    if (match) {
      await db
        .update(aiUserMemoriesTable)
        .set({ memoryValue, updatedAt: new Date() })
        .where(eq(aiUserMemoriesTable.id, match.id));
    } else {
      await db.insert(aiUserMemoriesTable).values({
        userId,
        memoryKey,
        memoryValue,
      });
    }
  } catch (error) {
    console.error("Failed to update user memory:", error);
  }
}
