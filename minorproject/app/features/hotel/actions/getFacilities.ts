"use server";

import { asc } from "drizzle-orm";

import { db } from "@/app/lib/db";
import { facilitiesTable } from "@/app/lib/db/schema";
import { FacilityIconKey } from "../components/steps/Facilities";

export async function getFacilities() {
  try {
    const facilities = await db
      .select({
        id: facilitiesTable.id,
        name: facilitiesTable.name,
        icon: facilitiesTable.icon,
      })
      .from(facilitiesTable)
      .orderBy(asc(facilitiesTable.name));

    return {
      success: true,
      data: facilities.map((facility) => ({
        ...facility,
        icon: facility.icon as FacilityIconKey,
      })),
    };
  } catch (error) {
    console.error("Error fetching facilities:", error);

    return {
      success: false,
      message: "Failed to fetch facilities.",
      data: [],
    };
  }
}
