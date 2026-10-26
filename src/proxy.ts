import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/admin/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (isProtected && !request.cookies.get("irillic_admin_session")?.value) {
    const login = new URL("/login", request.url);
    login.searchParams.set("reason", "session");
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/dashboard/:path*"],
};
