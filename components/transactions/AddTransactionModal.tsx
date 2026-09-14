"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionSchema, type TransactionInput } from "@/lib/validations";
import Modal from "@/components/ui/Modal";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string | null;
}

interface AddTransactionModalProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  editTransaction?: any;
}

const paymentMethods = ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet", "Other"];

export default function AddTransactionModal({ onClose, onSuccess, editTransaction }: AddTransactionModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const isEdit = !!editTransaction;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      type: editTransaction?.type || "expense",
      amount: editTransaction ? editTransaction.amountMinor / 100 : undefined,
      categoryId: editTransaction?.categoryId || "",
      description: editTransaction?.description || "",
      paymentMethod: editTransaction?.paymentMethod || "",
      transactionDate: editTransaction
        ? new Date(editTransaction.transactionDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  // Reset category when type changes
  useEffect(() => {
    setValue("categoryId", "");
  }, [selectedType, setValue]);

  const onSubmit = async (data: TransactionInput) => {
    setIsLoading(true);
    setServerError("");
    try {
      const url = isEdit ? `/api/transactions/${editTransaction.id}` : "/api/transactions";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Something went wrong.");
      } else {
        onSuccess(isEdit ? "Transaction updated!" : "Transaction added!");
      }
    } catch {
      setServerError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`;
  const inputStyle = (hasError: boolean) => ({
    borderColor: hasError ? "#DC2626" : "#E2E8F0",
    color: "#172033",
  });

  return (
    <Modal title={isEdit ? "Edit Transaction" : "Add Transaction"} onClose={onClose} size="md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }} role="alert">
            {serverError}
          </div>
        )}

        {/* Type toggle */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#172033" }}>Type</label>
          <div className="flex gap-2">
            {(["income", "expense"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue("type", t)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors capitalize"
                style={{
                  backgroundColor: selectedType === t ? (t === "income" ? "#F0FDF4" : "#FEF2F2") : "#F8FAFC",
                  borderColor: selectedType === t ? (t === "income" ? "#16A34A" : "#DC2626") : "#E2E8F0",
                  color: selectedType === t ? (t === "income" ? "#16A34A" : "#DC2626") : "#64748B",
                }}
                aria-pressed={selectedType === t}
              >
                {t === "income" ? "💰 Income" : "💸 Expense"}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>
            Amount (₹)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            {...register("amount", { valueAsNumber: true })}
            className={inputClass(!!errors.amount)}
            style={inputStyle(!!errors.amount)}
            placeholder="0.00"
          />
          {errors.amount && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.amount.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>
            Category
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className={inputClass(!!errors.categoryId)}
            style={inputStyle(!!errors.categoryId)}
          >
            <option value="">Select a category</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ""}{c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.categoryId.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="transactionDate" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>
            Date
          </label>
          <input
            id="transactionDate"
            type="date"
            {...register("transactionDate")}
            className={inputClass(!!errors.transactionDate)}
            style={inputStyle(!!errors.transactionDate)}
          />
          {errors.transactionDate && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.transactionDate.message}</p>}
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>
            Payment Method <span style={{ color: "#64748B" }}>(optional)</span>
          </label>
          <select
            id="paymentMethod"
            {...register("paymentMethod")}
            className={inputClass(false)}
            style={inputStyle(false)}
          >
            <option value="">Select method</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>
            Description <span style={{ color: "#64748B" }}>(optional)</span>
          </label>
          <input
            id="description"
            type="text"
            {...register("description")}
            className={inputClass(false)}
            style={inputStyle(false)}
            placeholder="e.g. Grocery shopping"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium rounded-lg border"
            style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium rounded-lg text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#2563EB" }}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Saving…" : isEdit ? "Update" : "Save Transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
