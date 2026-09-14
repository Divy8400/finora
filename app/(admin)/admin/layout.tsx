import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Users,
  LayoutDashboard,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Server-side guard: unauthenticated redirected to /login, non-admin redirected to /dashboard
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-page)" }}>
      {/* Top Admin Header */}
      <header
        className="sticky top-0 z-30 border-b px-4 lg:px-8 py-3.5 flex items-center justify-between"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: "#DC2626" }}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold" style={{ color: "var(--text-main)" }}>
                Finora Admin
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded text-red-700 bg-red-100 dark:bg-red-950 dark:text-red-300">
                Authorized
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              style={{ color: "var(--text-main)" }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              style={{ color: "var(--text-main)" }}
            >
              <Users className="w-4 h-4" />
              Users
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to App</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
