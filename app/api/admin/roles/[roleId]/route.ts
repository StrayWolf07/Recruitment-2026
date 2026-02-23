import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { roleId } = await params;
  try {
    const body = await request.json();
    const { name, description, isActive } = body;
    const data: { name?: string; description?: string; isActive?: boolean } = {};
    if (typeof name === "string") data.name = name.trim();
    if (typeof description === "string") data.description = description.trim();
    if (typeof isActive === "boolean") data.isActive = isActive;
    const role = await db.role.update({
      where: { id: roleId },
      data,
    });
    return Response.json(role);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Update role failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { roleId } = await params;
  try {
    const usage = await db.examQuestion.count({ where: { roleId } });
    if (usage > 0) {
      return Response.json(
        { error: "Cannot delete role: used in exam sessions. Archive instead." },
        { status: 400 }
      );
    }
    await db.role.delete({ where: { id: roleId } });
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Delete role failed" }, { status: 500 });
  }
}
