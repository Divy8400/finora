"use client";

import { useState, useEffect, useCallback } from "react";
import MonthSelector from "@/components/dashboard/MonthSelector";
import EmptyState from "@/components/ui/EmptyState";
import AmountDisplay from "@/components/ui/AmountDisplay";
import { getCurrentMonthYear, getMonthName } from "@/lib/formatters";
import { usePrivacy } from "@/hooks/usePrivacy";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const PIE_COLORS = ["#2563EB", "#16A34A", "#D97706", "#7C3AED", "#0891B2", "#DC2626", "#65A30D", "#F59E0B"];

export default function ReportsPage() {
  const [{ month, year }, setMonthYear] = useState(getCurrentMonthYear());
  const [report, setReport] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hidden } = usePrivacy();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [repRes, trendRes] = await Promise.all([
        fetch(`/api/reports?month=${month}&year=${year}`),
        fetch(`/api/reports?type=trends`),
      ]);
      const [repData, trendData] = await Promise.all([repRes.json(), trendRes.json()]);
      setReport(repData);
      setTrends(trendData);
    } catch { /* errors already handled gracefully */ }
    finally { setIsLoading(false); }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const netBalance = report ? report.income - report.expenses : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#172033" }}>Reports</h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>Spending insights and trends</p>
        </div>
        <MonthSelector month={month} year={year} onChange={(m, y) => setMonthYear({ month: m, year: y })} />
      </div>

      {/* Monthly summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Income", value: report?.income || 0, color: "#16A34A", bg: "#F0FDF4" },
          { label: "Expenses", value: report?.expenses || 0, color: "#DC2626", bg: "#FEF2F2" },
          { label: "Net Balance", value: netBalance, color: netBalance >= 0 ? "#16A34A" : "#DC2626", bg: netBalance >= 0 ? "#F0FDF4" : "#FEF2F2" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
            <p className="text-sm" style={{ color: "#64748B" }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>
              <AmountDisplay
                amountMinor={Math.abs(s.value)}
                hidden={hidden}
                currency="INR"
              />
            </p>
            <p className="text-xs mt-1" style={{ color: "#64748B" }}>{getMonthName(month)} {year}</p>
          </div>
        ))}
      </div>

      {/* 6-Month Trend */}
      <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
        <h2 className="text-base font-semibold mb-1" style={{ color: "#172033" }}>6-Month Trend</h2>
        <p className="text-sm mb-4" style={{ color: "#64748B" }}>
          {trends.length > 0
            ? `Income and expenses over the last 6 months. ${trends[trends.length - 1]?.income > trends[trends.length - 1]?.expenses ? "Income exceeds expenses this period." : "Expenses exceed income this period."}`
            : "No data yet."}
        </p>
        <p className="sr-only">Bar chart showing monthly income and expense totals for the last 6 months</p>
        {trends.length === 0 ? (
          <EmptyState icon="📊" title="No trend data" description="Add transactions over multiple months to see trends." />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trends.map(t => ({ ...t, income: t.income / 100, expenses: t.expenses / 100 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={hidden
                  ? () => ["•••••", ""]
                  : (v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]
                }
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Breakdown + Largest */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Pie */}
        <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Category Breakdown</h2>
          <p className="sr-only">Pie chart showing expense breakdown by category</p>
          {!report?.categories?.length ? (
            <EmptyState icon="🥧" title="No expense data" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={report.categories.map((c: any) => ({ name: c.name, value: c.amount / 100 }))}
                    cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    labelLine={false} label={false}
                  >
                    {report.categories.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={hidden
                      ? () => ["•••••", ""]
                      : (v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {report.categories.map((c: any, i: number) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} aria-hidden />
                      <span style={{ color: "#172033" }}>{c.name}</span>
                    </div>
                    <AmountDisplay
                      amountMinor={c.amount}
                      hidden={hidden}
                      currency="INR"
                      className="font-medium"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Largest Transactions */}
        <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Largest Transactions</h2>
          {!report?.largest?.length ? (
            <EmptyState icon="💳" title="No transactions" />
          ) : (
            <div className="space-y-3">
              {report.largest.map((t: any, i: number) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#F8FAFC", color: "#64748B" }}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#172033" }}>{t.description || t.category}</p>
                    <p className="text-xs" style={{ color: "#64748B" }}>{t.category}</p>
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
    </div>
  );
}
