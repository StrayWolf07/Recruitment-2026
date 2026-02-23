import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STUDENT_COOKIE = "student_session";
const ADMIN_COOKIE = "admin_session";

const studentProtectedPaths = ["/student/profile", "/student/exam", "/student/submitted"];
const adminProtectedPaths = ["/admin/dashboard", "/admin/evaluate"];

function isStudentProtected(pathname: string): boolean {
  return studentProtectedPaths.some((p) => pathname.startsWith(p));
}

function isAdminProtected(pathname: string): boolean {
  return adminProtectedPaths.some((p) => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const studentCookie = request.cookies.get(STUDENT_COOKIE)?.value;
  const adminCookie = request.cookies.get(ADMIN_COOKIE)?.value;

  if (isAdminProtected(pathname) && !adminCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isStudentProtected(pathname) && !studentCookie) {
    return NextResponse.redirect(new URL("/student/login", request.url));
  }

  if (pathname === "/admin/login" && adminCookie) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if ((pathname === "/student/login" || pathname === "/student/signup") && studentCookie) {
    return NextResponse.redirect(new URL("/student/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
