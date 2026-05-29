"use client";

import type {
  ProcessStep,
  ServicesIndex,
  TrustStat,
} from "@/lib/sanity/index-pages";
import { saveServicesIndex } from "@/lib/actions/admin/index-pages";

import { TextArea, TextField } from "../fields";
import { RepeaterField } from "../repeater-field";
import { SaveBar } from "../save-bar";
import { useEditorForm } from "../use-editor-form";

export function ServicesIndexEditor({ initial }: { initial: ServicesIndex }) {
  const { value, set, dirty, saving, status, save } = useEditorForm<ServicesIndex>(
    initial,
    saveServicesIndex,
  );

  return (
    <div className="adm-editor">
      <h1>Services page</h1>

      <section className="adm-section">
        <h2>Header</h2>
        <TextField label="Eyebrow" value={value.eyebrow} onChange={(v) => set("eyebrow", v)} />
        <TextField
          label="Title"
          hint="An accent dot is added after the title automatically."
          value={value.title}
          onChange={(v) => set("title", v)}
        />
        <TextArea label="Dek" value={value.dek} onChange={(v) => set("dek", v)} />
      </section>

      <section className="adm-section">
        <h2>Process</h2>
        <TextField label="Heading" value={value.processHeading} onChange={(v) => set("processHeading", v)} />
        <TextField label="Meta" value={value.processMeta} onChange={(v) => set("processMeta", v)} />
        <RepeaterField
          label="Steps"
          items={value.processSteps}
          onChange={(n) => set("processSteps", n)}
          emptyItem={(): ProcessStep => ({ num: "", week: "", title: "", description: "" })}
          addLabel="step"
          renderItem={(step, on) => (
            <>
              <div className="adm-row">
                <TextField label="Number" hint="e.g. (01)" value={step.num} onChange={(v) => on({ ...step, num: v })} />
                <TextField label="Week" hint="e.g. Week 01" value={step.week} onChange={(v) => on({ ...step, week: v })} />
              </div>
              <TextField label="Title" value={step.title} onChange={(v) => on({ ...step, title: v })} />
              <TextArea label="Description" value={step.description} onChange={(v) => on({ ...step, description: v })} />
            </>
          )}
        />
      </section>

      <section className="adm-section">
        <h2>Trust stats</h2>
        <RepeaterField
          label="Stats"
          items={value.trustStats}
          onChange={(n) => set("trustStats", n)}
          emptyItem={(): TrustStat => ({ num: "", label: "" })}
          addLabel="stat"
          renderItem={(stat, on) => (
            <div className="adm-row">
              <TextField label="Number" value={stat.num} onChange={(v) => on({ ...stat, num: v })} />
              <TextField label="Label" value={stat.label} onChange={(v) => on({ ...stat, label: v })} />
            </div>
          )}
        />
      </section>

      <section className="adm-section">
        <h2>Bottom CTA</h2>
        <TextField label="Heading" value={value.ctaHeading} onChange={(v) => set("ctaHeading", v)} />
        <TextArea label="Body" value={value.ctaBody} onChange={(v) => set("ctaBody", v)} />
      </section>

      <SaveBar dirty={dirty} saving={saving} status={status} onSave={save} viewHref="/services" />
    </div>
  );
}
