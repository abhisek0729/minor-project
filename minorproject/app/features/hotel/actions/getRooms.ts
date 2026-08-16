"use server";

import {
  and,
  asc,
  desc,
  eq,
  ilike,
  SQL,
} from "drizzle-orm";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import {
  hotelsTable,
  roomStatusEnum,
  roomTypeEnum,
  roomsTable,
} from "@/app/lib/db/schema";

type GetRoomsParams = {
  search?: string;
  status?: (typeof roomStatusEnum.enumValues)[number] | "all";
  roomType?: (typeof roomTypeEnum.enumValues)[number] | "all";
  sortBy?:
    | "newest"
    | "oldest"
    | "priceAsc"
    | "priceDesc"
    | "capacityAsc"
    | "capacityDesc";
};

export async function getRooms({
  search = "",
  status = "all",
  roomType = "all",
  sortBy = "newest",
}: GetRoomsParams = {}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized",
      data: [],
    };
  }

  const [hotel] = await db
    .select({
      id: hotelsTable.id,
    })
    .from(hotelsTable)
    .where(eq(hotelsTable.userId, Number(session.user.id)));

  if (!hotel) {
    return {
      success: false,
      message: "Hotel not found.",
      data: [],
    };
  }

  const conditions: SQL[] = [
    eq(roomsTable.hotelId, hotel.id),
  ];

  if (search.trim()) {
    conditions.push(
      ilike(roomsTable.roomNumber, `%${search.trim()}%`),
    );
  }

  if (status !== "all") {
    conditions.push(eq(roomsTable.status, status));
  }

  if (roomType !== "all") {
    conditions.push(eq(roomsTable.roomType, roomType));
  }

  let orderBy;

  switch (sortBy) {
    case "oldest":
      orderBy = asc(roomsTable.createdAt);
      break;

    case "priceAsc":
      orderBy = asc(roomsTable.pricePerNight);
      break;

    case "priceDesc":
      orderBy = desc(roomsTable.pricePerNight);
      break;

    case "capacityAsc":
      orderBy = asc(roomsTable.capacity);
      break;

    case "capacityDesc":
      orderBy = desc(roomsTable.capacity);
      break;

    default:
      orderBy = desc(roomsTable.createdAt);
  }

  const rooms = await db
    .select()
    .from(roomsTable)
    .where(and(...conditions))
    .orderBy(orderBy);

  return {
    success: true,
    message: "Rooms fetched successfully.",
    data: rooms,
  };
}