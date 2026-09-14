import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/authorization";

export async function GET(_: NextRequest) {
  const { errorResponse } = await getAdminSession();
  if (errorResponse) return errorResponse;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      currency: true,
      timezone: true,
      createdAt: true,
      _count: {
        select: {
          transactions: { where: { deletedAt: null } },
          budgets: true,
          goals: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "User ID",
    "Name",
    "Email",
    "Role",
    "Currency",
    "Timezone",
    "Created At",
    "Transactions Count",
    "Budgets Count",
    "Goals Count",
  ];

  const escapeCsv = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = users.map((u) =>
    [
      escapeCsv(u.id),
      escapeCsv(u.name),
      escapeCsv(u.email),
      escapeCsv(u.role),
      escapeCsv(u.currency),
      escapeCsv(u.timezone),
      escapeCsv(u.createdAt.toISOString()),
      escapeCsv(u._count.transactions),
      escapeCsv(u._count.budgets),
      escapeCsv(u._count.goals),
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="finora-users-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
