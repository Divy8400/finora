import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultExpenseCategories = [
  { name: "Food & Dining", icon: "🍽️", color: "#EF4444" },
  { name: "Transportation", icon: "🚗", color: "#F97316" },
  { name: "Shopping", icon: "🛍️", color: "#EAB308" },
  { name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
  { name: "Health & Medical", icon: "🏥", color: "#06B6D4" },
  { name: "Utilities", icon: "💡", color: "#6366F1" },
  { name: "Rent & Housing", icon: "🏠", color: "#84CC16" },
  { name: "Education", icon: "📚", color: "#F59E0B" },
  { name: "Groceries", icon: "🛒", color: "#10B981" },
  { name: "EMI", icon: "💳", color: "#F43F5E" },
  { name: "Other Expenses", icon: "📦", color: "#6B7280" },
];

const defaultIncomeCategories = [
  { name: "Salary", icon: "💼", color: "#16A34A" },
  { name: "Freelance", icon: "💻", color: "#2563EB" },
  { name: "Business", icon: "🏢", color: "#7C3AED" },
  { name: "Investments", icon: "📈", color: "#0891B2" },
  { name: "Other Income", icon: "💰", color: "#65A30D" },
];

export async function seedDefaultCategories(userId: string) {
  const expenseCategories = await Promise.all(
    defaultExpenseCategories.map((cat) =>
      prisma.category.upsert({
        where: { userId_name_type: { userId, name: cat.name, type: "expense" } },
        update: {},
        create: {
          userId,
          name: cat.name,
          type: "expense",
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
        },
      })
    )
  );

  const incomeCategories = await Promise.all(
    defaultIncomeCategories.map((cat) =>
      prisma.category.upsert({
        where: { userId_name_type: { userId, name: cat.name, type: "income" } },
        update: {},
        create: {
          userId,
          name: cat.name,
          type: "income",
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
        },
      })
    )
  );

  return { expenseCategories, incomeCategories };
}

async function main() {
  console.log("Seed file ready. Categories seeded per user on registration.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
