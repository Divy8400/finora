"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Download, Shield, ChevronLeft, ChevronRight, Filter, Eye } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import Toast from "@/components/ui/Toast";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  currency: string;
  timezone: string;
  createdAt: string;
  transactionCount: number;
  budgetCount: number;
  goalCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      params.set("page", String(page));
      params.set("limit", "10");

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        setToast({ msg: "Failed to load users", type: "error" });
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch {
      setToast({ msg: "Network error loading users", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleExport = () => {
    window.location.href = "/api/admin/export";
    setToast({ msg: "Exporting user directory...", type: "success" });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
            User Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {totalCount} registered user{totalCount !== 1 ? "s" : ""} across all roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
            style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
          >
            <Download className="w-4 h-4" />
            Export Directory (CSV)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="bg-white rounded-xl border p-4 shadow-xs flex flex-wrap items-center gap-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users by name or email..."
            className="w-full text-sm outline-none bg-transparent"
            style={{ color: "var(--text-main)" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border text-sm"
            style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
          >
            <option value="">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "var(--border)" }}>
          <LoadingSkeleton rows={5} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No users found"
          description="No user accounts matched your search criteria."
        />
      ) : (
        <div
          className="bg-white rounded-xl border shadow-xs overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--hover-bg)" }}>
                  {["Name", "Email", "Role", "Currency", "Timezone", "Registered", "Activity", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--text-main)" }}>
                      {u.name}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold uppercase inline-flex items-center gap-1"
                        style={{
                          backgroundColor: u.role === "ADMIN" ? "#FEF2F2" : "#EFF6FF",
                          color: u.role === "ADMIN" ? "#DC2626" : "#2563EB",
                        }}
                      >
                        {u.role === "ADMIN" && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {u.currency}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {u.timezone}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {u.transactionCount} txns · {u.budgetCount} budgets
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                        style={{ borderColor: "var(--border)", color: "var(--text-main)" }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="p-4 border-t flex items-center justify-between text-xs"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <span>
              Page {page} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800"
                style={{ borderColor: "var(--border)" }}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800"
                style={{ borderColor: "var(--border)" }}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
