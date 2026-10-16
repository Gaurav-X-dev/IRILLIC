import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Test database connection
    const result = await db.execute(sql`SELECT NOW() as current_time`);

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          time: result.rows[0]?.current_time,
        },
        environment: process.env.NODE_ENV,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        environment: process.env.NODE_ENV,
      },
      { status: 503 },
    );
  }
}
