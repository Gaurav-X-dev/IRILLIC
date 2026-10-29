import { NextResponse } from "next/server";
import { ZodError, type ZodIssue } from "zod";
import { isIP } from "net";
import { SettingValidationError } from "@/validations/setting.validation";

/** Turns "contact.phone" or "slides.0.title" into "Contact phone". */
function fieldLabel(path: ZodIssue["path"]) {
  const named = path.filter((part) => typeof part === "string") as string[];
  if (!named.length) return "";
  const last = named[named.length - 1];
  const spaced = last.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Zod's own wording ("Invalid option: expected one of…") describes the schema,
 * not the mistake, and never says which field it is about. An administrator
 * needs the field name and a plain sentence to act on.
 */
export function zodMessage(error: ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Invalid request";
  const label = fieldLabel(issue.path);
  let reason = issue.message;
  if (issue.code === "invalid_type")
    reason = `expected ${issue.expected}`;
  else if (issue.code === "invalid_value" || issue.code === "invalid_union")
    reason = "this value is not one of the accepted options";
  else if (reason.startsWith("Invalid option"))
    reason = "this value is not one of the accepted options";
  // Zod's own sentences already read well; keep them, just add the field.
  const sentence = reason.charAt(0).toLowerCase() + reason.slice(1);
  return label ? `${label}: ${sentence}` : reason;
}

export function apiError(
  error: unknown,
  fallback = "Unable to complete this request",
) {
  if (error instanceof SettingValidationError)
    return NextResponse.json(
      { success: false, error: error.message, field: error.field },
      { status: 400 },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      { success: false, error: zodMessage(error) },
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
