import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createStudentSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return Response.json({ error: "Email and password required" }, { status: 400 });
    }
    const existing = await db.student.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return Response.json({ error: "Email already registered" }, { status: 400 });
    }
    const passwordHash = await hashPassword(password);
    const student = await db.student.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
      },
    });
    await createStudentSession(student.id);
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Signup failed" }, { status: 500 });
  }
}
