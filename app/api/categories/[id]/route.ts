import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CategorySchema } from "@/lib/validations";
import { unauthorized, notFound, validationError } from "@/lib/authorization";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;
  const { id } = await params;

  const existing = await prisma.category.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  const body = await request.json();
  const parsed = CategorySchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as any);

  const updated = await prisma.category.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;
  const { id } = await params;

  const existing = await prisma.category.findFirst({ where: { id, userId } });
  if (!existing) return notFound();

  if (existing.isDefault) {
    return NextResponse.json({ error: "Cannot delete default categories" }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ message: "Category deleted" });
}
