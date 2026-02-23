import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";

export async function GET() {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const roles = await db.role.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return Response.json(roles);
}
