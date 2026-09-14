import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unauthorized } from "@/lib/authorization";
import { parseMonthYear, getMonthBoundaries, getLast6Months } from "@/lib/dates";
import { calcMonthlyIncome, calcMonthlyExpenses } from "@/lib/calculations";
import { getMonthName } from "@/lib/formatters";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "monthly";
  const { month, year } = parseMonthYear(
    searchParams.get("month") || new Date().getMonth() + 1,
    searchParams.get("year") || new Date().getFullYear()
  );

  if (type === "trends") {
    const months = getLast6Months();
    const trends = await Promise.all(
      months.map(async ({ month: m, year: y }) => {
        const { start, end } = getMonthBoundaries(m, y);
        // Select only the fields needed for the calculation — no internal fields returned
        const txs = await prisma.transaction.findMany({
          where: { userId, deletedAt: null, transactionDate: { gte: start, lt: end } },
          select: { type: true, amountMinor: true, deletedAt: true },
        });
        return {
          label: `${getMonthName(m).slice(0, 3)} ${y}`,
          income: calcMonthlyIncome(txs),
          expenses: calcMonthlyExpenses(txs),
        };
      })
    );
    return NextResponse.json(trends);
  }

  // Monthly report
  const { start, end } = getMonthBoundaries(month, year);
  const transactions = await prisma.transaction.findMany({
    where: { userId, deletedAt: null, transactionDate: { gte: start, lt: end } },
    include: { category: { select: { id: true, name: true, color: true } } },
    orderBy: { amountMinor: "desc" },
  });

  const income = calcMonthlyIncome(transactions);
  const expenses = calcMonthlyExpenses(transactions);

  // Category breakdown — safe shape
  const categoryMap: Record<string, { name: string; color: string | null; amount: number }> = {};
  for (const t of transactions) {
    if (t.type === "expense") {
      if (!categoryMap[t.categoryId]) {
        categoryMap[t.categoryId] = { name: t.category.name, color: t.category.color, amount: 0 };
      }
      categoryMap[t.categoryId].amount += t.amountMinor;
    }
  }
  const categories = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);

  // Largest transactions — only the safe fields needed by the UI
  const largest = transactions.slice(0, 5).map((t) => ({
    id: t.id,
    description: t.description,
    category: t.category.name,
    type: t.type,
    amountMinor: t.amountMinor,
    date: t.transactionDate.toISOString(),
  }));

  return NextResponse.json({ month, year, income, expenses, categories, largest });
}
