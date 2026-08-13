import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE_URL =
  process.env.FASTAPI_BASE_URL ||
  process.env.NEXT_PUBLIC_FASTAPI_BASE_URL ||
  "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(
      `${FASTAPI_BASE_URL.replace(/\/$/, "")}/api/v1/ai/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const text = await backendResponse.text();
    let data: unknown = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text || "Unexpected response from the AI backend." };
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error("AI chat proxy error:", error);

    return NextResponse.json(
      {
        detail:
          "Unable to reach the FastAPI AI backend. Make sure the backend is running on http://localhost:8000.",
      },
      { status: 502 },
    );
  }
}
