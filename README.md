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


