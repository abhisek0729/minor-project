import { signUpSchema } from "@/app/features/auth/schemas/register.schema";
import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/app/features/auth/services/register.service";
import { ApiResponse } from "@/app/types/api";
import { cookies } from "next/headers";

const allowedRoles = [
  "tourist",
  "hotelOwner",
  "restaurantOwner",
  "guide",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = signUpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    
    const role = (await cookies()).get("partner_role")?.value || "tourist"

    if(!allowedRoles.includes(body.role)){
      
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Role validation failed",
        },
        { status: 400 },
      );
    }

    const registrationData = await registerUser(result.data);

    return NextResponse.json<ApiResponse>(registrationData.body, {
      status: registrationData.status,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
