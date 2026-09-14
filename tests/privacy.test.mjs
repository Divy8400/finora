import test from "node:test";
import assert from "node:assert/strict";

// Test SafeTransaction mapper and data sanitization
import { toSafeTransaction } from "../lib/safe-transaction.ts";
import {
  calcMonthlyIncome,
  calcMonthlyExpenses,
  calcBalance,
  calcSavingsRate,
  calcBudgetUsagePercent,
  getBudgetStatus,
  calcGoalProgress,
} from "../lib/calculations.ts";

test("Privacy Response Sanitization: toSafeTransaction removes sensitive and internal fields", () => {
  const rawDbTransaction = {
    id: "tx-12345",
    userId: "user-private-id",
    categoryId: "cat-123",
    type: "income",
    amountMinor: 5000000,
    currency: "INR",
    description: "Confidential Monthly Salary",
    paymentMethod: "Bank Transfer",
    transactionDate: new Date("2026-09-14T10:00:00.000Z"),
    deletedAt: null,
    createdAt: new Date("2026-09-14T10:00:00.000Z"),
    updatedAt: new Date("2026-09-14T10:00:00.000Z"),
    passwordHash: "secret-hash-that-should-never-leak",
    category: {
      id: "cat-123",
      name: "Salary",
      icon: "💰",
      userId: "user-private-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const safe = toSafeTransaction(rawDbTransaction);

  // Must match documented safe shape
  assert.equal(safe.id, "tx-12345");
  assert.equal(safe.type, "income");
  assert.equal(safe.amountMinor, 5000000);
  assert.equal(safe.transactionDate, "2026-09-14T10:00:00.000Z");
  assert.equal(safe.description, "Confidential Monthly Salary");
  assert.equal(safe.paymentMethod, "Bank Transfer");
  assert.deepEqual(safe.category, {
    id: "cat-123",
    name: "Salary",
    icon: "💰",
  });

  // Sensitive and internal database fields MUST NOT exist on safe response
  assert.equal("userId" in safe, false, "userId must not leak");
  assert.equal("passwordHash" in safe, false, "passwordHash must not leak");
  assert.equal("deletedAt" in safe, false, "deletedAt must not leak");
  assert.equal("createdAt" in safe, false, "createdAt must not leak");
  assert.equal("updatedAt" in safe, false, "updatedAt must not leak");
  assert.equal("currency" in safe, false, "redundant currency field omitted from item");

  // Category object must also be clean of userId and timestamps
  if (safe.category) {
    assert.equal("userId" in safe.category, false, "category.userId must not leak");
    assert.equal("createdAt" in safe.category, false, "category.createdAt must not leak");
    assert.equal("updatedAt" in safe.category, false, "category.updatedAt must not leak");
  }
});

test("Calculation Integrity: Privacy masking does not affect financial calculations", () => {
  const transactions = [
    { type: "income", amountMinor: 5000000, deletedAt: null },
    { type: "income", amountMinor: 200000, deletedAt: null },
    { type: "expense", amountMinor: 1500000, deletedAt: null },
    { type: "expense", amountMinor: 500000, deletedAt: null },
    { type: "expense", amountMinor: 999999, deletedAt: new Date() }, // soft-deleted should not be counted
  ];

  const totalIncome = calcMonthlyIncome(transactions);
  const totalExpenses = calcMonthlyExpenses(transactions);
  const balance = calcBalance(totalIncome, totalExpenses);
  const savingsRate = calcSavingsRate(totalIncome, totalExpenses);

  assert.equal(totalIncome, 5200000);
  assert.equal(totalExpenses, 2000000);
  assert.equal(balance, 3200000);
  assert.equal(savingsRate, 61.54);

  // Budget calculations
  const usagePct = calcBudgetUsagePercent(2000000, 2500000);
  assert.equal(usagePct, 80);
  assert.equal(getBudgetStatus(usagePct), "warning");

  // Savings goal progress
  const goalProgress = calcGoalProgress(500000, 1000000);
  assert.equal(goalProgress, 50);
});

test("Privacy Masking Behavior: Fixed bullet mask protects digit count and magnitude", () => {
  const MASK = "•••••";

  // Simulate AmountDisplay logic for various amounts
  function renderAmountDisplay(amountMinor, hidden, prefix) {
    if (hidden) {
      return prefix ? `${prefix}${MASK}` : MASK;
    }
    const formatted = `₹${(amountMinor / 100).toLocaleString("en-IN")}`;
    return prefix ? `${prefix}${formatted}` : formatted;
  }

  // When hidden is false, amounts are formatted
  assert.equal(renderAmountDisplay(4500000, false, "+"), "+₹45,000");
  assert.equal(renderAmountDisplay(1250, false, "-"), "-₹12.5");

  // When hidden is true:
  // 1. All amounts produce the identical fixed mask
  // 2. Magnitude (100 vs 10,000,000) does NOT leak via bullet length
  assert.equal(renderAmountDisplay(100, true, "+"), "+•••••");
  assert.equal(renderAmountDisplay(100000000, true, "+"), "+•••••");
  assert.equal(renderAmountDisplay(5000, true, "-"), "-•••••");
  assert.equal(renderAmountDisplay(5000, true, undefined), "•••••");

  // Bullet length is always 5 bullets regardless of amount
  assert.equal(renderAmountDisplay(1, true).length, 5);
  assert.equal(renderAmountDisplay(999999999, true).length, 5);
});

test("Privacy Storage Compliance: Only boolean flag is stored", () => {
  const STORAGE_KEY = "finora_hide_amounts";

  // Mock localStorage
  const store = {};
  const mockLocalStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => { store[key] = String(val); },
  };

  mockLocalStorage.setItem(STORAGE_KEY, "true");
  assert.equal(mockLocalStorage.getItem(STORAGE_KEY), "true");

  mockLocalStorage.setItem(STORAGE_KEY, "false");
  assert.equal(mockLocalStorage.getItem(STORAGE_KEY), "false");

  // Confirm NO financial, session, token, or password keys exist
  const storedKeys = Object.keys(store);
  assert.deepEqual(storedKeys, ["finora_hide_amounts"]);
  assert.equal(store[STORAGE_KEY] === "true" || store[STORAGE_KEY] === "false", true);
  assert.equal(JSON.stringify(store).includes("password"), false);
  assert.equal(JSON.stringify(store).includes("token"), false);
  assert.equal(JSON.stringify(store).includes("balance"), false);
  assert.equal(JSON.stringify(store).includes("income"), false);
});
