import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, notFound } from "@/lib/authorization";
import { toSafeTransaction } from "@/lib/safe-transaction";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await getAdminSession();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) return notFound();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const skip = (page - 1) * limit;
  const type = searchParams.get("type");

  const where: any = { userId: id, deletedAt: null };
  if (type === "income" || type === "expense") {
    where.type = type;
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { category: { select: { id: true, name: true, icon: true } } },
      orderBy: { transactionDate: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    transactions: transactions.map(toSafeTransaction),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
