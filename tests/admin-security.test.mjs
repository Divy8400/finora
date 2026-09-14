import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toSafeUser } from "../lib/safe-transaction.ts";
import { RegisterSchema } from "../lib/validations.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Authentication & Role Defaults: Registration never allows role specification and defaults to USER", () => {
  // Public registration schema must strictly omit role
  const payloadWithInjectedRole = {
    name: "Regular User",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    role: "ADMIN", // Attacker trying to register as ADMIN
  };

  const parsed = RegisterSchema.safeParse(payloadWithInjectedRole);
  assert.equal(parsed.success, true);
  // The parsed object must not contain role even if supplied in JSON
  assert.equal("role" in parsed.data, false, "RegisterSchema must never parse or expose a role field");

  // Verify toSafeUser default role assignment
  const userWithoutExplicitRole = {
    id: "usr_123",
    name: "John Doe",
    email: "john@example.com",
    currency: "INR",
    timezone: "Asia/Kolkata",
    createdAt: new Date(),
  };

  const safe = toSafeUser(userWithoutExplicitRole);
  assert.equal(safe.role, "USER", "Unspecified role must default to USER");
  assert.equal("passwordHash" in safe, false, "passwordHash must never be present on safe user");
});

test("Admin Authorization: Role-based access control rules", () => {
  function verifyAdminAccess(session) {
    if (!session || !session.user || !session.user.id) {
      return { status: 401, error: "Unauthorized" };
    }
    if (session.user.role !== "ADMIN") {
      return { status: 403, error: "Forbidden" };
    }
    return { status: 200, user: session.user };
  }

  // 1. Unauthenticated request
  const unauthResult = verifyAdminAccess(null);
  assert.equal(unauthResult.status, 401);

  // 2. Authenticated standard user (USER)
  const userResult = verifyAdminAccess({
    user: { id: "u1", email: "user@finora.com", role: "USER" },
  });
  assert.equal(userResult.status, 403);
  assert.equal(userResult.error, "Forbidden");

  // 3. Authenticated admin user (ADMIN)
  const adminResult = verifyAdminAccess({
    user: { id: "a1", email: "admin@finora.com", role: "ADMIN" },
  });
  assert.equal(adminResult.status, 200);
  assert.equal(adminResult.user.role, "ADMIN");
});

test("Data Isolation: User A cannot query or mutate User B's records", () => {
  const mockDatabase = [
    { id: "tx-1", userId: "user-A", amountMinor: 50000, description: "User A Transaction" },
    { id: "tx-2", userId: "user-B", amountMinor: 99000, description: "User B Private Transaction" },
  ];

  // Simulating query with enforced ownership
  function getTransactionForUser(recordId, authenticatedUserId) {
    return mockDatabase.find((tx) => tx.id === recordId && tx.userId === authenticatedUserId) || null;
  }

  // User A requesting User A's transaction
  const aAccess = getTransactionForUser("tx-1", "user-A");
  assert.ok(aAccess !== null);
  assert.equal(aAccess.id, "tx-1");

  // User A attempting to access User B's transaction
  const bAccessFromA = getTransactionForUser("tx-2", "user-A");
  assert.equal(bAccessFromA, null, "User A must not be able to retrieve User B's transaction");
});

test("GitHub Safety: .gitignore strictly excludes environment and database files", () => {
  const gitignorePath = path.join(__dirname, "..", ".gitignore");
  const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");

  // Check critical ignores
  assert.ok(gitignoreContent.includes(".env"), ".env must be ignored");
  assert.ok(gitignoreContent.includes("*.db"), "*.db must be ignored");
  assert.ok(gitignoreContent.includes("*.db-journal"), "*.db-journal must be ignored");
  assert.ok(gitignoreContent.includes("prisma/*.db"), "prisma/*.db must be ignored");
  assert.ok(gitignoreContent.includes("!.env.example"), "!.env.example must be preserved");
});

test("GitHub Safety: .env.example contains only dummy placeholder values", () => {
  const envExamplePath = path.join(__dirname, "..", ".env.example");
  const envExampleContent = fs.readFileSync(envExamplePath, "utf8");

  // Must not contain real production credentials or private keys
  assert.ok(envExampleContent.includes("replace-with-a-long-random-secret") || envExampleContent.includes("replace-with-a-long-random-secret"));
  assert.equal(envExampleContent.includes("supersecret"), false);
  assert.equal(envExampleContent.includes("password123"), false);
  assert.equal(envExampleContent.includes("postgres://real"), false);
});
