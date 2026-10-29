# Database backups

SQL dumps of the IRILLIC PostgreSQL database, named `irillic-YYYYMMDD-HHMMSS.sql`.

These files are **not committed**. A dump carries the `users` table (bcrypt
password hashes), `admin_sessions` (live session tokens) and the audit trail, so
it must not reach GitHub. `.gitignore` excludes `/backups/*.sql`. To give
someone a working database, have them run `npm run db:seed` instead.

## Take a new backup

```bash
"/c/Program Files/PostgreSQL/16/bin/pg_dump.exe" \
  --dbname="postgresql://irillic_app:PASSWORD@127.0.0.1:5433/irillic" \
  --no-owner --no-privileges --clean --if-exists \
  -f "backups/irillic-$(date +%Y%m%d-%H%M%S).sql"
```

## Restore

The dump begins with `DROP ... IF EXISTS`, so it replaces whatever is in the
target database. Point it at the right one.

```bash
"/c/Program Files/PostgreSQL/16/bin/psql.exe" \
  --dbname="postgresql://irillic_app:PASSWORD@127.0.0.1:5433/irillic" \
  -v ON_ERROR_STOP=1 \
  -f backups/irillic-20261027-143829.sql
```

## What is in it

Schema and all rows for: `users`, `content_entries`, `page_sections`,
`site_settings`, `media_assets`, `enquiries`, `admin_sessions`, `audit_logs`,
`security_events`, `password_reset_tokens`, plus Drizzle's
`drizzle.__drizzle_migrations`.

Note that `media_assets` stores paths, not files. The images themselves live in
`public/uploads/`, which is also outside git — back that folder up separately if
you need the uploads.

Taken with PostgreSQL 16.14; restore with 16 or newer.
