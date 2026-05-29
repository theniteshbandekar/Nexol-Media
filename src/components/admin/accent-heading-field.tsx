"use client";

import type { AccentHeading } from "@/lib/case-studies";

import { TextField } from "./fields";

// Editor for the {before, accent?, after?} heading shape, with a live preview
// of the lime-accent span the public site renders.
export function AccentHeadingField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: AccentHeading;
  onChange: (v: AccentHeading) => void;
}) {
  return (
    <div className="adm-accent">
      <div className="adm-repeater-head">
        <span className="adm-label">{label}</span>
        {hint && <span className="adm-hint">{hint}</span>}
      </div>
      <p className="adm-accent-preview">
        {value.before}
        <span className="accent">{value.accent}</span>
        {value.after}
      </p>
      <div className="adm-row">
        <TextField
          label="Before"
          value={value.before}
          onChange={(v) => onChange({ ...value, before: v })}
        />
        <TextField
          label="Accent (lime)"
          value={value.accent ?? ""}
          onChange={(v) => onChange({ ...value, accent: v })}
        />
        <TextField
          label="After"
          value={value.after ?? ""}
          onChange={(v) => onChange({ ...value, after: v })}
        />
      </div>
    </div>
  );
}
