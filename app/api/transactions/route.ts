import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TransactionSchema } from "@/lib/validations";
import { amountToMinor } from "@/lib/formatters";
import { getMonthBoundaries } from "@/lib/dates";
import { unauthorized, validationError } from "@/lib/authorization";
import { toSafeTransaction } from "@/lib/safe-transaction";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const sortBy = searchParams.get("sortBy") || "transactionDate";
  const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";

  // Restrict sortBy to known columns to prevent injection
  const allowedSortColumns = ["transactionDate", "amountMinor"];
  const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "transactionDate";

  const where: Record<string, unknown> = { userId, deletedAt: null };
  if (type === "income" || type === "expense") where.type = type;
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.description = { contains: search };
  }
  if (month && year) {
    const { start, end } = getMonthBoundaries(Number(month), Number(year));
    where.transactionDate = { gte: start, lt: end };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: { select: { id: true, name: true, icon: true } } },
    orderBy: { [safeSortBy]: sortDir },
  });

  // Return safe shapes — no userId, deletedAt, createdAt, updatedAt, currency, etc.
  return NextResponse.json(transactions.map(toSafeTransaction));
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const body = await request.json();
  const parsed = TransactionSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const { type, amount, categoryId, description, paymentMethod, transactionDate } = parsed.data;

  // Verify category ownership and type match
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true, name: true, icon: true, type: true },
  });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  if (category.type !== type) {
    return NextResponse.json(
      { error: "Category type does not match transaction type" },
      { status: 422 }
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      categoryId,
      type,
      amountMinor: amountToMinor(amount),
      currency: "INR",
      description: description || null,
      paymentMethod: paymentMethod || null,
      transactionDate: new Date(transactionDate),
    },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json(toSafeTransaction(transaction), { status: 201 });
}
