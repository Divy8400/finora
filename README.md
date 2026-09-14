# Finora — Personal Finance Manager

Finora is a secure, production-ready personal finance web application built with the Next.js App Router, TypeScript, Tailwind CSS, Prisma, and Auth.js. It enables individuals to track income, manage expenses, set category budgets, visualize spending insights, and work toward savings goals with zero-leakage privacy and robust role-based administration.

---

## 1. Project Overview

Finora provides personal financial management with strict data ownership and financial privacy controls:
- **Private Financial Data:** Financial amounts can be dynamically masked with fixed-length bullets (`•••••`), and raw database fields are never leaked through APIs.
- **Budgeting & Goals:** Monthly spending limits by category with real-time usage percentages, visual status indicators, and dedicated savings goal tracking.
- **Spending Analytics & Themes:** Interactive spending breakdown by category with keyboard-accessible scrolling and 5 custom color themes including dynamic browser/system synchronization.
- **Role-Based Administration:** Multi-tier authorization distinguishing standard users (`USER`) from system administrators (`ADMIN`), featuring a dedicated administrative back-office.

---

## 2. Technology Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Database ORM:** Prisma ORM
- **Databases:** SQLite (local development), PostgreSQL (production deployment)
- **Authentication:** Auth.js / NextAuth (JWT session strategy, bcrypt hashing)
- **Data Validation:** Zod schemas
- **Forms:** React Hook Form with Zod resolvers
- **Data Visualization:** Recharts
- **Icons:** Lucide React

---

## 3. Local Installation

Follow these steps to set up Finora locally:

```bash
# 1. Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd finora

# 2. Install dependencies
npm install

# 3. Create your local environment file from the template
cp .env.example .env.local

# 4. Generate Prisma client & apply migrations
npx prisma generate
npx prisma migrate dev

# 5. Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

---

## 4. Environment Variables

Finora uses environment variables for database connections, application secrets, and canonical URLs.

| Variable | Description | Example (Local) | Example (Production) |
|---|---|---|---|
| `DATABASE_URL` | Prisma connection string | `file:./dev.db` | `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require` |
| `AUTH_SECRET` | NextAuth encryption secret (min. 32 chars) | `replace-with-a-long-random-secret` | Generate via `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical application URL | `http://localhost:3000` | `https://finora.yourdomain.com` |

> **IMPORTANT:** Only `.env.example` is tracked in version control. Never commit `.env`, `.env.local`, or any production secrets.

---

## 5. SQLite Development Setup

For local development, SQLite requires zero external server setup:

```env
# .env.local
DATABASE_URL="file:./dev.db"
AUTH_SECRET="generate-a-secure-local-dev-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Database files (`dev.db`, `dev.db-journal`) are automatically stored locally and ignored by Git.

---

## 6. PostgreSQL Production Setup

In production, point `DATABASE_URL` to a managed PostgreSQL database (e.g., Supabase, Neon, AWS RDS, Railway, Render):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
AUTH_SECRET="<SECURE_32_CHAR_RANDOM_SECRET>"
NEXTAUTH_URL="https://your-production-app.vercel.app"
```

When switching the Prisma datasource provider for PostgreSQL deployments, update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 7. Prisma Migration Commands

Finora uses strict migration tracking to guarantee schema determinism between development and production.

### Local Development Migrations
```bash
# Validate Prisma schema syntax
npm run db:validate

# Generate Prisma Client types
npm run db:generate

# Apply migrations and create new ones if schema changed
npm run db:migrate
```

### Production Deployment Migrations
In production pipelines (CI/CD, Docker, Vercel, Railway), **never use `prisma db push`**. Always run:
```bash
npm run db:deploy
```
This executes all unapplied migrations safely using `prisma migrate deploy`.

---

## 8. Prisma Studio Instructions

Prisma Studio is an interactive visual database browser intended **strictly for local development**:

