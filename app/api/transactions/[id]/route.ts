import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TransactionSchema } from "@/lib/validations";
import { amountToMinor } from "@/lib/formatters";
import { unauthorized, notFound, validationError } from "@/lib/authorization";
import { toSafeTransaction } from "@/lib/safe-transaction";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const { id } = await params;

  // Always query with both id AND userId so one user cannot read another's record
  const tx = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });
  if (!tx) return notFound();
  return NextResponse.json(toSafeTransaction(tx));
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;
  const { id } = await params;

  // Verify ownership before reading the body
  const existing = await prisma.transaction.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return notFound();

  const body = await request.json();
  const parsed = TransactionSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>);

  const { type, amount, categoryId, description, paymentMethod, transactionDate } = parsed.data;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true, name: true, icon: true, type: true },
  });
  if (!category) return notFound();
  if (category.type !== type) {
    return NextResponse.json({ error: "Category type does not match transaction type" }, { status: 422 });
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      type,
      amountMinor: amountToMinor(amount),
      categoryId,
      description: description || null,
      paymentMethod: paymentMethod || null,
      transactionDate: new Date(transactionDate),
    },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });

  return NextResponse.json(toSafeTransaction(updated));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;
  const { id } = await params;

  const existing = await prisma.transaction.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return notFound();

  // Soft delete
  await prisma.transaction.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ message: "Transaction deleted" });
}
