import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { ne } from "drizzle-orm";
import { Pool } from "pg";
import { adminSessions, passwordResetTokens, users } from "../src/db/schema";

const email = (process.argv[2] ?? "").trim().toLowerCase();
const temporaryPassword = process.argv[3] ?? "";
const requirePasswordChange = process.argv[4] !== "--ready";

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  throw new Error("Provide a valid administrator email.");
if (temporaryPassword.length < 6 || temporaryPassword.length > 128)
  throw new Error("Temporary password must be 6-128 characters.");
if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL is not configured.");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  try {
    const password = await bcrypt.hash(temporaryPassword, 12);
    await db.transaction(async (tx) => {
      await tx.delete(passwordResetTokens);
      await tx.delete(adminSessions);
      await tx
        .insert(users)
        .values({
          name: "Gaurav Pal",
          email,
          password,
          role: "admin",
          isActive: true,
          emailVerified: true,
          mustChangePassword: requirePasswordChange,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            name: "Gaurav Pal",
            password,
            role: "admin",
            isActive: true,
            emailVerified: true,
            mustChangePassword: requirePasswordChange,
            updatedAt: new Date(),
          },
        });
      await tx.delete(users).where(ne(users.email, email));
    });
    console.log(
      `Sole super administrator configured for ${email}.${requirePasswordChange ? " A secure password change is required after login." : " Account is ready."}`,
    );
  } finally {
    await pool.end();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
