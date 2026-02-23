import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ADMIN_COOKIE = "admin_session";
const STUDENT_COOKIE = "student_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function signPayload(payload: string): string {
  const secret = getSecret();
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function createToken(payload: object): string {
  const data = JSON.stringify(payload);
  const b64 = Buffer.from(data).toString("base64url");
  const sig = signPayload(b64);
  return `${b64}.${sig}`;
}

function verifyToken(token: string): object | null {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return null;
    const expected = signPayload(b64);
    if (sig !== expected) return null;
    const data = Buffer.from(b64, "base64url").toString("utf-8");
    return JSON.parse(data) as object;
  } catch {
    return null;
  }
}

export async function createStudentSession(studentId: string): Promise<void> {
  const token = createToken({ studentId, role: "student", exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const c = await cookies();
  c.set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function createAdminSession(): Promise<void> {
  const token = createToken({ role: "admin", exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const c = await cookies();
  c.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getStudentSession(): Promise<{ studentId: string } | null> {
  const c = await cookies();
  const token = c.get(STUDENT_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken(token) as { studentId?: string; exp?: number } | null;
  if (!payload || !payload.studentId || (payload.exp && payload.exp < Date.now())) return null;
  return { studentId: payload.studentId };
}

export async function getAdminSession(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const payload = verifyToken(token) as { exp?: number } | null;
  if (!payload || (payload.exp && payload.exp < Date.now())) return false;
  return true;
}

export async function clearStudentSession(): Promise<void> {
  const c = await cookies();
  c.delete(STUDENT_COOKIE);
}

export async function clearAdminSession(): Promise<void> {
  const c = await cookies();
  c.delete(ADMIN_COOKIE);
}

export { STUDENT_COOKIE, ADMIN_COOKIE };
