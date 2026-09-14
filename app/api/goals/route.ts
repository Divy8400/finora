import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoalSchema } from "@/lib/validations";
import { amountToMinor } from "@/lib/formatters";
import { unauthorized, notFound, validationError } from "@/lib/authorization";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const body = await request.json();
  const parsed = GoalSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as any);

  const { name, targetAmount, savedAmount, targetDate, color } = parsed.data;

  const goal = await prisma.savingsGoal.create({
    data: {
      userId,
      name,
      targetAmountMinor: amountToMinor(targetAmount),
      savedAmountMinor: amountToMinor(savedAmount || 0),
      targetDate: targetDate ? new Date(targetDate) : null,
      color: color || null,
    },
  });
  return NextResponse.json(goal, { status: 201 });
}
