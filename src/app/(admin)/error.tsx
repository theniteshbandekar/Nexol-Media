"use client";

import { useEffect } from "react";

// Error boundary for the admin area. Keeps a broken admin page from showing the
// raw Next.js error screen; the message stays generic (no internal details leaked).
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error]", error);
  }, [error]);

  return (
    <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ marginBottom: 12 }}>Something went wrong</h1>
      <p style={{ color: "var(--fg-muted)", marginBottom: 24 }}>
        An unexpected error occurred in the admin. Try again, and if it persists,
        reload the page or sign in again.
      </p>
      <button className="admin-btn" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
