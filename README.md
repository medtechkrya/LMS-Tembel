# Teman Belajar

Internal web app for managing student learning sessions and reports.

## Setup

1. Install dependencies: `npm install`
2. Copy environment file: `cp .env.example .env`
3. Run database migration: `npx prisma migrate dev --name init`
4. Seed the database: `npx prisma db seed`
5. Start development server: `npm run dev`
