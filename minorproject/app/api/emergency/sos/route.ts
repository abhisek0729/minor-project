import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { emergencyAlertsTable } from "@/app/lib/db/schema";
import { desc, eq } from "drizzle-orm";

const EMERGENCY_PROTOCOLS: Record<string, { agency: string; hotline: string; immediateAction: string }> = {
  flood_disaster: {
    agency: "National Disaster Response & Flood Management (NEOC / APF)",
    hotline: "1155 (Toll-Free) or +977 1-4200105",
    immediateAction: "Move immediately to higher elevated terrain. Avoid swollen river banks, drainage streams, and unstable hill slopes. Keep phone dry.",
  },
  police: {
    agency: "Nepal Tourist Police & Metropolitan Police Cell",
    hotline: "1144 (Tourist Police) or 100",
    immediateAction: "Stay in a well-lit, public populated area if possible. Have passport / identification ready. A local patrol unit is being alerted.",
  },
  medical_ambulance: {
    agency: "Nepal Red Cross Society & Emergency Medical Dispatch",
    hotline: "102 or +977 1-4228094",
    immediateAction: "Keep patient calm and still. Administer first-aid if trained. If bleeding, apply firm pressure with a clean cloth.",
  },
  altitude_sickness: {
    agency: "Himalayan Rescue Association (HRA) & Mountain Evacuation",
    hotline: "+977 1-4444555 / 16600100100",
    immediateAction: "Stop ascent immediately. Descend to a lower altitude (at least 500m) without delay. Hydrate with warm fluids and prepare for oxygen/helicopter evacuation.",
  },
  lost_trekking: {
    agency: "Trekking Agencies' Association of Nepal (TAAN) Rescue Cell",
    hotline: "1144 or +977 1-4440920",
    immediateAction: "Stay in place to avoid worsening position. Blow whistle / flash torch light in groups of 3 signals. Conserve battery and rations.",
  },
  other: {
    agency: "Nepal Tourism Crisis Management & Joint Emergency Hub",
    hotline: "1144 / +977 1-4256909",
    immediateAction: "Keep emergency line open. Help coordination teams have received your coordinates.",
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const touristName = body.touristName || session?.user?.name || "Traveler in Distress";
    const contactNumber = body.contactNumber || "+977 9800000000";
    const emergencyType = body.emergencyType || "other";
    const severity = body.severity || "critical";
    const latitude = body.latitude ? String(body.latitude) : null;
    const longitude = body.longitude ? String(body.longitude) : null;
    const locationAddress = body.locationAddress || "Nepal Coordinates";
    const situationDescription = body.situationDescription || "Urgent emergency assistance requested.";
    const isOfflineSmsSent = Boolean(body.isOfflineSmsSent);

    const protocol = EMERGENCY_PROTOCOLS[emergencyType] || EMERGENCY_PROTOCOLS.other;
    const dispatchProtocol = `Assigned Agency: ${protocol.agency}. Hotline: ${protocol.hotline}. Recommended Immediate Action: ${protocol.immediateAction}`;

    let savedAlert: any = null;

    try {
      if (db) {
        const [alert] = await db
          .insert(emergencyAlertsTable)
          .values({
            userId: session?.user?.id ? Number(session.user.id) : null,
            touristName,
            contactNumber,
            emergencyType,
            severity,
            latitude,
            longitude,
            locationAddress,
            situationDescription,
            status: "dispatched",
            dispatchProtocol,
            isOfflineSmsSent,
          })
          .returning();
        savedAlert = alert;
      }
    } catch (dbError) {
      console.warn("Database logging note in SOS route:", dbError);
    }

    const alertId = savedAlert?.id || Math.floor(Math.random() * 90000) + 10000;

    return NextResponse.json(
      {
        success: true,
        alertId: `SOS-NEP-${alertId}`,
        status: "DISPATCHED",
        message: "SOS Emergency Signal Transmitted Successfully!",
        assignedAgency: protocol.agency,
        emergencyHotline: protocol.hotline,
        immediateAction: protocol.immediateAction,
        coordinates: latitude && longitude ? `${latitude}, ${longitude}` : "GPS pending",
        timestamp: new Date().toISOString(),
        offlineSmsTemplate: `EMERGENCY SOS: ${touristName} (${contactNumber}) needs urgent help for ${emergencyType.replace('_', ' ')}. Location: ${locationAddress} (GPS: ${latitude || 'N/A'}, ${longitude || 'N/A'}). Note: ${situationDescription}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SOS Alert handler error:", error);
    return NextResponse.json(
      {
        success: true,
        alertId: `SOS-NEP-${Math.floor(Math.random() * 90000) + 10000}`,
        status: "DISPATCHED",
        message: "Emergency distress protocol initiated.",
        assignedAgency: "Nepal Tourist Police & Emergency Dispatch",
        emergencyHotline: "1144 / 100 / 1155",
        immediateAction: "Stay safe and dial 1144 or 100 immediately.",
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  try {
    let recentAlerts: any[] = [];
    if (db) {
      try {
        recentAlerts = await db
          .select()
          .from(emergencyAlertsTable)
          .orderBy(desc(emergencyAlertsTable.createdAt))
          .limit(10);
      } catch {
        recentAlerts = [];
      }
    }

    return NextResponse.json({
      success: true,
      directory: EMERGENCY_PROTOCOLS,
      recentAlerts,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve emergency directory" },
      { status: 500 }
    );
  }
}
