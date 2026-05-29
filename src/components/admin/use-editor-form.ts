"use client";

import { useRef, useState, useTransition } from "react";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type SaveStatus =
  | { type: "idle" }
  | { type: "saved" }
  | { type: "error"; message: string };

/**
 * Shared editor form state: holds a working copy, tracks dirty vs the last
 * saved baseline, and saves the whole object through a server action.
 */
export function useEditorForm<T>(
  initial: T,
  action: (payload: T) => Promise<ActionResult>,
) {
  const [value, setValue] = useState<T>(initial);
  const baseline = useRef<string>(JSON.stringify(initial));
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>({ type: "idle" });

  const dirty = JSON.stringify(value) !== baseline.current;

  function save() {
    setStatus({ type: "idle" });
    startTransition(async () => {
      const result = await action(value);
      if (result.ok) {
        baseline.current = JSON.stringify(value);
        setStatus({ type: "saved" });
      } else {
        setStatus({ type: "error", message: result.error });
      }
    });
  }

  // Patch a single top-level field.
  function set<K extends keyof T>(key: K, v: T[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
    setStatus({ type: "idle" });
  }

  return { value, setValue, set, dirty, saving: isPending, status, save };
}
