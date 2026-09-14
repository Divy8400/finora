import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, notFound } from "@/lib/authorization";
import { z } from "zod";

const UpdateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  name: z.string().min(1).max(100).optional(),
});

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await getAdminSession();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      currency: true,
      timezone: true,
      onboarded: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          transactions: { where: { deletedAt: null } },
          budgets: true,
          goals: true,
          categories: true,
        },
      },
    },
  });

  if (!user) return notFound();

  // Aggregate user financial statistics safely for admin overview
  const transactions = await prisma.transaction.findMany({
    where: { userId: id, deletedAt: null },
    select: { type: true, amountMinor: true },
  });

  let totalIncomeMinor = 0;
  let totalExpensesMinor = 0;
  for (const t of transactions) {
    if (t.type === "income") totalIncomeMinor += t.amountMinor;
    else if (t.type === "expense") totalExpensesMinor += t.amountMinor;
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      currency: user.currency,
      timezone: user.timezone,
      onboarded: user.onboarded,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      stats: {
        transactionCount: user._count.transactions,
        budgetCount: user._count.budgets,
        goalCount: user._count.goals,
        categoryCount: user._count.categories,
        totalIncomeMinor,
        totalExpensesMinor,
        balanceMinor: totalIncomeMinor - totalExpensesMinor,
      },
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await getAdminSession();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = await request.json();

  const parsed = UpdateUserRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return notFound();

  // Guard: admin cannot demote themselves to prevent accidental lockout
  if (session?.user?.id === id && parsed.data.role === "USER") {
    return NextResponse.json(
      { error: "You cannot remove your own admin status." },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      currency: true,
      timezone: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "User updated successfully",
    user: {
      ...updated,
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await getAdminSession();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  // Guard: admin cannot delete their own account
  if (session?.user?.id === id) {
    return NextResponse.json(
      { error: "You cannot delete your own admin account." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return notFound();

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ message: "User deleted successfully" });
}
