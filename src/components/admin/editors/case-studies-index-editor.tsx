"use client";

import type { CaseStudiesIndex } from "@/lib/sanity/index-pages";
import { saveCaseStudiesIndex } from "@/lib/actions/admin/index-pages";

import { AccentHeadingField } from "../accent-heading-field";
import { SaveBar } from "../save-bar";
import { useEditorForm } from "../use-editor-form";

export function CaseStudiesIndexEditor({
  initial,
}: {
  initial: CaseStudiesIndex;
}) {
  const { value, set, dirty, saving, status, save } =
    useEditorForm<CaseStudiesIndex>(initial, saveCaseStudiesIndex);

  return (
    <div className="adm-editor">
      <h1>Case studies page</h1>
      <section className="adm-section">
        <h2>Header</h2>
        <AccentHeadingField
          label="Heading"
          value={value.heading}
          onChange={(h) => set("heading", h)}
        />
      </section>
      <SaveBar
        dirty={dirty}
        saving={saving}
        status={status}
        onSave={save}
        viewHref="/case-studies"
      />
    </div>
  );
}
