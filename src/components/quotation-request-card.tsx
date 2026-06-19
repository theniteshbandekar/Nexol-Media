"use client";

import { useState, useTransition } from "react";

function ArrowOut() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function QuotationRequestCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setStatus("idle");
    setErrorMessage("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/quotation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim() }),
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Something went wrong.");
        }
        
        setStatus("success");
      } catch (err: unknown) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Failed to send request.");
      }
    });
  };

  if (status === "success") {
    return (
      <aside className="ct-card booking" id="quotation" role="status">
        <div className="ct-card-head">
          <h2>Request a quotation.</h2>
          <span className="tag">
            <span className="dot" />
            Sent
          </span>
        </div>
        <div style={{ padding: "28px 32px 32px" }}>
          <h3
            style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "var(--fg)",
            }}
          >
            Check your inbox, {name}.
          </h3>
          <p
            style={{
              margin: "0 0 24px",
              color: "var(--gray-500)",
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            We&apos;ve sent a PDF containing the price quotations to {email}.
          </p>
          <button type="button" className="btn-ghost" onClick={() => {
            setStatus("idle");
            setName("");
            setEmail("");
          }}>
            Request another
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="ct-card booking" id="quotation" aria-labelledby="quotation-h">
      <div className="ct-card-head">
        <h2 id="quotation-h">Request a quotation.</h2>
        <span className="tag">
          <span className="dot" />
          PDF Sent
        </span>
      </div>

      <div className="top">
        <div className="who" style={{ gap: 4 }}>
          <span className="name">Get Pricing Details</span>
          <span className="role">Receive our service packages and pricing via email instantly.</span>
        </div>
      </div>

      <form className="ct-form" onSubmit={handleSubmit} style={{ padding: "24px 28px 28px" }}>
        {status === "error" && (
          <p role="alert" style={{ margin: 0, padding: "10px 14px", borderRadius: "var(--r-md)", background: "var(--gray-100)", border: "1px solid var(--border)", color: "var(--danger)", fontSize: 13 }}>
            {errorMessage}
          </p>
        )}

        <div className="field">
          <label htmlFor="quote-name">Your name</label>
          <input
            id="quote-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            placeholder="Riya Mehta"
            disabled={isPending}
            style={{ 
              height: 44, padding: "0 16px", borderRadius: "var(--r-pill)", 
              border: "1px solid var(--border)", background: "var(--white)", 
              color: "var(--fg)", fontSize: 15, outline: "none"
            }}
          />
        </div>
        
        <div className="field">
          <label htmlFor="quote-email">Email</label>
          <input
            id="quote-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={120}
            placeholder="you@channel.com"
            disabled={isPending}
            style={{ 
              height: 44, padding: "0 16px", borderRadius: "var(--r-pill)", 
              border: "1px solid var(--border)", background: "var(--white)", 
              color: "var(--fg)", fontSize: 15, outline: "none"
            }}
          />
        </div>

        <div className="foot" style={{ padding: 0, background: "transparent", borderTop: "none", marginTop: 8 }}>
          <button type="submit" className="btn-lg" disabled={isPending || !name || !email} style={{ width: "100%" }}>
            {isPending ? "Sending..." : "Send Quotation"}
            {!isPending && <ArrowOut />}
          </button>
        </div>
      </form>
    </aside>
  );
}
