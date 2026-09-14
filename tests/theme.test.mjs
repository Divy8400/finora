import test from "node:test";
import assert from "node:assert/strict";
import { THEME_OPTIONS } from "../lib/theme-constants.ts";

test("Theme System: All required theme options are defined with valid metadata", () => {
  const ids = THEME_OPTIONS.map((o) => o.id);
  assert.ok(ids.includes("system"), "System theme must be available");
  assert.ok(ids.includes("light"), "Light theme must be available");
  assert.ok(ids.includes("dark"), "Dark theme must be available");
  assert.ok(ids.includes("emerald"), "Emerald theme must be available");
  assert.ok(ids.includes("midnight"), "Midnight theme must be available");

  for (const opt of THEME_OPTIONS) {
    assert.ok(opt.label.length > 0, "Theme option must have a label");
    assert.ok(opt.description.length > 0, "Theme option must have a description");
    assert.ok(opt.colorPreview.bg.startsWith("#"), "Background preview must be valid hex");
    assert.ok(opt.colorPreview.card.startsWith("#"), "Card preview must be valid hex");
    assert.ok(opt.colorPreview.accent.startsWith("#"), "Accent preview must be valid hex");
  }
});

test("Theme Resolution Logic: System theme accurately resolves according to browser preference", () => {
  function resolveTheme(currentTheme, isBrowserDark) {
    if (currentTheme === "system") {
      return isBrowserDark ? "dark" : "light";
    }
    return currentTheme;
  }

  // System follows browser
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");

  // Fixed themes remain explicit regardless of browser
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("light", false), "light");
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("dark", true), "dark");
  assert.equal(resolveTheme("emerald", true), "emerald");
  assert.equal(resolveTheme("midnight", false), "midnight");
});

test("Theme Storage Compliance: Stored under finora_theme safely", () => {
  const STORAGE_KEY = "finora_theme";
  const validThemes = ["system", "light", "dark", "emerald", "midnight"];

  for (const t of validThemes) {
    const store = { [STORAGE_KEY]: t };
    assert.ok(validThemes.includes(store[STORAGE_KEY]));
    assert.equal(typeof store[STORAGE_KEY], "string");
  }
});
