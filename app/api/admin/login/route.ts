import { NextRequest } from "next/server";
import { createAdminSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkAuthRateLimit } from "@/lib/rateLimit";

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

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
    const { username, email, password } = body;
    const loginId = (email ?? username)?.trim?.();
    if (!loginId || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 });
    }
    const emailNorm = String(loginId).toLowerCase();

    let ok = false;
    try {
      const admin = await db.admin.findUnique({
        where: { email: emailNorm },
      });
      if (admin && (await verifyPassword(password, admin.passwordHash))) {
        ok = true;
      }
    } catch (dbErr) {
      console.error("Admin DB lookup:", dbErr);
    }

    if (!ok && ADMIN_USER && ADMIN_PASS && (emailNorm === ADMIN_USER.toLowerCase() || loginId === ADMIN_USER)) {
      if (password === ADMIN_PASS) ok = true;
    }

    if (!ok) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createAdminSession();
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
