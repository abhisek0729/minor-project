import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/options";
import cloudinary from "@/app/lib/claudinary";

const allowedFolders = [
  "tourism/hotels",
  "tourism/restaurants",
  "tourism/guides",
  "tourism/users",
  "tourism/destinations",
  "tourism/rooms"
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paramsToSign } = await req.json();

  if (!allowedFolders.includes(paramsToSign.folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({ signature });
}
