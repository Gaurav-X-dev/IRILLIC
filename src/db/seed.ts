import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { users } from "./schema/users";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    const hashedPassword = await bcrypt.hash("password123", 12);

    await db.insert(users).values([
      {
        name: "Admin User",
        email: "admin@irillic.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
        emailVerified: true,
      },
      {
        name: "Test User",
        email: "user@irillic.com",
        password: hashedPassword,
        role: "user",
        isActive: true,
        emailVerified: true,
      },
    ]);

    console.log("✅ Seeding completed!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
