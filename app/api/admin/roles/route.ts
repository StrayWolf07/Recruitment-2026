import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const roles = await db.role.findMany({ orderBy: { name: "asc" } });
  return Response.json(roles);
}

export async function POST(request: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { name, description } = body;
    if (!name || typeof name !== "string") {
      return Response.json({ error: "Name required" }, { status: 400 });
    }
    const role = await db.role.create({
      data: {
        name: name.trim(),
        description: typeof description === "string" ? description.trim() : null,
      },
    });
    return Response.json(role);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Create role failed" }, { status: 500 });
  }
}
