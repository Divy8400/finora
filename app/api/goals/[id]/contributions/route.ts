import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ContributionSchema } from "@/lib/validations";
import { amountToMinor } from "@/lib/formatters";
import { unauthorized, notFound, validationError } from "@/lib/authorization";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;
  const { id } = await params;

  const goal = await prisma.savingsGoal.findFirst({ where: { id, userId } });
  if (!goal) return notFound();

  const body = await request.json();
  const parsed = ContributionSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as any);

  const newSaved = goal.savedAmountMinor + amountToMinor(parsed.data.amount);

  const updated = await prisma.savingsGoal.update({
    where: { id },
    data: { savedAmountMinor: newSaved },
  });

  return NextResponse.json(updated);
}
