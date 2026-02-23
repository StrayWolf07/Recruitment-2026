import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const roleId = request.nextUrl.searchParams.get("roleId");
  if (!roleId) return Response.json({ error: "roleId required" }, { status: 400 });
  const [theory, practical] = await Promise.all([
    db.theoryQuestion.findMany({ where: { roleId }, orderBy: { id: "asc" } }),
    db.practicalQuestion.findMany({ where: { roleId }, orderBy: { id: "asc" } }),
  ]);
  return Response.json({ theory, practical });
}

export async function POST(request: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { type, roleId, questionText } = body;
    if (!type || !roleId || !questionText) {
      return Response.json({ error: "type, roleId, questionText required" }, { status: 400 });
    }
    if (type !== "theory" && type !== "practical") {
      return Response.json({ error: "type must be theory or practical" }, { status: 400 });
    }
    if (type === "theory") {
      const q = await db.theoryQuestion.create({
        data: {
          roleId,
          questionText: String(questionText).trim(),
        },
      });
      return Response.json(q);
    } else {
      const q = await db.practicalQuestion.create({
        data: {
          roleId,
          questionText: String(questionText).trim(),
        },
      });
      return Response.json(q);
    }
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Create question failed" }, { status: 500 });
  }
}
