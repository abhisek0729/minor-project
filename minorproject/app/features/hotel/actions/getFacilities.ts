"use server";

import { asc } from "drizzle-orm";

import { db } from "@/app/lib/db";
import { facilitiesTable } from "@/app/lib/db/schema";
import { FacilityIconKey } from "../components/onboarding/steps/Facilities";

const DEFAULT_HOTEL_FACILITIES: { name: string; icon: FacilityIconKey }[] = [
  { name: "Free High-Speed Wi-Fi", icon: "wifi" },
  { name: "Free Parking on Premises", icon: "car" },
  { name: "Restaurant & Room Service", icon: "utensils-crossed" },
  { name: "Gym & Fitness Center", icon: "dumbbell" },
  { name: "Swimming Pool", icon: "waves" },
  { name: "24/7 Security & CCTV", icon: "shield-check" },
  { name: "Complimentary Breakfast", icon: "coffee" },
  { name: "Air Conditioning (AC)", icon: "snowflake" },
  { name: "Flat-screen Cable TV", icon: "tv" },
  { name: "Laundry & Dry Cleaning", icon: "washing-machine" },
  { name: "Pet Friendly", icon: "paw-print" },
  { name: "Wheelchair Accessible", icon: "accessibility" },
];

export async function getFacilities() {
  try {
    let facilities = await db
      .select({
        id: facilitiesTable.id,
        name: facilitiesTable.name,
        icon: facilitiesTable.icon,
      })
      .from(facilitiesTable)
      .orderBy(asc(facilitiesTable.name));

    // Auto-seed default facilities if table is empty
    if (facilities.length === 0) {
      try {
        await db.insert(facilitiesTable).values(
          DEFAULT_HOTEL_FACILITIES.map((f) => ({
            name: f.name,
            icon: f.icon,
          }))
        );

        facilities = await db
          .select({
            id: facilitiesTable.id,
            name: facilitiesTable.name,
            icon: facilitiesTable.icon,
          })
          .from(facilitiesTable)
          .orderBy(asc(facilitiesTable.name));
      } catch (seedErr) {
        console.warn("Auto-seeding facilities warning:", seedErr);
      }
    }

    // Fallback if still empty
    if (facilities.length === 0) {
      return {
        success: true,
        data: DEFAULT_HOTEL_FACILITIES.map((f, i) => ({
          id: i + 1,
          name: f.name,
          icon: f.icon,
        })),
      };
    }

    return {
      success: true,
      data: facilities.map((facility) => ({
        ...facility,
        icon: (facility.icon as FacilityIconKey) || "wifi",
      })),
    };
  } catch (error) {
    console.error("Error fetching facilities:", error);

    return {
      success: true,
      message: "Loaded default facilities.",
      data: DEFAULT_HOTEL_FACILITIES.map((f, i) => ({
        id: i + 1,
        name: f.name,
        icon: f.icon,
      })),
    };
  }
}
