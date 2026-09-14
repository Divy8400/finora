import { prisma } from "@/lib/db";
import Link from "next/link";
import { Users, Shield, ArrowRight, Wallet, Target, PiggyBank, Calendar } from "lucide-react";
import { formatDate } from "@/lib/formatters";

export default async function AdminOverviewPage() {
  const [
    totalUsers,
    adminUsers,
    totalTransactions,
    totalBudgets,
    totalGoals,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.transaction.count({ where: { deletedAt: null } }),
    prisma.budget.count(),
    prisma.savingsGoal.count(),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        currency: true,
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
      take: 5,
    }),
  ]);

  const regularUsers = totalUsers - adminUsers;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
            Admin Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            System overview and user management. Protected administrator area.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-xs"
          style={{ backgroundColor: "#2563EB" }}
        >
          <Users className="w-4 h-4" />
          Manage Users
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="bg-white rounded-xl border p-5 shadow-xs"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Total Users
            </p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2" style={{ color: "var(--text-main)" }}>
            {totalUsers}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {regularUsers} USER · {adminUsers} ADMIN
          </p>
        </div>

        <div
          className="bg-white rounded-xl border p-5 shadow-xs"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Transactions
            </p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2" style={{ color: "var(--text-main)" }}>
            {totalTransactions}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Active non-deleted records
          </p>
        </div>

        <div
          className="bg-white rounded-xl border p-5 shadow-xs"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Budgets Active
            </p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2" style={{ color: "var(--text-main)" }}>
            {totalBudgets}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Category budget allocations
          </p>
        </div>

        <div
          className="bg-white rounded-xl border p-5 shadow-xs"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Savings Goals
            </p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2" style={{ color: "var(--text-main)" }}>
            {totalGoals}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Active targets tracked
          </p>
        </div>
      </div>

      {/* Recent User Registrations */}
      <div
        className="bg-white rounded-xl border shadow-xs overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-main)" }}>
              Recent Registrations
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Latest registered users across the platform
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-xs font-medium inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View All Users
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--hover-bg)" }}>
                {["Name", "Email", "Role", "Registered", "Activity", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--text-main)" }}>
                    {u.name}
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {u.email}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
                      style={{
                        backgroundColor: u.role === "ADMIN" ? "#FEF2F2" : "#EFF6FF",
                        color: u.role === "ADMIN" ? "#DC2626" : "#2563EB",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {u._count.transactions} txns · {u._count.budgets} budgets
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                      style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
