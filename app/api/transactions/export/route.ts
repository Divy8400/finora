import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unauthorized } from "@/lib/authorization";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getMonthBoundaries } from "@/lib/dates";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: any = { userId, deletedAt: null };
  if (month && year) {
    const { start, end } = getMonthBoundaries(Number(month), Number(year));
    where.transactionDate = { gte: start, lt: end };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { transactionDate: "desc" },
  });

  const rows = [
    ["Date", "Description", "Category", "Type", "Payment Method", "Amount (INR)"].join(","),
    ...transactions.map((t) =>
      [
        formatDate(t.transactionDate),
        `"${(t.description || "").replace(/"/g, '""')}"`,
        `"${t.category.name}"`,
        t.type,
        t.paymentMethod || "",
        `"${formatCurrency(t.amountMinor)}"`,
      ].join(",")
    ),
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="finora-transactions.csv"`,
    },
  });
}
