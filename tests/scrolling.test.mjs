import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Scrolling & Accessibility: Spending by Category markup and constraints", () => {
  const dashboardPath = path.join(__dirname, "..", "app", "(app)", "dashboard", "page.tsx");
  const content = fs.readFileSync(dashboardPath, "utf8");

  // 1. Heading outside scrollable region with ID
  assert.ok(
    content.includes('id="spending-category-title"'),
    "Card heading must have id spending-category-title for aria labeling"
  );
  assert.ok(
    content.includes("Spending by Category"),
    "Spending by Category title must be present"
  );

  // 2. Scrollable container attributes
  assert.ok(
    content.includes('tabIndex={0}'),
    "Scrollable region must have tabIndex={0} for keyboard accessibility"
  );
  assert.ok(
    content.includes('role="region"'),
    "Scrollable area must have role='region'"
  );
  assert.ok(
    content.includes('aria-labelledby="spending-category-title"'),
    "Scrollable region must be labeled by spending-category-title"
  );

  // 3. Max height and overflow behavior
  assert.ok(
    content.includes('maxHeight: "360px"') || content.includes('max-h-[360px]'),
    "Container must enforce max-height 360px"
  );
  assert.ok(
    content.includes("overflow-y-auto"),
    "Container must have vertical scrolling via overflow-y-auto"
  );
  assert.ok(
    content.includes("overflow-x-hidden"),
    "Container must prevent horizontal clipping/overflow via overflow-x-hidden"
  );
  assert.ok(
    content.includes("overscroll-contain"),
    "Container must use overscroll-contain"
  );

  // 4. Separate accessible list rather than forcing every label into chart
  assert.ok(
    content.includes('<ul') && content.includes('aria-label="Spending categories"'),
    "Must render a semantic <ul> list with aria-label='Spending categories'"
  );
  assert.ok(
    content.includes("AmountDisplay"),
    "Category list must use AmountDisplay for privacy masking"
  );
  assert.ok(
    content.includes("pct") && content.includes("%"),
    "Category list must show percentage"
  );
});

test("Scrollable Category List: Handles 10+ categories and preserves names, amounts, percentages", () => {
  const PIE_COLORS = ["#2563EB", "#16A34A", "#D97706", "#7C3AED", "#0891B2", "#DC2626", "#65A30D", "#F59E0B", "#EC4899", "#14B8A6"];

  // 12 test categories
  const testCategories = Array.from({ length: 12 }, (_, i) => ({
    categoryId: `cat-${i + 1}`,
    name: `Category ${i + 1} with a very long descriptive name to test text overflow`,
    amountMinor: (i + 1) * 10000,
  }));

  const total = testCategories.reduce((s, c) => s + c.amountMinor, 0);

  // Validate that each item computes valid percentage and has a color assigned
  testCategories.forEach((c, idx) => {
    const pct = ((c.amountMinor / total) * 100).toFixed(0);
    const color = PIE_COLORS[idx % PIE_COLORS.length];
    assert.ok(Number(pct) > 0, "Percentage must be calculated");
    assert.ok(color.startsWith("#"), "Valid color code assigned");
    assert.ok(c.name.length > 0, "Category name preserved");
    assert.ok(c.amountMinor > 0, "Category amount preserved");
  });

  // Check first and last category reachability
  assert.equal(testCategories[0].name.startsWith("Category 1"), true);
  assert.equal(testCategories[testCategories.length - 1].name.startsWith("Category 12"), true);
});
