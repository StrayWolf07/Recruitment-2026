import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createStudentSession } from "@/lib/auth";
import { checkAuthRateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const rate = checkAuthRateLimit(request);
  if (!rate.ok) {
    return Response.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: rate.retryAfter ? { "Retry-After": String(rate.retryAfter) } : undefined }
    );
  }
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return Response.json({ error: "Email and password required" }, { status: 400 });
    }
    const student = await db.student.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!student) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const ok = await verifyPassword(password, student.passwordHash);
    if (!ok) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createStudentSession(student.id);
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
