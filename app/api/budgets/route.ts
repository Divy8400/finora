import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BudgetSchema } from "@/lib/validations";
import { amountToMinor } from "@/lib/formatters";
import { unauthorized, validationError, notFound } from "@/lib/authorization";
import { parseMonthYear } from "@/lib/dates";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const { month, year } = parseMonthYear(
    searchParams.get("month") || new Date().getMonth() + 1,
    searchParams.get("year") || new Date().getFullYear()
  );

  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: { category: true },
  });

  return NextResponse.json(budgets);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const body = await request.json();
  const parsed = BudgetSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as any);

  const { categoryId, month, year, limitAmount } = parsed.data;

  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) return notFound();

  const budget = await prisma.budget.upsert({
    where: { userId_categoryId_month_year: { userId, categoryId, month, year } },
    update: { limitAmountMinor: amountToMinor(limitAmount) },
    create: { userId, categoryId, month, year, limitAmountMinor: amountToMinor(limitAmount) },
    include: { category: true },
  });

  return NextResponse.json(budget, { status: 201 });
}
