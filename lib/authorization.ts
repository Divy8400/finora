import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export type UserRole = "USER" | "ADMIN";

/**
 * Throws a 401 Response if user is not authenticated.
 * Returns the session user.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session.user;
}

/**
 * Throws a 401 Response if unauthenticated, or 403 Response if not an ADMIN.
 * Returns the admin session user.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (session.user.role !== "ADMIN") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session.user;
}

/**
 * Helper for API Route handlers to authenticate and authorize admin users.
 * Returns { session, errorResponse }. If errorResponse is present, return it directly.
 */
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, errorResponse: unauthorized() };
  }
  if (session.user.role !== "ADMIN") {
    return { session: null, errorResponse: forbidden() };
  }
  return { session, errorResponse: null };
}

export async function getOwnedTransaction(userId: string, transactionId: string) {
  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, userId, deletedAt: null },
  });
  if (!tx) return null;
  return tx;
}

export async function getOwnedBudget(userId: string, budgetId: string) {
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  });
  return budget;
}

export async function getOwnedGoal(userId: string, goalId: string) {
  const goal = await prisma.savingsGoal.findFirst({
    where: { id: goalId, userId },
  });
  return goal;
}

export async function getOwnedCategory(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  return category;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function validationError(errors: Record<string, string[]>) {
  return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
}
