import { NextResponse } from "next/server";
import { db } from "@/db";
import { securityEvents } from "@/db/schema";
import {
  getAdminSession,
  requestIdentity,
  revokeAdminSession,
} from "@/lib/auth";

export async function POST() {
  try {
    // Read the session before it is revoked, so the event can name the account.
    const session = await getAdminSession();
    const identity = await requestIdentity();
    await revokeAdminSession();
    if (session)
      await db.insert(securityEvents).values({
        event: "logout",
        email: session.email,
        ipAddress: identity.ip,
        userAgent: identity.userAgent,
        success: true,
        metadata: { sessionId: session.sessionId },
      });
  } catch {
    /* Expired/unavailable session still clears client navigation. */
  }
  return NextResponse.json({ success: true });
}
