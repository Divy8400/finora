"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { THEME_OPTIONS, type Theme, type ThemeOption } from "@/lib/theme-constants";

export { THEME_OPTIONS, type Theme, type ThemeOption };

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark" | "emerald" | "midnight";
  isBrowserDark: boolean;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const STORAGE_KEY = "finora_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [isBrowserDark, setIsBrowserDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Compute resolved theme based on current theme setting and browser preference
  const resolveTheme = useCallback(
    (currentTheme: Theme, browserDark: boolean): "light" | "dark" | "emerald" | "midnight" => {
      if (currentTheme === "system") {
        return browserDark ? "dark" : "light";
      }
      return currentTheme;
    },
    []
  );

  // Apply attributes to documentElement
  const applyThemeToDOM = useCallback(
    (resolved: "light" | "dark" | "emerald" | "midnight") => {
      if (typeof document === "undefined") return;
      const root = document.documentElement;
      root.setAttribute("data-theme", resolved);
      if (resolved !== "light") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    },
    []
  );

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    try {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const browserDark = media.matches;
      setIsBrowserDark(browserDark);

      const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initialTheme: Theme =
        saved && ["system", "light", "dark", "emerald", "midnight"].includes(saved)
          ? saved
          : "system";

      setThemeState(initialTheme);
      const resolved = resolveTheme(initialTheme, browserDark);
      applyThemeToDOM(resolved);

      // Listen to browser color scheme changes dynamically
      const listener = (e: MediaQueryListEvent) => {
        setIsBrowserDark(e.matches);
        const currentSaved = (window.localStorage.getItem(STORAGE_KEY) as Theme) || "system";
        if (currentSaved === "system") {
          applyThemeToDOM(e.matches ? "dark" : "light");
        }
      };

      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } catch {
      // Ignore when running outside standard browser
    }
  }, [resolveTheme, applyThemeToDOM]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        window.localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {}
      const resolved = resolveTheme(newTheme, isBrowserDark);
      applyThemeToDOM(resolved);
    },
    [isBrowserDark, resolveTheme, applyThemeToDOM]
  );

  const cycleTheme = useCallback(() => {
    const sequence: Theme[] = ["system", "light", "dark", "emerald", "midnight"];
    const currentIndex = sequence.indexOf(theme);
    const nextTheme = sequence[(currentIndex + 1) % sequence.length];
    setTheme(nextTheme);
  }, [theme, setTheme]);

  const resolvedTheme = mounted ? resolveTheme(theme, isBrowserDark) : "light";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        isBrowserDark,
        setTheme,
        cycleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
