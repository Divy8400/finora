"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, TrendingUp, Loader2 } from "lucide-react";
import { RegisterSchema } from "@/lib/validations";
import type { z } from "zod";

type RegisterForm = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Registration failed.");
      } else {
        router.push("/login?registered=1");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: "#2563EB" }}>
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#172033" }}>Create your Finora account</h1>
          <p className="mt-1 text-sm" style={{ color: "#64748B" }}>Start managing your finances today</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: "#E2E8F0" }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {serverError && (
              <div className="p-3 rounded-lg text-sm font-medium" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }} role="alert">
                {serverError}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register("name")}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: errors.name ? "#DC2626" : "#E2E8F0", color: "#172033" }}
                placeholder="Your name"
              />
              {errors.name && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: errors.email ? "#DC2626" : "#E2E8F0", color: "#172033" }}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password")}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: errors.password ? "#DC2626" : "#E2E8F0", color: "#172033" }}
                  placeholder="At least 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} aria-label={showPassword ? "Hide" : "Show"}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: "#172033" }}>
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: errors.confirmPassword ? "#DC2626" : "#E2E8F0", color: "#172033" }}
                  placeholder="Repeat password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} aria-label={showConfirm ? "Hide" : "Show"}>
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.confirmPassword.message}</p>}
            </div>

            {/* Terms */}
            <p className="text-xs" style={{ color: "#64748B" }}>
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: "#2563EB" }}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "#64748B" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "#2563EB" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