```bash
npm run db:studio
# or: npx prisma studio
```
This opens Prisma Studio at [http://localhost:5555](http://localhost:5555).

> **SECURITY WARNING:** Never expose Prisma Studio publicly in production. In production environments, use the built-in protected `/admin` portal or your cloud provider's private management console.

---

## 9. Admin Role Setup

Finora enforces a strict two-role authorization model:
- `USER`: Standard account (accesses only their personal data).
- `ADMIN`: Administrator (accesses `/admin` back-office, user directories, and system metrics).

### Promoting an Admin Account Safely
Admins **cannot** be created through public registration. Every registration automatically assigns the `USER` role. To promote an account to `ADMIN`, use the protected promotion script:

```bash
# Set ADMIN_EMAIL in environment and execute:
ADMIN_EMAIL="admin@example.com" npm run promote:admin
```

The script:
1. Validates and normalizes the target email.
2. Checks that the user exists.
3. Elevates the role to `ADMIN` safely without modifying passwords or other fields.
4. Fails safely if the user does not exist.

---

## 10. Admin Dashboard Access

Once an account has `ADMIN` privileges:
1. Sign in to Finora.
2. The desktop sidebar will display a dedicated **Admin Panel** link (`/admin`).
3. The Admin dashboard provides:
   - **System Overview (`/admin`):** Platform metrics (total users, transaction counts, budgets, goals, recent registrations).
   - **User Directory (`/admin/users`):** Search users by name/email, filter by role (`USER` vs `ADMIN`), paginate records, and safely export directories as CSV.
   - **User Details (`/admin/users/[id]`):** Inspect aggregate financial statistics, view individual transactions and budgets, promote/demote roles, and manage accounts with confirmation guards.
4. **Access Control:**
   - Unauthenticated visitors are redirected to `/login?callbackUrl=/admin`.
   - Non-admin users attempting to open `/admin` are immediately redirected to `/dashboard`.
   - API endpoints (`/api/admin/*`) return `401 Unauthorized` or `403 Forbidden`.

---

## 11. GitHub Safety Rules

Before uploading code to GitHub or any public git host, observe the following rules:

1. **Never Commit Secrets:**
   - Never commit `.env`, `.env.local`, `.env.production`, or private keys (`*.pem`, `*.key`).
   - `.env.example` must contain **placeholders only**.
2. **Never Commit User Databases:**
   - SQLite database files (`*.db`, `*.db-journal`, `prisma/dev.db`) are ignored in `.gitignore`. Real registered user records must stay in private databases.
3. **Verify Git Tree Before Pushing:**
   ```bash
   git status
   git diff
   git ls-files
   ```
4. **Audit for Accidentally Tracked Credentials:**
   ```bash
   git ls-files | grep -E '(\.env|\.db|\.pem|\.key)$'
   ```

---

## 12. Deployment Instructions

### Deploying to Vercel / Railway / Render
1. Push your repository to GitHub (ensuring `.env.local` and database files are ignored).
2. Create a new Project in your deployment platform linked to the repository.
3. Set the Environment Variables in your hosting dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `AUTH_SECRET`: A secure 32+ character random secret.
   - `NEXTAUTH_URL`: Your public production URL (e.g., `https://finora.vercel.app`).
4. Set the Build Command:
   ```bash
   npx prisma migrate deploy && npx prisma generate && npm run build
   ```
5. Set the Start Command:
   ```bash
   npm start
   ```

---

## 13. Security Notes

- **Password Hashing:** Passwords are encrypted using `bcryptjs` with 12 salt rounds. Password hashes are never returned by any user or admin API endpoint.
- **Timing & Enumeration Defense:** Authentication returns generic error responses to prevent email enumeration.
- **Ownership Verification:** All personal transaction, budget, goal, and category endpoints query by both record `id` AND session `userId`.
- **Response Sanitization:** Every API endpoint uses safe mappers (`toSafeTransaction`, `toSafeUser`, `toSafeBudget`, `toSafeGoal`) to strip internal database fields before serialization.
- **Zero Financial Logging:** Console statements never output financial amounts, user session objects, or tokens.

---

## 14. Testing Commands

Finora includes an automated test suite verifying response sanitization, calculation purity, privacy bullet masking, scrolling accessibility, theme resolution, and storage compliance.

```bash
# Run automated test suite
npm test

# Run TypeScript typecheck
npm run typecheck

# Run Next.js production build
npm run build

# Run code linter
npm run lint
```
