import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoalSchema } from "@/lib/validations";
import { amountToMinor } from "@/lib/formatters";
import { unauthorized, notFound, validationError } from "@/lib/authorization";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;
  const { id } = await params;

  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  const body = await request.json();
  const parsed = GoalSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as any);

  const { name, targetAmount, targetDate, color } = parsed.data;
  const updated = await prisma.savingsGoal.update({
    where: { id },
    data: {
      name,
      targetAmountMinor: amountToMinor(targetAmount),
      targetDate: targetDate ? new Date(targetDate) : null,
      color: color || null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;
  const { id } = await params;

  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  await prisma.savingsGoal.delete({ where: { id } });
  return NextResponse.json({ message: "Goal deleted" });
}
