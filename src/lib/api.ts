import { NextResponse } from "next/server";
import { ZodError, type ZodIssue } from "zod";
import { isIP } from "net";
import { SettingValidationError } from "@/validations/setting.validation";

function humanise(key: string) {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Turns "slides.0.title" into "Slides, item 1 › Title".
 *
 * Only the last key used to be reported, which named a field an editor could
 * not find: "Title" on a page with eleven of them. The index matters most --
 * it is the one thing that says which of the repeated cards to open.
 */
function fieldLabel(path: ZodIssue["path"]) {
  const parts: string[] = [];
  for (const part of path) {
    if (typeof part === "number") {
      if (parts.length) parts[parts.length - 1] += `, item ${part + 1}`;
    } else parts.push(humanise(String(part)));
  }
  return parts.join(" › ");
}

/** The reason for one issue, in a sentence an editor can act on. */
function issueReason(issue: ZodIssue) {
  if (issue.code === "invalid_type") {
    // "Expected array, received undefined" means the value is not there at
    // all, which for an editor is a missing entry rather than a wrong type.
    if (issue.input === undefined || issue.input === null)
      return "this is required and is currently empty";
    return `expected ${issue.expected}, which this is not`;
  }
  if (issue.code === "invalid_value" || issue.code === "invalid_union")
    return "this value is not one of the accepted options";
  if (issue.message.startsWith("Invalid option"))
    return "this value is not one of the accepted options";
  return issue.message.charAt(0).toLowerCase() + issue.message.slice(1);
}

/**
 * Zod's own wording ("Invalid option: expected one of…") describes the schema,
 * not the mistake, and never says which field it is about. An administrator
 * needs the field name and a plain sentence to act on.
 *
 * Every problem is reported, not just the first. One at a time meant fixing a
 * field, saving, and being told about the next one -- and when a form held
 * several mistakes it was never clear how many were left.
 */
export function zodMessage(error: ZodError) {
  const issues = error.issues.slice(0, 3);
  if (!issues.length) return "Invalid request";
  const sentences = issues.map((issue) => {
    const label = fieldLabel(issue.path);
    const reason = issueReason(issue);
    return label ? `${label}: ${reason}` : reason;
  });
  const rest = error.issues.length - issues.length;
  return (
    sentences.join(". ") +
    (rest > 0 ? `. And ${rest} more problem${rest === 1 ? "" : "s"}.` : ".")
  );
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
