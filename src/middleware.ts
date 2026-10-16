import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add paths that require authentication
const protectedPaths = ["/dashboard"];

// Add paths that should redirect if already authenticated
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for protected routes
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // TODO: Implement actual auth check with JWT token
  // const token = request.cookies.get("token")?.value;

  // For now, allow all routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
