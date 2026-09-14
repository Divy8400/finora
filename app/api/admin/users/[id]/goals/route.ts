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

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
  });

  const safeGoals = goals.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmountMinor: g.targetAmountMinor,
    savedAmountMinor: g.savedAmountMinor,
    targetDate: g.targetDate ? g.targetDate.toISOString() : null,
    color: g.color,
    createdAt: g.createdAt.toISOString(),
  }));

  return NextResponse.json({ goals: safeGoals });
}
