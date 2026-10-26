import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session)
      return NextResponse.json(
        { success: false, error: "Unauthenticated" },
        { status: 401 },
      );
    return NextResponse.json({
      success: true,
      data: {
        name: session.name,
        email: session.email,
        avatar: session.avatar,
        mustChangePassword: session.mustChangePassword,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication unavailable" },
      { status: 503 },
    );
  }
}
