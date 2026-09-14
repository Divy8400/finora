"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  Trash2,
  Calendar,
  Clock,
  Coins,
  Wallet,
  PiggyBank,
  Target,
  Check,
} from "lucide-react";
import { formatDate } from "@/lib/formatters";
import AmountDisplay from "@/components/ui/AmountDisplay";
import Toast from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface UserDetailProps {
  params: Promise<{ id: string }>;
}

export default function AdminUserDetailPage({ params }: UserDetailProps) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"transactions" | "budgets" | "goals">("transactions");
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [uRes, txRes, bRes, gRes] = await Promise.all([
        fetch(`/api/admin/users/${id}`),
        fetch(`/api/admin/users/${id}/transactions?limit=20`),
        fetch(`/api/admin/users/${id}/budgets`),
        fetch(`/api/admin/users/${id}/goals`),
      ]);

      if (!uRes.ok) {
        setToast({ msg: "Failed to load user details", type: "error" });
        return;
      }

      const [uData, txData, bData, gData] = await Promise.all([
        uRes.json(),
        txRes.json(),
        bRes.json(),
        gRes.json(),
      ]);

      setUser(uData.user);
      setTransactions(txData.transactions || []);
      setBudgets(bData.budgets || []);
      setGoals(gData.goals || []);
    } catch {
      setToast({ msg: "Error fetching data", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleToggle = async () => {
    if (!user) return;
    const targetRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ msg: data.error || "Failed to update role", type: "error" });
      } else {
        setToast({ msg: `User role changed to ${targetRole}`, type: "success" });
        setUser((prev: any) => ({ ...prev, role: targetRole }));
      }
    } catch {
      setToast({ msg: "Request failed", type: "error" });
    } finally {
      setShowRoleConfirm(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ msg: data.error || "Failed to delete user", type: "error" });
        setShowDeleteConfirm(false);
      } else {
        setToast({ msg: "User deleted successfully", type: "success" });
        router.push("/admin/users");
      }
    } catch {
      setToast({ msg: "Delete request failed", type: "error" });
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-base" style={{ color: "var(--text-secondary)" }}>
          User not found or deleted.
        </p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm border"
          style={{ borderColor: "var(--border)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to User Directory
        </Link>
      </div>
    );
  }

  const newTargetRole = user.role === "ADMIN" ? "USER" : "ADMIN";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-blue-600"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to User Directory
        </Link>
      </div>

      {/* User Header Profile Card */}
      <div
        className="bg-white rounded-xl border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
            style={{ backgroundColor: user.role === "ADMIN" ? "#DC2626" : "#2563EB" }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
                {user.name}
              </h1>
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold uppercase inline-flex items-center gap-1"
                style={{
                  backgroundColor: user.role === "ADMIN" ? "#FEF2F2" : "#EFF6FF",
                  color: user.role === "ADMIN" ? "#DC2626" : "#2563EB",
                }}
              >
                {user.role === "ADMIN" && <Shield className="w-3 h-3" />}
                {user.role}
              </span>
            </div>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Registered: {formatDate(user.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                Currency: {user.currency}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Timezone: {user.timezone}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setShowRoleConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
            style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
          >
            {user.role === "ADMIN" ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Demote to USER
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Promote to ADMIN
              </>
            )}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 border border-red-200 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete User
          </button>
        </div>
      </div>

      {/* Financial Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-xs" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Total Transactions</p>
          <p className="text-lg font-bold mt-1" style={{ color: "var(--text-main)" }}>
            {user.stats?.transactionCount || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-xs" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Total Income</p>
          <p className="text-lg font-bold mt-1 text-green-600">
            <AmountDisplay amountMinor={user.stats?.totalIncomeMinor || 0} currency={user.currency} />
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-xs" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Total Expenses</p>
          <p className="text-lg font-bold mt-1 text-red-600">
            <AmountDisplay amountMinor={user.stats?.totalExpensesMinor || 0} currency={user.currency} />
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-xs" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Net Balance</p>
          <p className="text-lg font-bold mt-1" style={{ color: "var(--text-main)" }}>
            <AmountDisplay amountMinor={user.stats?.balanceMinor || 0} currency={user.currency} />
          </p>
        </div>
      </div>

      {/* User Data Tabs */}
      <div className="bg-white rounded-xl border shadow-xs overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="flex border-b px-4 gap-4" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setActiveTab("transactions")}
            className="py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: activeTab === "transactions" ? "#2563EB" : "transparent",
              color: activeTab === "transactions" ? "#2563EB" : "var(--text-secondary)",
            }}
          >
            Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("budgets")}
            className="py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: activeTab === "budgets" ? "#2563EB" : "transparent",
              color: activeTab === "budgets" ? "#2563EB" : "var(--text-secondary)",
            }}
          >
            Budgets ({budgets.length})
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className="py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: activeTab === "goals" ? "#2563EB" : "transparent",
              color: activeTab === "goals" ? "#2563EB" : "var(--text-secondary)",
            }}
          >
            Savings Goals ({goals.length})
          </button>
        </div>

        <div className="p-4">
          {activeTab === "transactions" && (
            transactions.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: "var(--text-secondary)" }}>
                No transaction records found for this user.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "var(--hover-bg)" }}>
                      {["Date", "Description", "Category", "Type", "Amount"].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {transactions.map((t) => (
                      <tr key={t.id} className="text-sm hover:bg-gray-50/50">
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                          {formatDate(t.transactionDate)}
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text-main)" }}>
                          {t.description || "—"}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                          {t.category?.name || "General"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded text-xs font-semibold capitalize"
                            style={{
                              backgroundColor: t.type === "income" ? "#F0FDF4" : "#FEF2F2",
                              color: t.type === "income" ? "#16A34A" : "#DC2626",
                            }}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold" style={{ color: t.type === "income" ? "#16A34A" : "#DC2626" }}>
                          <AmountDisplay amountMinor={t.amountMinor} currency={user.currency} prefix={t.type === "income" ? "+" : "-"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {activeTab === "budgets" && (
            budgets.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: "var(--text-secondary)" }}>
                No active budgets configured for this user.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {budgets.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-lg border" style={{ borderColor: "var(--border)" }}>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-main)" }}>{b.categoryName}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      Month: {b.month}/{b.year}
                    </p>
                    <p className="text-sm font-semibold mt-2" style={{ color: "var(--text-main)" }}>
                      Limit: <AmountDisplay amountMinor={b.limitAmountMinor} currency={user.currency} />
                    </p>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "goals" && (
            goals.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: "var(--text-secondary)" }}>
                No savings goals created by this user.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {goals.map((g) => (
                  <div key={g.id} className="p-3.5 rounded-lg border" style={{ borderColor: "var(--border)" }}>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-main)" }}>{g.name}</p>
                    <div className="flex justify-between text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                      <span>Saved: <AmountDisplay amountMinor={g.savedAmountMinor} currency={user.currency} /></span>
                      <span>Target: <AmountDisplay amountMinor={g.targetAmountMinor} currency={user.currency} /></span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {showRoleConfirm && (
        <ConfirmDialog
          title={`Change role to ${newTargetRole}?`}
          message={`Are you sure you want to change ${user.name}'s role from ${user.role} to ${newTargetRole}?`}
          confirmLabel={`Change to ${newTargetRole}`}
          isDestructive={newTargetRole === "USER"}
          onConfirm={handleRoleToggle}
          onCancel={() => setShowRoleConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete User Account"
          message={`Are you sure you want to permanently delete ${user.name} (${user.email})? All their transactions, budgets, categories, and goals will be completely erased. This cannot be undone.`}
          confirmLabel="Permanently Delete User"
          isDestructive={true}
          onConfirm={handleDeleteUser}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
