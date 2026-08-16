import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";

// Adjust this import path if your authOptions is located elsewhere
import { authOptions } from "@/app/api/auth/[...nextauth]/options"; 

const allowedFolders = [
  "tourism/hotels",
  "tourism/restaurants",
  "tourism/menu",
  "tourism/guides",
  "tourism/users",
  "tourism/destinations",
  "tourism/rooms",
  "tourism/general",
];

export async function POST(req: NextRequest) {
  try {
    // 1. Check Authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the Request Body
    const body = await req.json();
    const { paramsToSign } = body;

    if (!paramsToSign || !paramsToSign.folder) {
      return NextResponse.json({ error: "Missing folder parameter" }, { status: 400 });
    }

    // 3. Verify the Folder (Whitelisting)
    const isAllowed =
      allowedFolders.includes(paramsToSign.folder) ||
      paramsToSign.folder.startsWith("tourism/");

    if (!isAllowed) {
      return NextResponse.json({ error: "Invalid folder destination" }, { status: 403 });
    }

    // 4. Generate the Signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    // 5. Return the Signature
    return NextResponse.json({ signature });
    
  } catch (error) {
    console.error("Cloudinary Signature Error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" }, 
      { status: 500 }
    );
  }
}