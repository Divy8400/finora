import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BudgetSchema } from "@/lib/validations";
import { amountToMinor } from "@/lib/formatters";
import { unauthorized, notFound, validationError } from "@/lib/authorization";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;
  const { id } = await params;

  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  const body = await request.json();
  const parsed = BudgetSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as any);

  const updated = await prisma.budget.update({
    where: { id },
    data: { limitAmountMinor: amountToMinor(parsed.data.limitAmount) },
    include: { category: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;
  const { id } = await params;

  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  await prisma.budget.delete({ where: { id } });
  return NextResponse.json({ message: "Budget deleted" });
}
