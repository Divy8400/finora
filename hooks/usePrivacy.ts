"use client";

/**
 * usePrivacy – client-side hook for the Hide/Show amounts preference.
 *
 * Persists only a boolean flag (`true` | `false`) to localStorage under
 * the key `finora_hide_amounts`. No financial amounts, session data,
 * passwords, or tokens are ever written to browser storage.
 *
 * The hook is SSR-safe: localStorage is never accessed during server
 * rendering. We use a two-phase approach:
 *   1. Start with `false` (safe default for server/client hydration).
 *   2. After mount, read localStorage and correct the value if needed.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "finora_hide_amounts";

function readStored(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function usePrivacy() {
  const [hidden, setHidden] = useState(false);
  // Track whether we've hydrated so we only sync once
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = readStored();
    // Only trigger a re-render if the stored value differs from default
    if (stored) {
      setHidden(true);
    }
  }, []); // empty deps: runs once after mount

  const toggle = useCallback(() => {
    setHidden((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage unavailable — still toggle in-memory
      }
      return next;
    });
  }, []);

  return { hidden, toggle };
}
