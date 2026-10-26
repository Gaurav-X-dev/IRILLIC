import pg from "pg";
import { BRANDING_FALLBACK } from "../src/lib/branding-defaults";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const values: Record<string, unknown> = {
    ...BRANDING_FALLBACK,
    seoKeywords: BRANDING_FALLBACK.seoKeywords.join(", "),
  };
  try {
    for (const [name, value] of Object.entries(values)) {
      const key = `general.${name}`;
      await pool.query(
        `insert into site_settings (key, "group", value)
         values ($1, 'general', $2::jsonb)
         on conflict (key) do update
         set value = excluded.value, updated_at = now()
         where site_settings.value is null
            or site_settings.value = '""'::jsonb`,
        [key, JSON.stringify(value)],
      );
    }
    console.log("Required branding settings are stored in PostgreSQL.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
