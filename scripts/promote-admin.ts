import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function promoteAdmin() {
  const rawEmail = process.env.ADMIN_EMAIL;

  if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.trim()) {
    console.error("Error: ADMIN_EMAIL environment variable is required.");
    console.error('Usage: ADMIN_EMAIL="user@example.com" npx tsx scripts/promote-admin.ts');
    process.exit(1);
  }

  const normalizedEmail = rawEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    console.error(`Error: User with email "${normalizedEmail}" was not found.`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`User "${normalizedEmail}" is already an ADMIN.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });

  console.log(`Successfully promoted "${normalizedEmail}" to ADMIN.`);
}

promoteAdmin()
  .catch((err) => {
    console.error("Failed to promote user to admin:", err.message || "An unexpected error occurred");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
