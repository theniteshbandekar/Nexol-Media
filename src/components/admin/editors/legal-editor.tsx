"use client";

import type { LegalPage } from "@/lib/sanity/legal-pages";
import { saveLegalPage } from "@/lib/actions/admin/legal";

import { TextArea, TextField } from "../fields";
import { LegalBodyField } from "../legal-body-field";
import { SaveBar } from "../save-bar";
import { useEditorForm } from "../use-editor-form";

export function LegalEditor({ initial }: { initial: LegalPage }) {
  const { value, set, dirty, saving, status, save } = useEditorForm<LegalPage>(
    initial,
    saveLegalPage,
  );

  return (
    <div className="adm-editor">
      <h1>{value.kind === "privacy" ? "Privacy policy" : "Terms of service"}</h1>

      <section className="adm-section">
        <h2>Page</h2>
        <TextField label="Title" value={value.title} onChange={(v) => set("title", v)} />
        <TextArea
          label="Intro"
          hint="Short lead paragraph shown above the body."
          value={value.intro ?? ""}
          onChange={(v) => set("intro", v || undefined)}
        />
        <TextField
          label="Last updated"
          hint="Optional ISO date, e.g. 2026-02-14."
          value={value.lastUpdated ?? ""}
          onChange={(v) => set("lastUpdated", v || undefined)}
        />
      </section>

      <section className="adm-section">
        <h2>Body</h2>
        <LegalBodyField value={value.body} onChange={(b) => set("body", b)} />
      </section>

      <SaveBar
        dirty={dirty}
        saving={saving}
        status={status}
        onSave={save}
        viewHref={`/${value.kind}`}
      />
    </div>
  );
}
