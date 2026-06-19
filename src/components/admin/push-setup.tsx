"use client";

import { useEffect, useState } from "react";
import { savePushSubscription } from "@/lib/actions/push-subscription";

type State = "idle" | "prompt" | "subscribed" | "denied" | "unsupported";

async function subscribe(reg: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return null;
  // Browsers accept the base64url VAPID public key as a plain string.
  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
}

async function persistSub(sub: PushSubscription): Promise<void> {
  const json = sub.toJSON();
  if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
    await savePushSubscription({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    });
  }
}

export function PushSetup() {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "granted") {
      navigator.serviceWorker.register("/sw.js").then(async (reg) => {
        const existing = await reg.pushManager.getSubscription();
        if (!existing) {
          const sub = await subscribe(reg);
          if (sub) await persistSub(sub);
        }
      });
      setState("subscribed");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    setState("prompt");
  }, []);

  async function enable() {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState("denied"); return; }
      const sub = await subscribe(reg);
      if (sub) await persistSub(sub);
      setState("subscribed");
    } catch (err) {
      console.error("[push-setup]", err);
    }
  }

  if (state !== "prompt") return null;

  return (
    <button
      onClick={enable}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: "100%",
        padding: "8px 12px",
        marginTop: 8,
        background: "var(--adm-accent, #D6F23A)",
        color: "#0A0A0B",
        border: "none",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: "0.02em",
      }}
    >
      <span>🔔</span> Enable booking notifications
    </button>
  );
}
