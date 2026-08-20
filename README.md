# Teman Belajar — Reporting System

Internal web app for mentor session recaps and monthly report generation.

## Tech Stack

- **Frontend + Backend**: Next.js 14 (App Router, TypeScript)
- **Database**: MySQL (via Prisma ORM)
- **PDF Export**: Puppeteer
- **Styling**: Tailwind CSS

---

## Requirements

- Node.js v18 or above
- MySQL 5.7 or above (XAMPP recommended for local)
- Git

---

## Setup (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/GabrielRyan1999/LMS-Tembel.git
cd LMS-Tembel
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your MySQL credentials:
DATABASE_URL="mysql://root:@localhost:3306/teman_belajar"
ADMIN_USERNAME=admin
ADMIN_PASSWORD=temanbelajar123

### 4. Create MySQL database

Open phpMyAdmin (`http://localhost/phpmyadmin`) and create a new database:
- Name: `teman_belajar`
- Collation: `utf8mb4_unicode_ci`

### 5. Run database migration

```bash
npx prisma migrate dev
```

### 6. Seed initial data

```bash
npx prisma db seed
```

### 7. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000`

---

## Production Deployment

### Requirements
- Node.js v18+
- MySQL database (update `DATABASE_URL` in `.env`)
- Set `NODE_ENV=production`

### Steps

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run build
npm start
```

---

## Default Admin Access

URL: `/admin/login`

| Username | Password |
|---|---|
| admin | temanbelajar123 |

> Change these credentials in `.env` before production deployment.

---

## Folder Structure
src/
app/
admin/ # Admin pages (login, dashboard, students, mentors, sessions, reports)
api/ # API routes
reports/ # Mentor report pages
sessions/ # Mentor session pages
lib/
prisma.ts # Prisma client
prisma/
schema.prisma # Database schema
seed.ts # Seed data
public/
uploads/ # Session photos (local storage)

## Notes 

- Photos are currently stored locally at `/public/uploads/`. For production, migrate to cloud storage (Supabase Storage or Cloudinary).
- SQLite adapter has been removed. App uses MySQL only.
- Prisma version: 5.x (do not upgrade to v7 without updating the adapter setup).
- Admin credentials are hardcoded in `.env`. Change before going live.