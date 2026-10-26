import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isIP } from "net";

export function apiError(
  error: unknown,
  fallback = "Unable to complete this request",
) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { success: false, error: error.issues[0]?.message || "Invalid request" },
      { status: 400 },
    );
  const code = databaseErrorCode(error);
  if (code === "23505")
    return NextResponse.json(
      {
        success: false,
        error: "A record with this identifier already exists.",
      },
      { status: 409 },
    );
  if (code === "22P02")
    return NextResponse.json(
      { success: false, error: "Invalid record identifier." },
      { status: 400 },
    );
  console.error(error);
  return NextResponse.json(
    { success: false, error: fallback },
    { status: 500 },
  );
}

export function databaseErrorCode(error: unknown) {
  let current = error;
  const visited = new Set<unknown>();
  for (
    let depth = 0;
    depth < 5 &&
    current &&
    typeof current === "object" &&
    !visited.has(current);
    depth += 1
  ) {
    visited.add(current);
    if ("code" in current && typeof current.code === "string")
      return current.code;
    current = "cause" in current ? current.cause : null;
  }
  return null;
}

export function clientIp(request: Request) {
  const candidate =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "";
  return isIP(candidate) ? candidate : "unknown";
}
