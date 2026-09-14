import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, notFound } from "@/lib/authorization";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await getAdminSession();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) return notFound();

  const budgets = await prisma.budget.findMany({
    where: { userId: id },
    include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const safeBudgets = budgets.map((b) => ({
    id: b.id,
    categoryId: b.categoryId,
    categoryName: b.category.name,
    categoryColor: b.category.color,
    month: b.month,
    year: b.year,
    limitAmountMinor: b.limitAmountMinor,
    createdAt: b.createdAt.toISOString(),
  }));

  return NextResponse.json({ budgets: safeBudgets });
}
