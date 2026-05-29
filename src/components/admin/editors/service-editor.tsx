"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type {
  ServiceDeliverable,
  ServiceMetric,
  ServiceProcessStep,
  ServiceWorkSample,
  ServiceFaq,
} from "@/lib/services";
import type { AdminService } from "@/lib/firebase/admin-content";
import {
  saveService,
  createService,
  deleteService,
} from "@/lib/actions/admin/services";

import { TextField, TextArea, Toggle, SelectField } from "../fields";
import { RepeaterField } from "../repeater-field";
import { SaveBar } from "../save-bar";
import type { SaveStatus } from "../use-editor-form";

type Deliverable3 = [ServiceDeliverable, ServiceDeliverable, ServiceDeliverable];
type Metric3 = [ServiceMetric, ServiceMetric, ServiceMetric];

export function ServiceEditor({
  initial,
  mode,
  caseStudyOptions,
}: {
  initial: AdminService;
  mode: "create" | "edit";
  caseStudyOptions: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState<AdminService>(initial);
  const baseline = useRef(JSON.stringify(initial));
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [status, setStatus] = useState<SaveStatus>({ type: "idle" });

  const dirty = mode === "create" || JSON.stringify(value) !== baseline.current;

  function set<K extends keyof AdminService>(key: K, v: AdminService[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
    setStatus({ type: "idle" });
  }

  function onPrimary() {
    setStatus({ type: "idle" });
    startSave(async () => {
      const result = mode === "create" ? await createService(value) : await saveService(value);
      if (result.ok) {
        if (mode === "create") {
          router.push(`/admin/services/${value.slug}`);
          router.refresh();
        } else {
          baseline.current = JSON.stringify(value);
          setStatus({ type: "saved" });
        }
      } else {
        setStatus({ type: "error", message: result.error });
      }
    });
  }

  function onDelete() {
    if (!window.confirm("Delete this service? This cannot be undone.")) return;
    startDelete(async () => {
      const result = await deleteService(value.slug);
      if (result.ok) {
        router.push("/admin/services");
        router.refresh();
      } else {
        setStatus({ type: "error", message: result.error });
      }
    });
  }

  const setDeliverable = (i: number, d: ServiceDeliverable) =>
    set("deliverables", value.deliverables.map((x, j) => (j === i ? d : x)) as Deliverable3);
  const setMetric = (i: number, m: ServiceMetric) =>
    set("metrics", value.metrics.map((x, j) => (j === i ? m : x)) as Metric3);

  const csOptions = [{ value: "", label: "— none —" }, ...caseStudyOptions];

  return (
    <div className="adm-editor">
      <h1>{mode === "create" ? "New service" : value.title || value.slug}</h1>

      <section className="adm-section">
        <h2>Basics</h2>
        {mode === "create" ? (
          <TextField label="Slug" hint="URL path: /services/<slug>. Lowercase, dashes." value={value.slug} onChange={(v) => set("slug", v)} />
        ) : (
          <div className="adm-field">
            <span className="adm-label">Slug</span>
            <span className="adm-hint">/services/{value.slug}</span>
          </div>
        )}
        <div className="adm-row">
          <TextField label="Number" hint='e.g. "01"' value={value.num} onChange={(v) => set("num", v)} />
          <TextField label="Title" value={value.title} onChange={(v) => set("title", v)} />
        </div>
        <TextField label="Tagline" value={value.tagline} onChange={(v) => set("tagline", v)} />
        <TextArea label="Description" value={value.description} onChange={(v) => set("description", v)} />
        <RepeaterField
          label="Pills"
          hint="Short tags shown under the title."
          items={value.pills}
          onChange={(n) => set("pills", n)}
          emptyItem={() => ""}
          addLabel="pill"
          renderItem={(p, on) => <TextField label="Pill" value={p} onChange={on} />}
        />
      </section>

      <section className="adm-section">
        <h2>Deliverables</h2>
        <TextField label="Section meta" value={value.deliverablesMeta} onChange={(v) => set("deliverablesMeta", v)} />
        {value.deliverables.map((d, i) => (
          <div className="adm-repeater-item" key={i}>
            <div className="adm-repeater-item-head">
              <span className="adm-repeater-idx">Deliverable #{i + 1}</span>
            </div>
            <TextField label="Title" value={d.title} onChange={(v) => setDeliverable(i, { ...d, title: v })} />
            <TextArea label="Description" value={d.description} onChange={(v) => setDeliverable(i, { ...d, description: v })} />
            <RepeaterField
              label="Bullets"
              items={d.bullets}
              onChange={(n) => setDeliverable(i, { ...d, bullets: n })}
              emptyItem={() => ""}
              addLabel="bullet"
              renderItem={(b, on) => <TextField label="Bullet" value={b} onChange={on} />}
            />
          </div>
        ))}
      </section>

      <section className="adm-section">
        <h2>Recent work</h2>
        <div className="adm-row">
          <TextField label="Work heading" value={value.workHeading} onChange={(v) => set("workHeading", v)} />
          <TextField label="Work meta" value={value.workMeta} onChange={(v) => set("workMeta", v)} />
        </div>
        <RepeaterField
          label="Work samples"
          items={value.workSamples}
          onChange={(n) => set("workSamples", n)}
          emptyItem={(): ServiceWorkSample => ({ kind: "placeholder", label: "" })}
          addLabel="sample"
          renderItem={(w, on) => (
            <>
              <TextField label="Label" value={w.label} onChange={(v) => on({ ...w, label: v })} />
              <SelectField
                label="Links to case study"
                hint="Lights up the card as a link."
                value={w.caseStudySlug ?? ""}
                options={csOptions}
                onChange={(v) => on({ ...w, caseStudySlug: v || undefined })}
              />
            </>
          )}
        />
      </section>

      <section className="adm-section">
        <h2>Metrics</h2>
        <TextField label="Section meta" value={value.metricsMeta} onChange={(v) => set("metricsMeta", v)} />
        {value.metrics.map((m, i) => (
          <div className="adm-repeater-item" key={i}>
            <div className="adm-repeater-item-head">
              <span className="adm-repeater-idx">Metric #{i + 1}</span>
            </div>
            <div className="adm-row">
              <TextField label="Number" value={m.num} onChange={(v) => setMetric(i, { ...m, num: v })} />
              <TextField label="Label" value={m.label} onChange={(v) => setMetric(i, { ...m, label: v })} />
            </div>
            <TextField label="Context" hint="Optional sub-line." value={m.context ?? ""} onChange={(v) => setMetric(i, { ...m, context: v || undefined })} />
          </div>
        ))}
      </section>

      <section className="adm-section">
        <h2>Process</h2>
        <TextField label="Section meta" value={value.processMeta} onChange={(v) => set("processMeta", v)} />
        <RepeaterField
          label="Steps"
          items={value.process}
          onChange={(n) => set("process", n)}
          emptyItem={(): ServiceProcessStep => ({ num: "", week: "", title: "", description: "" })}
          addLabel="step"
          renderItem={(s, on) => (
            <>
              <div className="adm-row">
                <TextField label="Number" value={s.num} onChange={(v) => on({ ...s, num: v })} />
                <TextField label="Week" value={s.week} onChange={(v) => on({ ...s, week: v })} />
              </div>
              <TextField label="Title" value={s.title} onChange={(v) => on({ ...s, title: v })} />
              <TextArea label="Description" value={s.description} onChange={(v) => on({ ...s, description: v })} />
            </>
          )}
        />
      </section>

      <section className="adm-section">
        <h2>CTA &amp; FAQs</h2>
        <TextField label="CTA heading" value={value.ctaHeading} onChange={(v) => set("ctaHeading", v)} />
        <RepeaterField
          label="FAQs"
          items={value.faqs ?? []}
          onChange={(n) => set("faqs", n)}
          emptyItem={(): ServiceFaq => ({ q: "", a: "" })}
          addLabel="FAQ"
          renderItem={(f, on) => (
            <>
              <TextField label="Question" value={f.q} onChange={(v) => on({ ...f, q: v })} />
              <TextArea label="Answer" value={f.a} onChange={(v) => on({ ...f, a: v })} />
            </>
          )}
        />
      </section>

      <section className="adm-section">
        <h2>Publishing</h2>
        <Toggle label="Published" hint="Off = hidden from the public site." value={value.published} onChange={(v) => set("published", v)} />
      </section>

      <SaveBar
        dirty={dirty}
        saving={saving}
        status={status}
        onSave={onPrimary}
        saveLabel={mode === "create" ? "Create service" : "Save"}
        viewHref={mode === "edit" ? `/services/${value.slug}` : undefined}
        onDelete={mode === "edit" ? onDelete : undefined}
        deleting={deleting}
      />
    </div>
  );
}
