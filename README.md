# IRILLIC

A modern full-stack web application built with **Next.js 15**, **TypeScript**, **PostgreSQL**, and **Tailwind CSS**.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend:** Next.js API Routes & Server Actions
- **Database:** PostgreSQL with Drizzle ORM
- **Language:** TypeScript
- **Auth:** JWT-based authentication
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Install dependencies
npm run install

# Copy environment variables
cp .env.example .env.local

# Update DATABASE_URL in .env.local with your PostgreSQL credentials

# Push database schema
npm run db:push

# Run development server
npm run dev
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate DB migrations |
| `npm run db:migrate` | Run DB migrations |
| `npm run db:push` | Push schema to DB |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database |

## Project Structure

```
src/
├── app/                  # Next.js App Router (pages & API)
│   ├── (auth)/           # Auth pages (login, register)
│   ├── (dashboard)/      # Protected dashboard pages
│   ├── api/              # Backend API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── shared/           # Shared components
├── db/                   # Database layer
│   ├── schema/           # Drizzle table schemas
│   ├── migrations/       # Auto-generated migrations
│   └── seed.ts           # Seed script
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── services/             # Business logic layer
├── config/               # App configuration
└── validations/          # Zod validation schemas
```

## License

MIT
