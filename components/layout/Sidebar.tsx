"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Target,
  Settings,
  LogOut,
  TrendingUp,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Laptop,
  Leaf,
  Sparkles,
  Shield,
} from "lucide-react";
import { usePrivacy } from "@/hooks/usePrivacy";
import { useTheme, type Theme } from "@/hooks/useTheme";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: PiggyBank },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { hidden, toggle } = usePrivacy();
  const { theme, resolvedTheme, cycleTheme } = useTheme();

  const isAdmin = session?.user?.role === "ADMIN";

  const getThemeIcon = (t: Theme) => {
    switch (t) {
      case "system":
        return <Laptop className="flex-shrink-0" style={{ width: 15, height: 15 }} aria-hidden="true" />;
      case "light":
        return <Sun className="flex-shrink-0" style={{ width: 15, height: 15 }} aria-hidden="true" />;
      case "dark":
        return <Moon className="flex-shrink-0" style={{ width: 15, height: 15 }} aria-hidden="true" />;
      case "emerald":
        return <Leaf className="flex-shrink-0" style={{ width: 15, height: 15 }} aria-hidden="true" />;
      case "midnight":
        return <Sparkles className="flex-shrink-0" style={{ width: 15, height: 15 }} aria-hidden="true" />;
    }
  };

  const getThemeLabel = (t: Theme) => {
    switch (t) {
      case "system":
        return `System (${resolvedTheme})`;
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "emerald":
        return "Emerald";
      case "midnight":
        return "Midnight";
    }
  };

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 border-r z-30"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "#E2E8F0" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2563EB" }}>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold" style={{ color: "#172033" }}>Finora</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? "#EFF6FF" : "transparent",
                color: isActive ? "#2563EB" : "#64748B",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="flex-shrink-0" style={{ width: 18, height: 18 }} />
              {label}
            </Link>
          );
        })}

        {/* Admin Navigation link only shown to administrators */}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2"
            style={{
              backgroundColor: pathname.startsWith("/admin") ? "#FEF2F2" : "transparent",
              color: "#DC2626",
            }}
            aria-current={pathname.startsWith("/admin") ? "page" : undefined}
          >
            <Shield className="flex-shrink-0" style={{ width: 18, height: 18 }} />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Controls & User / logout */}
      <div className="p-4 border-t space-y-2.5" style={{ borderColor: "#E2E8F0" }}>
        {/* Theme Switcher */}
        <button
          onClick={cycleTheme}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors border"
          style={{
            borderColor: "#E2E8F0",
            color: "#64748B",
          }}
          aria-label={`Current theme is ${theme}. Click to switch theme.`}
          title={`Theme: ${getThemeLabel(theme)}. Click to switch.`}
        >
          <div className="flex items-center gap-2">
            {getThemeIcon(theme)}
            <span className="truncate">{getThemeLabel(theme)}</span>
          </div>
          <span className="text-[10px] uppercase font-semibold px-1 py-0.5 rounded" style={{ backgroundColor: "#F8FAFC", color: "#64748B" }}>
            Theme
          </span>
        </button>

        {/* Hide/Show amounts toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: hidden ? "#EFF6FF" : "transparent",
            color: hidden ? "#2563EB" : "#64748B",
            border: "1px solid",
            borderColor: hidden ? "#BFDBFE" : "#E2E8F0",
          }}
          aria-label={hidden ? "Show amounts" : "Hide amounts"}
          title={hidden ? "Show amounts" : "Hide amounts"}
        >
          {hidden ? (
            <EyeOff className="flex-shrink-0" style={{ width: 16, height: 16 }} aria-hidden="true" />
          ) : (
            <Eye className="flex-shrink-0" style={{ width: 16, height: 16 }} aria-hidden="true" />
          )}
          {hidden ? "Show amounts" : "Hide amounts"}
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 pt-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0" style={{ backgroundColor: "#2563EB" }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "#172033" }}>{userName}</p>
            <p className="text-xs truncate" style={{ color: "#64748B" }}>{userEmail}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{ color: "#64748B" }}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
