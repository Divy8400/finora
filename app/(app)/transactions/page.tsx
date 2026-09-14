"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Download, Edit2, Trash2 } from "lucide-react";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import AmountDisplay from "@/components/ui/AmountDisplay";
import { formatDate } from "@/lib/formatters";
import { usePrivacy } from "@/hooks/usePrivacy";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("transactionDate");
  const [sortDir, setSortDir] = useState("desc");
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<any>(null);
  const [deleteTx, setDeleteTx] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const { hidden } = usePrivacy();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterType) params.set("type", filterType);
      if (filterCategory) params.set("categoryId", filterCategory);
      params.set("sortBy", sortBy);
      params.set("sortDir", sortDir);

      const [txRes, catRes] = await Promise.all([
        fetch(`/api/transactions?${params}`),
        fetch("/api/categories"),
      ]);
      const [txData, catData] = await Promise.all([txRes.json(), catRes.json()]);
      setTransactions(txData);
      setCategories(catData);
    } catch {
      setToast({ msg: "Failed to load transactions", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [search, filterType, filterCategory, sortBy, sortDir]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTx) return;
    try {
      await fetch(`/api/transactions/${deleteTx.id}`, { method: "DELETE" });
      setToast({ msg: "Transaction deleted", type: "success" });
      setDeleteTx(null);
      load();
    } catch {
      setToast({ msg: "Failed to delete", type: "error" });
    }
  };

  const exportCSV = () => {
    window.location.href = `/api/transactions/export?${new URLSearchParams({ type: filterType, categoryId: filterCategory })}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#172033" }}>Transactions</h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#2563EB" }}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 shadow-sm flex flex-wrap gap-3" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#64748B" }} aria-hidden />
          <input
            type="search"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm border-none outline-none bg-transparent"
            style={{ color: "#172033" }}
            aria-label="Search transactions"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0", color: "#172033" }} aria-label="Filter by type">
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0", color: "#172033" }} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={`${sortBy}-${sortDir}`} onChange={(e) => { const [s, d] = e.target.value.split("-"); setSortBy(s); setSortDir(d); }} className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0", color: "#172033" }} aria-label="Sort">
          <option value="transactionDate-desc">Newest first</option>
          <option value="transactionDate-asc">Oldest first</option>
          <option value="amountMinor-desc">Highest amount</option>
          <option value="amountMinor-asc">Lowest amount</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
          <LoadingSkeleton rows={5} />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState icon="💳" title="No transactions found" description="Try adjusting filters or add your first transaction." action={
          <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#2563EB" }}>
            Add Transaction
          </button>
        } />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC" }}>
                    {["Date", "Description", "Category", "Type", "Payment", "Amount", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748B" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "#E2E8F0" }}>
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm" style={{ color: "#64748B" }}>{formatDate(t.transactionDate)}</td>
                      <td className="px-4 py-3 text-sm font-medium max-w-[200px] truncate" style={{ color: "#172033" }}>{t.description || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-sm" style={{ color: "#172033" }}>
                          {t.category?.icon} {t.category?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{
                          backgroundColor: t.type === "income" ? "#F0FDF4" : "#FEF2F2",
                          color: t.type === "income" ? "#16A34A" : "#DC2626",
                        }}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#64748B" }}>{t.paymentMethod || "—"}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: t.type === "income" ? "#16A34A" : "#DC2626" }}>
                        <AmountDisplay
                          amountMinor={t.amountMinor}
                          hidden={hidden}
                          currency="INR"
                          prefix={t.type === "income" ? "+" : "-"}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setEditTx(t)} className="p-1.5 rounded-lg transition-colors" style={{ color: "#64748B" }} aria-label={`Edit ${t.description || "transaction"}`}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTx(t)} className="p-1.5 rounded-lg transition-colors" style={{ color: "#DC2626" }} aria-label={`Delete ${t.description || "transaction"}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border p-4 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: "#F8FAFC" }}>
                    {t.category?.icon || (t.type === "income" ? "💰" : "💸")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: "#172033" }}>{t.description || t.category?.name}</p>
                      <AmountDisplay
                        amountMinor={t.amountMinor}
                        hidden={hidden}
                        currency="INR"
                        prefix={t.type === "income" ? "+" : "-"}
                        className="text-sm font-bold flex-shrink-0"
                      />
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{formatDate(t.transactionDate)} · {t.category?.name} {t.paymentMethod ? `· ${t.paymentMethod}` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditTx(t)} className="flex-1 py-1.5 text-xs rounded-lg border text-center" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Edit</button>
                  <button onClick={() => setDeleteTx(t)} className="flex-1 py-1.5 text-xs rounded-lg border text-center" style={{ borderColor: "#FECACA", color: "#DC2626" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {(showModal || editTx) && (
        <AddTransactionModal
          onClose={() => { setShowModal(false); setEditTx(null); }}
          onSuccess={(msg) => { setShowModal(false); setEditTx(null); setToast({ msg, type: "success" }); load(); }}
          editTransaction={editTx}
        />
      )}
      {deleteTx && (
        <ConfirmDialog
          title="Delete Transaction"
          message={`Are you sure you want to delete "${deleteTx.description || "this transaction"}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTx(null)}
        />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
