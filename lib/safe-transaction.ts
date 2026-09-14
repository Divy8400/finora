/**
 * Safe model types and mappers.
 * Only fields required by the UI are serialized.
 * Sensitive and internal fields (passwordHash, internal session tokens,
 * unnecessary timestamps, internal foreign keys) are intentionally omitted.
 */

export type SafeCategory = {
  id: string;
  name: string;
  icon: string | null;
  color?: string | null;
};

export type SafeTransaction = {
  id: string;
  type: "income" | "expense";
  amountMinor: number;
  transactionDate: string;
  description: string | null;
  paymentMethod: string | null;
  category: SafeCategory | null;
};

type RawTransaction = {
  id: string;
  type: string;
  amountMinor: number;
  transactionDate: Date;
  description: string | null;
  paymentMethod: string | null;
  category?: {
    id: string;
    name: string;
    icon: string | null;
    color?: string | null;
  } | null;
};

export function toSafeTransaction(transaction: RawTransaction): SafeTransaction {
  return {
    id: transaction.id,
    type: transaction.type as "income" | "expense",
    amountMinor: transaction.amountMinor,
    transactionDate: transaction.transactionDate.toISOString(),
    description: transaction.description ?? null,
    paymentMethod: transaction.paymentMethod ?? null,
    category: transaction.category
      ? {
          id: transaction.category.id,
          name: transaction.category.name,
          icon: transaction.category.icon ?? null,
        }
      : null,
  };
}

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  currency: string;
  timezone: string;
  createdAt: string;
};

export function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  role?: string;
  currency: string;
  timezone: string;
  createdAt: Date;
}): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "USER",
    currency: user.currency,
    timezone: user.timezone,
    createdAt: user.createdAt.toISOString(),
  };
}

export type SafeBudget = {
  id: string;
  categoryId: string;
  month: number;
  year: number;
  limitAmountMinor: number;
  category?: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
};

export function toSafeBudget(budget: {
  id: string;
  categoryId: string;
  month: number;
  year: number;
  limitAmountMinor: number;
  category?: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
}): SafeBudget {
  return {
    id: budget.id,
    categoryId: budget.categoryId,
    month: budget.month,
    year: budget.year,
    limitAmountMinor: budget.limitAmountMinor,
    category: budget.category
      ? {
          id: budget.category.id,
          name: budget.category.name,
          icon: budget.category.icon ?? null,
          color: budget.category.color ?? null,
        }
      : null,
  };
}

export type SafeGoal = {
  id: string;
  name: string;
  targetAmountMinor: number;
  savedAmountMinor: number;
  targetDate: string | null;
  color: string | null;
  createdAt: string;
};

export function toSafeGoal(goal: {
  id: string;
  name: string;
  targetAmountMinor: number;
  savedAmountMinor: number;
  targetDate?: Date | null;
  color?: string | null;
  createdAt: Date;
}): SafeGoal {
  return {
    id: goal.id,
    name: goal.name,
    targetAmountMinor: goal.targetAmountMinor,
    savedAmountMinor: goal.savedAmountMinor,
    targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
    color: goal.color ?? null,
    createdAt: goal.createdAt.toISOString(),
  };
}

export type SafeNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export function toSafeNotification(notification: {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}): SafeNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}
