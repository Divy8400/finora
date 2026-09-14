import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CategorySchema } from "@/lib/validations";
import { unauthorized, validationError } from "@/lib/authorization";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  let categories = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  // Ensure EMI category is present for the user
  const hasEmi = categories.some(
    (c) => c.name.toLowerCase() === "emi" && c.type === "expense"
  );
  if (!hasEmi) {
    await prisma.category.upsert({
      where: { userId_name_type: { userId, name: "EMI", type: "expense" } },
      update: {},
      create: {
        userId,
        name: "EMI",
        type: "expense",
        icon: "💳",
        color: "#F43F5E",
        isDefault: true,
      },
    });

    categories = await prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  }

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const body = await request.json();
  const parsed = CategorySchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors as Record<string, string[]>);

  const { name, type, icon, color } = parsed.data;

  const existing = await prisma.category.findFirst({ where: { userId, name, type } });
  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: { userId, name, type, icon: icon || null, color: color || null, isDefault: false },
  });
  return NextResponse.json(category, { status: 201 });
}
