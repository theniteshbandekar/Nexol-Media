"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";

import { getClientAuth } from "@/lib/firebase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // TEMP DEBUG: reveal exactly what the browser submits (no plaintext pw).
      console.log(
        "[login-debug]",
        JSON.stringify({ email: email.trim(), pwLen: password.trim().length }),
      );
      const cred = await signInWithEmailAndPassword(
        getClientAuth(),
        email.trim(),
        password.trim(),
      );
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/admin/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("session");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      const credentialErrors = [
        "auth/invalid-credential",
        "auth/wrong-password",
        "auth/user-not-found",
        "auth/invalid-email",
      ];
      if (credentialErrors.includes(code)) {
        setError("Invalid email or password.");
      } else if (code) {
        // Surface the real Firebase code (config / throttle / network), so a
        // misconfigured key isn't silently reported as a bad password.
        setError(`Sign-in failed: ${code}`);
      } else {
        setError("Sign-in failed. Please try again.");
      }
      console.error("admin sign-in failed", err);
      setBusy(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={onSubmit}>
        <h1>Nexol Admin</h1>
        <p className="sub">Sign in to manage the site.</p>
        {error && <p className="admin-error">{error}</p>}
        <div className="admin-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="off"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="password">Password</label>
          <div className="admin-pw">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="off"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="admin-pw-toggle"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button className="admin-btn" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
