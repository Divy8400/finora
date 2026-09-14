import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// ── Transaction ───────────────────────────────────────────────────────────────

export const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(100000000, "Amount is too large"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().max(200).optional().or(z.literal("")),
  paymentMethod: z.string().max(50).optional().or(z.literal("")),
  transactionDate: z.string().min(1, "Date is required"),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;

// ── Budget ────────────────────────────────────────────────────────────────────

export const BudgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  limitAmount: z
    .number()
    .positive("Budget must be greater than 0"),
});

export type BudgetInput = z.infer<typeof BudgetSchema>;

// ── Savings Goal ──────────────────────────────────────────────────────────────

export const GoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100),
  targetAmount: z
    .number()
    .positive("Target must be greater than 0"),
  savedAmount: z.number().min(0).optional(),
  targetDate: z.string().optional().or(z.literal("")),
  color: z.string().optional(),
});

export type GoalInput = z.infer<typeof GoalSchema>;

export const ContributionSchema = z.object({
  amount: z
    .number()
    .positive("Contribution must be greater than 0"),
});

// ── Category ──────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  type: z.enum(["income", "expense"]),
  icon: z.string().optional(),
  color: z.string().optional(),
});

// ── Onboarding ────────────────────────────────────────────────────────────────

export const OnboardingSchema = z.object({
  currency: z.string().default("INR"),
  monthlyIncome: z.number().min(0).optional(),
});
