# IRILLIC

IRILLIC is a Next.js 15 website and single-administrator CMS backed by PostgreSQL and Drizzle ORM. Public content, navigation, SEO, products, clinical resources, enquiries, media and site settings are managed from the database.

## Local setup (Windows)

Prerequisites:

- Node.js 18 or newer
- PostgreSQL 16 installed in `C:\Program Files\PostgreSQL\16`

Install dependencies, then initialize the project-scoped database and administrator:

```powershell
npm install
.\scripts\bootstrap-local-db.ps1 -AdminPassword "use-a-unique-strong-password"
npm run dev
```

The bootstrap script creates a PostgreSQL cluster inside the ignored `.local-postgres` directory, runs migrations, seeds all CMS content, creates the single administrator, and removes the plaintext bootstrap password from `.env.local`. It does not modify the Windows PostgreSQL service.

Open:

- Website: `http://localhost:3000`
- Admin login: `http://localhost:3000/login`
- Admin panel: `http://localhost:3000/admin`

The administrator email defaults to `admin@irillic.com`. It can be changed during bootstrap with `-AdminEmail`.

## Commands

| Command                  | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `npm run dev`            | Start the local database and development server |
| `npm run build`          | Create a production build                       |
| `npm run start`          | Start the local database and production server  |
| `npm run lint`           | Run ESLint                                      |
| `npm run type-check`     | Run TypeScript checks                           |
| `npm run db:migrate`     | Apply committed migrations                      |
| `npm run db:seed`        | Seed/upsert the single admin and CMS content    |
| `npm run db:studio`      | Open Drizzle Studio                             |
| `npm run db:local:start` | Start the project-local PostgreSQL server       |
| `npm run db:local:stop`  | Stop the project-local PostgreSQL server        |

## Admin capabilities

- Dashboard and enquiry management
- Database-driven page, product, navigation and site-content editing
- Visual per-page builder with page tabs, section tabs, nested field/card editors, ordering, visibility and custom-section CRUD (no raw JSON editing)
- Clinical resources and application content
- Media upload with automatic WebP conversion while retaining pixel dimensions
- SEO metadata and global site settings
- SMTP configuration and test email
- Forgot/reset password and authenticated password change
- Login activity and security-session management

SMTP credentials are intentionally not included. Configure them from the admin settings before testing outbound email.

## Production checks

```powershell
npm run type-check
npm run lint
npm run build
npm audit --omit=dev
```

Testing and hardening details are documented in [`docs/TESTING.md`](docs/TESTING.md) and [`docs/BUG-REPORT.md`](docs/BUG-REPORT.md).

Use a managed PostgreSQL database and unique secrets in production. Keep `.env.local` and `.local-postgres` out of source control.
