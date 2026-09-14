"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Eye, EyeOff } from "lucide-react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import MonthSelector from "@/components/dashboard/MonthSelector";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import Toast from "@/components/ui/Toast";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import AmountDisplay from "@/components/ui/AmountDisplay";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { formatDate, getCurrentMonthYear } from "@/lib/formatters";
import { getBudgetStatus } from "@/lib/calculations";
import { usePrivacy } from "@/hooks/usePrivacy";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const statusColors: Record<string, string> = {
  healthy: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  exceeded: "#DC2626",
  "not-set": "#64748B",
};

const statusLabels: Record<string, string> = {
  healthy: "On track",
  warning: "Approaching limit",
  danger: "Near limit",
  exceeded: "Exceeded",
  "not-set": "Not set",
};

const PIE_COLORS = ["#2563EB", "#16A34A", "#D97706", "#7C3AED", "#0891B2", "#DC2626", "#65A30D", "#F59E0B", "#EC4899", "#14B8A6"];

export default function DashboardPage() {
  const [{ month, year }, setMonthYear] = useState(getCurrentMonthYear());
  const [data, setData] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const { hidden, toggle } = usePrivacy();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashRes, trendRes] = await Promise.all([
        fetch(`/api/dashboard?month=${month}&year=${year}`),
        fetch(`/api/reports?type=trends`),
      ]);
      if (!dashRes.ok || !trendRes.ok) {
        setToast({ msg: "Failed to load data", type: "error" });
        return;
      }
      const [dashData, trendData] = await Promise.all([dashRes.json(), trendRes.json()]);
      setData(dashData);
      setTrends(trendData);
    } catch {
      setToast({ msg: "Failed to load data", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const handleTransactionSuccess = (msg: string) => {
    setShowModal(false);
    setToast({ msg, type: "success" });
    load();
  };

  // Total spending across all categories for percentage calculation
  const totalCategorySpending: number = data?.categorySpending?.reduce(
    (sum: number, c: any) => sum + c.amountMinor,
    0
  ) ?? 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#172033" }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>Your financial overview</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile-visible privacy toggle (desktop toggle lives in the sidebar) */}
          <button
            onClick={toggle}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors"
            style={{
              borderColor: hidden ? "#BFDBFE" : "#E2E8F0",
              color: hidden ? "#2563EB" : "#64748B",
              backgroundColor: hidden ? "#EFF6FF" : "transparent",
            }}
            aria-label={hidden ? "Show amounts" : "Hide amounts"}
            title={hidden ? "Show amounts" : "Hide amounts"}
          >
            {hidden ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            <span className="hidden sm:inline">{hidden ? "Show" : "Hide"}</span>
          </button>
          <MonthSelector month={month} year={year} onChange={(m, y) => setMonthYear({ month: m, year: y })} />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#2563EB" }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SummaryCard title="Total Income" amountMinor={data?.totalIncome || 0} type="income" hidden={hidden} />
          <SummaryCard title="Total Expenses" amountMinor={data?.totalExpenses || 0} type="expense" hidden={hidden} />
          <SummaryCard title="Balance" amountMinor={data?.balance || 0} type="balance" hidden={hidden} />
          <SummaryCard
            title="Savings Rate"
            amountMinor={0}
            type="savings"
            hidden={hidden}
            subtitle={data?.savingsRate !== null ? `${data?.savingsRate?.toFixed(1)}% of income` : "Not available"}
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Trend chart */}
        <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Income vs Expenses (6 months)</h2>
          <p className="sr-only">Area chart showing income and expense trends over the last 6 months</p>
          {trends.length === 0 ? (
            <EmptyState icon="📈" title="No trend data yet" description="Add transactions to see trends." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends.map(t => ({ ...t, income: t.income / 100, expenses: t.expenses / 100 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={hidden
                    ? () => ["•••••", ""]
                    : (v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]
                  }
                />
                <Area type="monotone" dataKey="income" stroke="#16A34A" fill="#F0FDF4" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#DC2626" fill="#FEF2F2" strokeWidth={2} name="Expenses" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ─── Spending by Category — scrollable, accessible ─────────────────── */}
        <section
          className="min-w-0 bg-white rounded-xl border p-5 shadow-sm"
          style={{ borderColor: "#E2E8F0" }}
          aria-labelledby="spending-category-title"
        >
          <div className="mb-4">
            <h2
              id="spending-category-title"
              className="text-base font-semibold"
              style={{ color: "#172033" }}
            >
              Spending by Category
            </h2>
          </div>
          <p className="sr-only">Pie chart and scrollable list showing expense breakdown by category for the selected month</p>

          {!data?.categorySpending?.length ? (
            <EmptyState icon="🥧" title="No expense data" description="Add expense transactions to see breakdown." />
          ) : (
            /* Scrollable region — heading stays outside, chart + list scroll together */
            <div
              className="overflow-y-auto overflow-x-hidden overscroll-contain pr-1"
              style={{ maxHeight: "360px", paddingTop: "4px", paddingBottom: "12px" }}
              tabIndex={0}
              role="region"
              aria-labelledby="spending-category-title"
              // Focus ring via global :focus-visible styles in globals.css
            >
              {/* Chart — no inline labels to prevent clipping */}
              <div className="min-w-0" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categorySpending.map((c: any) => ({
                        name: c.name,
                        value: c.amountMinor / 100,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      labelLine={false}
                      label={false}
                    >
                      {data.categorySpending.map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={hidden
                        ? () => ["•••••", ""]
                        : (v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Separate accessible category list */}
              <ul
                className="mt-4 space-y-2.5"
                aria-label="Spending categories"
                style={{ paddingBottom: "4px" }}
              >
                {data.categorySpending.map((c: any, i: number) => {
                  const pct = totalCategorySpending > 0
                    ? ((c.amountMinor / totalCategorySpending) * 100).toFixed(0)
                    : "0";
                  return (
                    <li
                      key={c.categoryId ?? c.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      {/* Color dot — aria-hidden, name provides context */}
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        aria-hidden="true"
                      />
                      {/* Category name */}
                      <span className="flex-1 truncate" style={{ color: "#172033" }}>
                        {c.name}
                      </span>
                      {/* Amount — masked when hidden */}
                      <AmountDisplay
                        amountMinor={c.amountMinor}
                        hidden={hidden}
                        currency="INR"
                        className="font-medium flex-shrink-0"
                      />
                      {/* Percentage — kept visible even when amounts are hidden */}
                      <span
                        className="text-xs flex-shrink-0 w-10 text-right"
                        style={{ color: "#64748B" }}
                      >
                        {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* Budget Progress + Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Budget Progress */}
        <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Budget Progress</h2>
          {!data?.budgetProgress?.length ? (
            <EmptyState icon="🎯" title="No budgets set" description="Go to Budget page to set category budgets." />
          ) : (
            <div className="space-y-4">
              {data.budgetProgress.map((b: any) => (
                <div key={b.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium" style={{ color: "#172033" }}>{b.categoryName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{
                        backgroundColor: statusColors[b.status] + "20",
                        color: statusColors[b.status],
                      }}>
                        {statusLabels[b.status]}
                      </span>
                      <span className="text-xs" style={{ color: "#64748B" }}>
                        <AmountDisplay amountMinor={b.usedAmountMinor} hidden={hidden} currency="INR" />
                        {" / "}
                        <AmountDisplay amountMinor={b.limitAmountMinor} hidden={hidden} currency="INR" />
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={b.usagePercent || 0}
                    color={statusColors[b.status]}
                    label={`${b.categoryName} budget: ${b.usagePercent?.toFixed(0) || 0}% used`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Recent Transactions</h2>
          {!data?.recentTransactions?.length ? (
            <EmptyState icon="💳" title="No transactions" description="Start by adding your first transaction." />
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: "#F8FAFC" }}>
                    {t.category?.icon || (t.type === "income" ? "💰" : "💸")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#172033" }}>
                      {t.description || t.category?.name || "Transaction"}
                    </p>
                    <p className="text-xs" style={{ color: "#64748B" }}>{formatDate(t.transactionDate)}</p>
                  </div>
                  <AmountDisplay
                    amountMinor={t.amountMinor}
                    hidden={hidden}
                    currency="INR"
                    prefix={t.type === "income" ? "+" : "-"}
                    className="text-sm font-semibold flex-shrink-0"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <AddTransactionModal onClose={() => setShowModal(false)} onSuccess={handleTransactionSuccess} />
      )}
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
