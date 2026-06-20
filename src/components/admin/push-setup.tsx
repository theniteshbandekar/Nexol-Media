"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { savePushSubscription } from "@/lib/actions/push-subscription";

type State = "idle" | "prompt" | "subscribed" | "denied" | "unsupported";
type PushCtxValue = { state: State; enable: () => Promise<void> };

const PushCtx = createContext<PushCtxValue | null>(null);

async function registerAndPersist(): Promise<void> {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return;
  const reg = await navigator.serviceWorker.register("/sw.js");
  const existing = await reg.pushManager.getSubscription();
  const sub = existing ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  const json = sub.toJSON();
  if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
    await savePushSubscription({ endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } });
  }
}

export function PushProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported"); return;
    }
    const p = Notification.permission;
    if (p === "denied") { setState("denied"); return; }
    if (p === "granted") {
      registerAndPersist().catch(console.error);
      setState("subscribed"); return;
    }
    setState("prompt");
  }, []);

  async function enable() {
    try {
      await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState("denied"); return; }
      await registerAndPersist();
      setState("subscribed");
    } catch (err) {
      console.error("[push-setup]", err);
    }
  }

  return <PushCtx.Provider value={{ state, enable }}>{children}</PushCtx.Provider>;
}

function usePush() {
  const ctx = useContext(PushCtx);
  if (!ctx) throw new Error("usePush must be inside PushProvider");
  return ctx;
}

/** Compact bell icon for the mobile top bar */
export function PushBell() {
  const { state, enable } = usePush();
  if (state === "idle" || state === "unsupported") return null;

  const label =
    state === "subscribed" ? "Notifications on" :
    state === "denied"     ? "Notifications blocked (change in browser settings)" :
                             "Tap to enable booking notifications";

  return (
    <button
      onClick={state === "prompt" ? enable : undefined}
      className={`push-bell push-bell--${state}`}
      title={label}
      aria-label={label}
    >
      {state === "denied" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20 18.69 7.84 6.14 5.27 3.49 4 4.76l2.8 2.8A6 6 0 0 0 6 11v5l-2 2v1h14.73l2 2L22 19.72 20 18.69zM18 18H8v-.01L18 8.55V11a5.94 5.94 0 0 1-.95 3.25L18 15v3zM12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z"/>
          {state === "prompt" && <circle cx="18" cy="6" r="4.5" fill="#D6F23A" stroke="#0A0A0B" strokeWidth="1.5"/>}
        </svg>
      )}
    </button>
  );
}

/** "Enable notifications" button shown in the sidebar */
export function PushSetup() {
  const { state, enable } = usePush();
  if (state !== "prompt") return null;

  return (
    <button
      onClick={enable}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        width: "100%", padding: "8px 12px", marginTop: 8,
        background: "var(--adm-accent, #D6F23A)", color: "#0A0A0B",
        border: "none", borderRadius: 6, fontSize: 12,
        fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em",
      }}
    >
      <span>🔔</span> Enable booking notifications
    </button>
  );
}
