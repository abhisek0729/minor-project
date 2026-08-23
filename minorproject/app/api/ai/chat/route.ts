import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const FASTAPI_BASE_URL =
  process.env.FASTAPI_BASE_URL ||
  process.env.NEXT_PUBLIC_FASTAPI_BASE_URL ||
  "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const userMessage: string = body.message || "";
    const history = body.history || body.messages || [];
    const userId = session?.user?.id ? Number(session.user.id) : 1;
    const userName = session?.user?.name || "Traveler";
    const userRoles = session?.user?.roles
      ? (session.user.roles || []).map((r: { name: string }) => r.name)
      : ["tourist"];

    const payload = {
      message: userMessage,
      history: history,
      user_id: userId,
      user_name: userName,
      user_roles: userRoles,
      destination: body.destination || undefined,
    };

    // Forward directly to FastAPI LangGraph AI Multi-Agent Backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const backendResponse = await fetch(
      `${FASTAPI_BASE_URL.replace(/\/$/, "")}/api/v1/ai/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (backendResponse.ok) {
      const data = await backendResponse.json();
      return NextResponse.json(data);
    } else {
      const errData = await backendResponse.json().catch(() => ({}));
      console.warn("FastAPI returned non-OK status:", backendResponse.status, errData);
      return NextResponse.json(
        {
          answer:
            errData.detail ||
            errData.message ||
            "I encountered a temporary issue processing your request. Please try again.",
          recommendations: [],
          steps_taken: ["⚠️ Multi-Agent API returned non-200 status"],
          tools_used: ["fastapi_langgraph_proxy"],
        },
        { status: backendResponse.status }
      );
    }
  } catch (err: unknown) {
    console.error("FastAPI LangGraph forward error:", err);
    return NextResponse.json(
      {
        answer:
          "Namaste! 🙏 I am your TravelNepal AI Specialist. I am currently connecting to the LangGraph AI multi-agent engine. Please try your question again in a moment.",
        recommendations: [],
        steps_taken: ["⚠️ Network Connection to FastAPI LangGraph Backend failed"],
        tools_used: ["fastapi_langgraph_proxy"],
      },
      { status: 503 }
    );
  }
}
