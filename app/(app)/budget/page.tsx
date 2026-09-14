"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BudgetSchema, type BudgetInput } from "@/lib/validations";
import Modal from "@/components/ui/Modal";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import EmptyState from "@/components/ui/EmptyState";
import MonthSelector from "@/components/dashboard/MonthSelector";
import AmountDisplay from "@/components/ui/AmountDisplay";
import { getCurrentMonthYear } from "@/lib/formatters";
import { calcBudgetUsagePercent, getBudgetStatus, type BudgetStatus } from "@/lib/calculations";
import { usePrivacy } from "@/hooks/usePrivacy";
import { Loader2 } from "lucide-react";

const statusColors: Record<BudgetStatus, string> = {
  healthy: "#16A34A", warning: "#D97706", danger: "#DC2626", exceeded: "#DC2626", "not-set": "#64748B",
};
const statusLabels: Record<BudgetStatus, string> = {
  healthy: "On track", warning: "Approaching limit", danger: "Near limit", exceeded: "Exceeded", "not-set": "Not set",
};

export default function BudgetPage() {
  const [{ month, year }, setMonthYear] = useState(getCurrentMonthYear());
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categorySpend, setCategorySpend] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState<any>(null);
  const [deleteBudget, setDeleteBudget] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const { hidden } = usePrivacy();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [budRes, catRes, dashRes] = await Promise.all([
        fetch(`/api/budgets?month=${month}&year=${year}`),
        fetch("/api/categories"),
        fetch(`/api/dashboard?month=${month}&year=${year}`),
      ]);
      const [budData, catData, dashData] = await Promise.all([budRes.json(), catRes.json(), dashRes.json()]);
      setBudgets(budData);
      setCategories(catData.filter((c: any) => c.type === "expense"));
      const spendMap: Record<string, number> = {};
      (dashData.categorySpending || []).forEach((s: any) => { spendMap[s.categoryId] = s.amountMinor; });
      setCategorySpend(spendMap);
    } catch { setToast({ msg: "Failed to load", type: "error" }); }
    finally { setIsLoading(false); }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteBudget) return;
    await fetch(`/api/budgets/${deleteBudget.id}`, { method: "DELETE" });
    setToast({ msg: "Budget deleted", type: "success" });
    setDeleteBudget(null);
    load();
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = expenseCategories.filter((c) => !budgetedCategoryIds.has(c.id));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#172033" }}>Budget</h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>Track your spending limits</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector month={month} year={year} onChange={(m, y) => setMonthYear({ month: m, year: y })} />
          <button onClick={() => { setEditBudget(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#2563EB" }}>
            <Plus className="w-4 h-4" /> Add Budget
          </button>
        </div>
      </div>

      {isLoading ? (
        <p style={{ color: "#64748B" }} className="text-sm">Loading…</p>
      ) : budgets.length === 0 ? (
        <EmptyState icon="🎯" title="No budgets set" description="Set spending limits for your expense categories." action={
          <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#2563EB" }}>Set First Budget</button>
        } />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const used = categorySpend[b.categoryId] || 0;
            const usagePct = calcBudgetUsagePercent(used, b.limitAmountMinor);
            const status = getBudgetStatus(usagePct);
            const remaining = b.limitAmountMinor - used;
            return (
              <div key={b.id} className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold" style={{ color: "#172033" }}>{b.category?.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded font-medium mt-1 inline-block" style={{
                      backgroundColor: statusColors[status] + "20",
                      color: statusColors[status],
                    }}>{statusLabels[status]}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditBudget(b); setShowForm(true); }} className="p-1.5 rounded-lg" style={{ color: "#64748B" }} aria-label="Edit budget">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteBudget(b)} className="p-1.5 rounded-lg" style={{ color: "#DC2626" }} aria-label="Delete budget">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <ProgressBar value={usagePct || 0} color={statusColors[status]} label={`${b.category?.name} budget usage`} />
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div>
                    <p className="text-xs" style={{ color: "#64748B" }}>Spent</p>
                    <p className="text-sm font-semibold" style={{ color: "#172033" }}>
                      <AmountDisplay amountMinor={used} hidden={hidden} currency="INR" />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#64748B" }}>Budget</p>
                    <p className="text-sm font-semibold" style={{ color: "#172033" }}>
                      <AmountDisplay amountMinor={b.limitAmountMinor} hidden={hidden} currency="INR" />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#64748B" }}>Left</p>
                    <p className="text-sm font-semibold" style={{ color: remaining >= 0 ? "#16A34A" : "#DC2626" }}>
                      {hidden ? (
                        <AmountDisplay amountMinor={Math.abs(remaining)} hidden={hidden} currency="INR" />
                      ) : remaining >= 0 ? (
                        <AmountDisplay amountMinor={remaining} hidden={false} currency="INR" />
                      ) : (
                        <AmountDisplay amountMinor={Math.abs(remaining)} hidden={false} currency="INR" prefix="-" />
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center mt-2" style={{ color: "#64748B" }}>{usagePct?.toFixed(0) || 0}% of budget used</p>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <BudgetForm
          month={month} year={year}
          categories={editBudget ? categories : availableCategories}
          editBudget={editBudget}
          onClose={() => { setShowForm(false); setEditBudget(null); }}
          onSuccess={(msg: string) => { setShowForm(false); setEditBudget(null); setToast({ msg, type: "success" }); load(); }}
        />
      )}
      {deleteBudget && (
        <ConfirmDialog title="Delete Budget" message={`Delete budget for "${deleteBudget.category?.name}"?`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteBudget(null)} />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function BudgetForm({ month, year, categories, editBudget, onClose, onSuccess }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<BudgetInput>({
    resolver: zodResolver(BudgetSchema),
    defaultValues: { categoryId: editBudget?.categoryId || "", month, year, limitAmount: editBudget ? editBudget.limitAmountMinor / 100 : undefined },
  });

  const onSubmit = async (data: BudgetInput) => {
    setIsLoading(true);
    setServerError("");
    try {
      const res = editBudget
        ? await fetch(`/api/budgets/${editBudget.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        : await fetch("/api/budgets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) setServerError(json.error || "Failed to save budget.");
      else onSuccess(editBudget ? "Budget updated!" : "Budget created!");
    } catch { setServerError("Something went wrong."); }
    finally { setIsLoading(false); }
  };

  return (
    <Modal title={editBudget ? "Edit Budget" : "Set Budget"} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }} role="alert">{serverError}</div>}
        {!editBudget && (
          <div>
            <label htmlFor="budgetCategory" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>Category</label>
            <select id="budgetCategory" {...register("categoryId")} className="w-full px-3.5 py-2.5 rounded-lg border text-sm" style={{ borderColor: errors.categoryId ? "#DC2626" : "#E2E8F0", color: "#172033" }}>
              <option value="">Select expense category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ""}{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.categoryId.message}</p>}
          </div>
        )}
        <div>
          <label htmlFor="limitAmount" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>Budget Amount (₹)</label>
          <input id="limitAmount" type="number" step="0.01" min="1" {...register("limitAmount", { valueAsNumber: true })} className="w-full px-3.5 py-2.5 rounded-lg border text-sm" style={{ borderColor: errors.limitAmount ? "#DC2626" : "#E2E8F0", color: "#172033" }} placeholder="Enter budget amount" />
          {errors.limitAmount && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.limitAmount.message}</p>}
        </div>
        <input type="hidden" {...register("month", { valueAsNumber: true })} value={month} />
        <input type="hidden" {...register("year", { valueAsNumber: true })} value={year} />
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-lg border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Cancel</button>
          <button type="submit" disabled={isLoading} className="flex-1 py-2.5 text-sm font-medium rounded-lg text-white flex items-center justify-center gap-2" style={{ backgroundColor: "#2563EB" }}>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Saving…" : editBudget ? "Update" : "Set Budget"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
