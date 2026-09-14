"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Toast from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  User,
  Globe,
  Bell,
  Shield,
  Download,
  Trash2,
  Tag,
  Palette,
  Check,
  Laptop,
  Sun,
  Moon,
  Leaf,
  Sparkles,
} from "lucide-react";
import { useTheme, THEME_OPTIONS, type Theme } from "@/hooks/useTheme";

const CURRENCIES = [
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState("appearance");
  const [categories, setCategories] = useState<any[]>([]);
  const { theme, resolvedTheme, isBrowserDark, setTheme } = useTheme();

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "currency", label: "Currency", icon: Globe },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "export", label: "Export Data", icon: Download },
    { id: "danger", label: "Delete Account", icon: Trash2 },
  ];

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  const handleExport = () => {
    window.location.href = "/api/transactions/export";
    setToast({ msg: "Export started!", type: "success" });
  };

  const getThemeIcon = (iconName: string) => {
    switch (iconName) {
      case "laptop":
        return <Laptop className="w-4 h-4" aria-hidden="true" />;
      case "sun":
        return <Sun className="w-4 h-4" aria-hidden="true" />;
      case "moon":
        return <Moon className="w-4 h-4" aria-hidden="true" />;
      case "leaf":
        return <Leaf className="w-4 h-4" aria-hidden="true" />;
      case "sparkles":
        return <Sparkles className="w-4 h-4" aria-hidden="true" />;
      default:
        return <Palette className="w-4 h-4" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#172033" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#64748B" }}>Manage your account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="md:w-48 flex-shrink-0" aria-label="Settings sections">
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: activeSection === id ? "#EFF6FF" : "transparent",
                  color: activeSection === id ? "#2563EB" : "#64748B",
                }}
                aria-current={activeSection === id ? "page" : undefined}
              >
                <Icon style={{ width: 16, height: 16 }} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: "#E2E8F0" }}>
          {activeSection === "profile" && (
            <div>
              <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Profile</h2>
              <div className="space-y-3 text-sm">
                <div><span style={{ color: "#64748B" }}>Name: </span><span className="font-medium" style={{ color: "#172033" }}>{session?.user?.name}</span></div>
                <div><span style={{ color: "#64748B" }}>Email: </span><span className="font-medium" style={{ color: "#172033" }}>{session?.user?.email}</span></div>
              </div>
              <p className="text-xs mt-4" style={{ color: "#64748B" }}>Profile editing coming in a future update.</p>
            </div>
          )}

          {/* ── Appearance & Themes ────────────────────────────────────────── */}
          {activeSection === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold" style={{ color: "#172033" }}>Appearance & Themes</h2>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                  Customize the look and feel of Finora. Choose a fixed theme or let it adapt automatically to your browser preference.
                </p>
              </div>

              {/* Browser sync status info banner */}
              <div
                className="p-3.5 rounded-xl border flex items-center justify-between text-xs"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderColor: "#E2E8F0",
                  color: "#64748B",
                }}
              >
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  <span>
                    Your browser prefers:{" "}
                    <strong style={{ color: "#172033" }}>
                      {isBrowserDark ? "Dark mode" : "Light mode"}
                    </strong>
                  </span>
                </div>
                <span className="text-[11px] font-medium">
                  Current theme:{" "}
                  <strong style={{ color: "#2563EB" }} className="capitalize">
                    {theme === "system" ? `System (${resolvedTheme})` : theme}
                  </strong>
                </span>
              </div>

              {/* Theme cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {THEME_OPTIONS.map((opt) => {
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setToast({ msg: `Theme updated to ${opt.label}`, type: "success" });
                      }}
                      className="flex flex-col text-left p-4 rounded-xl border transition-all relative overflow-hidden"
                      style={{
                        borderColor: isSelected ? "#2563EB" : "#E2E8F0",
                        backgroundColor: isSelected ? "#F8FAFC" : "transparent",
                        boxShadow: isSelected ? "0 0 0 1px #2563EB" : "none",
                      }}
                      aria-pressed={isSelected}
                    >
                      {/* Active checkmark */}
                      {isSelected && (
                        <div
                          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: "#2563EB" }}
                          aria-hidden="true"
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      )}

                      {/* Header row */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center border"
                          style={{
                            backgroundColor: opt.colorPreview.bg,
                            borderColor: "#E2E8F0",
                            color: opt.colorPreview.text,
                          }}
                        >
                          {getThemeIcon(opt.iconName)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#172033" }}>
                            {opt.label}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs flex-1 mb-3" style={{ color: "#64748B" }}>
                        {opt.description}
                      </p>

                      {/* Mini preview bar */}
                      <div className="flex items-center gap-1.5 pt-2 border-t" style={{ borderColor: "#E2E8F0" }}>
                        <span className="text-[10px]" style={{ color: "#64748B" }}>Preview:</span>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border shadow-xs"
                            style={{ backgroundColor: opt.colorPreview.bg, borderColor: "#E2E8F0" }}
                            title="Background"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border shadow-xs"
                            style={{ backgroundColor: opt.colorPreview.card, borderColor: "#E2E8F0" }}
                            title="Surface"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow-xs"
                            style={{ backgroundColor: opt.colorPreview.accent }}
                            title="Accent"
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === "currency" && (
            <div>
              <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Currency & Formatting</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>Display Currency</label>
                  <select id="currency" className="w-full px-3.5 py-2.5 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0", color: "#172033" }}>
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                </div>
                <p className="text-xs" style={{ color: "#64748B" }}>Currently displaying in Indian Rupees (₹). Multi-currency switching will be available in a future update.</p>
              </div>
            </div>
          )}

          {activeSection === "categories" && (
            <div>
              <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Manage Categories</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {["income", "expense"].map(type => (
                  <div key={type}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2 mt-4 first:mt-0" style={{ color: "#64748B" }}>{type}</p>
                    {categories.filter(c => c.type === type).map(c => (
                      <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: "#F8FAFC" }}>
                        <span className="text-sm" style={{ color: "#172033" }}>{c.icon} {c.name}</span>
                        <span className="text-xs" style={{ color: "#64748B" }}>{c.isDefault ? "Default" : "Custom"}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: "#64748B" }}>Custom category management (add/rename/delete) coming soon.</p>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Notifications</h2>
              <p className="text-sm" style={{ color: "#64748B" }}>Budget warning notifications will appear in the app when you approach or exceed a budget limit. Email notifications will be available in a future update.</p>
            </div>
          )}

          {activeSection === "security" && (
            <div>
              <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Security</h2>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border text-sm" style={{ borderColor: "#E2E8F0", backgroundColor: "#F0FDF4" }}>
                  <p className="font-medium" style={{ color: "#16A34A" }}>✓ Password is securely hashed</p>
                  <p className="text-xs mt-1" style={{ color: "#64748B" }}>Your password is stored using bcrypt hashing. We never store plain-text passwords.</p>
                </div>
                <p className="text-xs" style={{ color: "#64748B" }}>Password change functionality coming in a future update.</p>
                <button onClick={() => signOut({ callbackUrl: "/login" })} className="px-4 py-2 text-sm font-medium rounded-lg border" style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                  Sign out of all sessions
                </button>
              </div>
            </div>
          )}

          {activeSection === "export" && (
            <div>
              <h2 className="text-base font-semibold mb-4" style={{ color: "#172033" }}>Export Data</h2>
              <p className="text-sm mb-4" style={{ color: "#64748B" }}>Download all your transactions as a CSV file. Only your own data is included.</p>
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#2563EB", color: "white" }}>
                <Download className="w-4 h-4" /> Export Transactions (CSV)
              </button>
            </div>
          )}

          {activeSection === "danger" && (
            <div>
              <h2 className="text-base font-semibold mb-4" style={{ color: "#DC2626" }}>Delete Account</h2>
              <p className="text-sm mb-4" style={{ color: "#64748B" }}>Permanently delete your account and all data. This action cannot be undone.</p>
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                <Trash2 className="w-4 h-4" /> Delete My Account
              </button>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Account"
          message="Are you absolutely sure? This will permanently delete your account and all your financial data. This cannot be undone."
          confirmLabel="Yes, Delete My Account"
          onConfirm={() => {
            setShowDeleteConfirm(false);
            setToast({ msg: "Account deletion will be available in a future update.", type: "error" });
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
