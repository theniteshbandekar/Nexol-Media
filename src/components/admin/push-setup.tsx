"use client";

import { useEffect, useState } from "react";
import { savePushSubscription } from "@/lib/actions/push-subscription";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type State = "idle" | "prompt" | "subscribed" | "denied" | "unsupported";

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
      // Re-register SW silently in case it was cleared.
      navigator.serviceWorker.register("/sw.js").then(async (reg) => {
        const existing = await reg.pushManager.getSubscription();
        if (!existing) {
          const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (key) {
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(key),
            });
            const json = sub.toJSON();
            if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
              await savePushSubscription({
                endpoint: json.endpoint,
                keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
              });
            }
          }
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
      if (permission !== "granted") {
        setState("denied");
        return;
      }
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
      const json = sub.toJSON();
      if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
        await savePushSubscription({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        });
      }
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
