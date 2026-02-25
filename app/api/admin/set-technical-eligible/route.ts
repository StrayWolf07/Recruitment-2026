import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { sessionId } = body;
    if (!sessionId || typeof sessionId !== "string") {
      return Response.json({ error: "sessionId required" }, { status: 400 });
    }
    await db.examSession.update({
      where: { id: sessionId },
      data: { technicalEligible: true },
    });
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to set technical eligible" }, { status: 500 });
  }
}
