"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoalSchema, ContributionSchema, type GoalInput } from "@/lib/validations";
import Modal from "@/components/ui/Modal";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import EmptyState from "@/components/ui/EmptyState";
import AmountDisplay from "@/components/ui/AmountDisplay";
import { formatDate } from "@/lib/formatters";
import { calcGoalProgress, calcGoalProgressUncapped } from "@/lib/calculations";
import { usePrivacy } from "@/hooks/usePrivacy";
import { Loader2 } from "lucide-react";

const GOAL_COLORS = ["#2563EB", "#16A34A", "#D97706", "#7C3AED", "#0891B2", "#DC2626"];

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<any>(null);
  const [deleteGoal, setDeleteGoal] = useState<any>(null);
  const [contributeGoal, setContributeGoal] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const { hidden } = usePrivacy();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/goals");
      setGoals(await res.json());
    } catch { setToast({ msg: "Failed to load goals", type: "error" }); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteGoal) return;
    await fetch(`/api/goals/${deleteGoal.id}`, { method: "DELETE" });
    setToast({ msg: "Goal deleted", type: "success" });
    setDeleteGoal(null);
    load();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#172033" }}>Savings Goals</h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>Track your savings targets</p>
        </div>
        <button onClick={() => { setEditGoal(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white self-start" style={{ backgroundColor: "#2563EB" }}>
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {isLoading ? (
        <p style={{ color: "#64748B" }} className="text-sm">Loading…</p>
      ) : goals.length === 0 ? (
        <EmptyState icon="🎯" title="No savings goals yet" description="Create your first goal to start saving towards something meaningful." action={
          <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#2563EB" }}>Create Goal</button>
        } />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((g, idx) => {
            const progress = calcGoalProgress(g.savedAmountMinor, g.targetAmountMinor);
            const progressReal = calcGoalProgressUncapped(g.savedAmountMinor, g.targetAmountMinor);
            const remaining = g.targetAmountMinor - g.savedAmountMinor;
            const color = g.color || GOAL_COLORS[idx % GOAL_COLORS.length];
            const isComplete = progress >= 100;
            return (
              <div key={g.id} className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} aria-hidden />
                    <h3 className="font-semibold" style={{ color: "#172033" }}>{g.name}</h3>
                    {isComplete && <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: "#F0FDF4", color: "#16A34A" }}>✓ Complete</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditGoal(g); setShowForm(true); }} className="p-1.5 rounded-lg" style={{ color: "#64748B" }} aria-label="Edit goal"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteGoal(g)} className="p-1.5 rounded-lg" style={{ color: "#DC2626" }} aria-label="Delete goal"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span style={{ color: "#64748B" }}>Progress</span>
                    <span className="font-medium" style={{ color: "#172033" }}>{progressReal.toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={progress} color={color} label={`${g.name} savings progress`} height={10} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs" style={{ color: "#64748B" }}>Saved</p>
                    <p className="font-semibold" style={{ color: "#16A34A" }}>
                      <AmountDisplay amountMinor={g.savedAmountMinor} hidden={hidden} currency="INR" />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#64748B" }}>Target</p>
                    <p className="font-semibold" style={{ color: "#172033" }}>
                      <AmountDisplay amountMinor={g.targetAmountMinor} hidden={hidden} currency="INR" />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#64748B" }}>Remaining</p>
                    <p className="font-semibold" style={{ color: remaining > 0 ? "#172033" : "#16A34A" }}>
                      {hidden ? (
                        <AmountDisplay amountMinor={Math.abs(remaining)} hidden={true} currency="INR" />
                      ) : remaining > 0 ? (
                        <AmountDisplay amountMinor={remaining} hidden={false} currency="INR" />
                      ) : (
                        "Goal reached!"
                      )}
                    </p>
                  </div>
                  {g.targetDate && <div><p className="text-xs" style={{ color: "#64748B" }}>Target date</p><p className="font-semibold" style={{ color: "#172033" }}>{formatDate(g.targetDate)}</p></div>}
                </div>

                <button onClick={() => setContributeGoal(g)} className="mt-4 w-full py-2 text-sm font-medium rounded-lg border transition-colors" style={{ borderColor: color, color }}>
                  + Add Contribution
                </button>
              </div>
            );
          })}
        </div>
      )}

      {(showForm || editGoal) && (
        <GoalForm goal={editGoal} onClose={() => { setShowForm(false); setEditGoal(null); }} onSuccess={(msg: string) => { setShowForm(false); setEditGoal(null); setToast({ msg, type: "success" }); load(); }} />
      )}
      {contributeGoal && (
        <ContributionModal goal={contributeGoal} onClose={() => setContributeGoal(null)} onSuccess={(msg: string) => { setContributeGoal(null); setToast({ msg, type: "success" }); load(); }} />
      )}
      {deleteGoal && (
        <ConfirmDialog title="Delete Goal" message={`Delete "${deleteGoal.name}"? This cannot be undone.`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteGoal(null)} />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function GoalForm({ goal, onClose, onSuccess }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<GoalInput>({
    resolver: zodResolver(GoalSchema),
    defaultValues: {
      name: goal?.name || "",
      targetAmount: goal ? goal.targetAmountMinor / 100 : undefined,
      savedAmount: goal ? goal.savedAmountMinor / 100 : 0,
      targetDate: goal?.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : "",
      color: goal?.color || "",
    },
  });

  const onSubmit = async (data: GoalInput) => {
    setIsLoading(true);
    setServerError("");
    try {
      const url = goal ? `/api/goals/${goal.id}` : "/api/goals";
      const method = goal ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) setServerError(json.error || "Failed to save.");
      else onSuccess(goal ? "Goal updated!" : "Goal created!");
    } catch { setServerError("Something went wrong."); }
    finally { setIsLoading(false); }
  };

  return (
    <Modal title={goal ? "Edit Goal" : "New Savings Goal"} onClose={onClose} size="md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }} role="alert">{serverError}</div>}
        <div>
          <label htmlFor="goalName" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>Goal name</label>
          <input id="goalName" type="text" {...register("name")} className="w-full px-3.5 py-2.5 rounded-lg border text-sm" style={{ borderColor: errors.name ? "#DC2626" : "#E2E8F0" }} placeholder="e.g. Emergency Fund" />
          {errors.name && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="targetAmount" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>Target Amount (₹)</label>
          <input id="targetAmount" type="number" step="0.01" min="1" {...register("targetAmount", { valueAsNumber: true })} className="w-full px-3.5 py-2.5 rounded-lg border text-sm" style={{ borderColor: errors.targetAmount ? "#DC2626" : "#E2E8F0" }} placeholder="0.00" />
          {errors.targetAmount && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.targetAmount.message}</p>}
        </div>
        {!goal && (
          <div>
            <label htmlFor="savedAmount" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>Already saved (₹) <span style={{ color: "#64748B" }}>(optional)</span></label>
            <input id="savedAmount" type="number" step="0.01" min="0" {...register("savedAmount", { valueAsNumber: true })} className="w-full px-3.5 py-2.5 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="0.00" />
          </div>
        )}
        <div>
          <label htmlFor="targetDate" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>Target Date <span style={{ color: "#64748B" }}>(optional)</span></label>
          <input id="targetDate" type="date" {...register("targetDate")} className="w-full px-3.5 py-2.5 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0" }} />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-lg border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Cancel</button>
          <button type="submit" disabled={isLoading} className="flex-1 py-2.5 text-sm font-medium rounded-lg text-white flex items-center justify-center gap-2" style={{ backgroundColor: "#2563EB" }}>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Saving…" : goal ? "Update" : "Create Goal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ContributionModal({ goal, onClose, onSuccess }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { amount: undefined } });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setServerError("");
    try {
      const res = await fetch(`/api/goals/${goal.id}/contributions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(data.amount) }) });
      const json = await res.json();
      if (!res.ok) setServerError(json.error || "Failed to add contribution.");
      else onSuccess("Contribution added!");
    } catch { setServerError("Something went wrong."); }
    finally { setIsLoading(false); }
  };

  return (
    <Modal title={`Add to "${goal.name}"`} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>{serverError}</div>}
        <div>
          <label htmlFor="contribution" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>Amount (₹)</label>
          <input id="contribution" type="number" step="0.01" min="0.01" {...register("amount", { required: true, min: 0.01, valueAsNumber: true })} className="w-full px-3.5 py-2.5 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Enter amount" />
          {errors.amount && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>Amount must be greater than 0</p>}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-lg border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>Cancel</button>
          <button type="submit" disabled={isLoading} className="flex-1 py-2.5 text-sm font-medium rounded-lg text-white flex items-center justify-center gap-2" style={{ backgroundColor: "#16A34A" }}>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Adding…" : "Add Contribution"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
