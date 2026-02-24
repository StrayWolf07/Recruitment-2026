import { NextRequest } from "next/server";
import { createAdminSession } from "@/lib/auth";
import { checkAuthRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function mustEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env: ${key}`);
  return value;
}

export async function POST(request: NextRequest) {
  const rate = checkAuthRateLimit(request);
  if (!rate.ok) {
    return Response.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: rate.retryAfter ? { "Retry-After": String(rate.retryAfter) } : undefined }
    );
  }
  try {
    const adminUser = mustEnv("ADMIN_USER");
    const adminPass = mustEnv("ADMIN_PASS");

    const body = await request.json();
    const email = (body.email ?? body.username)?.trim?.();
    const password = body.password;

    if (!email || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 });
    }

    const emailNorm = String(email).toLowerCase();
    if (emailNorm === adminUser.toLowerCase() && password === adminPass) {
      await createAdminSession();
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Missing required env:")) {
      console.error(e.message);
      return Response.json({ error: "Server configuration error" }, { status: 500 });
    }
    console.error(e);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
