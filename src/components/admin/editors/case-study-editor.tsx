"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AccentHeading, CaseStudyStat, CaseStudyRow } from "@/lib/case-studies";
import type { AdminCaseStudy } from "@/lib/firebase/admin-content";
import {
  saveCaseStudy,
  createCaseStudy,
  deleteCaseStudy,
} from "@/lib/actions/admin/case-studies";

import { TextField, TextArea, Toggle, SelectField } from "../fields";
import { AccentHeadingField } from "../accent-heading-field";
import { RepeaterField } from "../repeater-field";
import { ImagePickerField } from "../image-picker-field";
import { StoryPhotoField } from "../story-photo-field";
import { SaveBar } from "../save-bar";
import type { SaveStatus } from "../use-editor-form";

const EMPTY_HEADING: AccentHeading = { before: "", accent: "", after: "" };

export function CaseStudyEditor({
  initial,
  mode,
}: {
  initial: AdminCaseStudy;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [value, setValue] = useState<AdminCaseStudy>(initial);
  const baseline = useRef(JSON.stringify(initial));
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [status, setStatus] = useState<SaveStatus>({ type: "idle" });

  const dirty = mode === "create" || JSON.stringify(value) !== baseline.current;
  const uploadBase = `images/caseStudies/${value.slug || "untitled"}`;

  function set<K extends keyof AdminCaseStudy>(key: K, v: AdminCaseStudy[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
    setStatus({ type: "idle" });
  }

  function onPrimary() {
    setStatus({ type: "idle" });
    startSave(async () => {
      const result =
        mode === "create" ? await createCaseStudy(value) : await saveCaseStudy(value);
      if (result.ok) {
        if (mode === "create") {
          router.push(`/admin/case-studies/${value.slug}`);
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
    if (!window.confirm("Delete this case study? This cannot be undone.")) return;
    startDelete(async () => {
      const result = await deleteCaseStudy(value.slug);
      if (result.ok) {
        router.push("/admin/case-studies");
        router.refresh();
      } else {
        setStatus({ type: "error", message: result.error });
      }
    });
  }

  return (
    <div className="adm-editor">
      <h1>{mode === "create" ? "New case study" : value.name || value.slug}</h1>

      <section className="adm-section">
        <h2>Basics</h2>
        {mode === "create" ? (
          <TextField label="Slug" hint="URL path: /case-studies/<slug>. Lowercase, dashes." value={value.slug} onChange={(v) => set("slug", v)} />
        ) : (
          <div className="adm-field">
            <span className="adm-label">Slug</span>
            <span className="adm-hint">/case-studies/{value.slug}</span>
          </div>
        )}
        <div className="adm-row">
          <TextField label="Name" value={value.name} onChange={(v) => set("name", v)} />
          <TextField label="Role" hint="e.g. Design creator" value={value.role} onChange={(v) => set("role", v)} />
        </div>
        <TextArea label="Description" value={value.description ?? ""} onChange={(v) => set("description", v || undefined)} />
        <ImagePickerField
          label="Card image"
          hint="Shown on the case studies grid."
          value={value.cardImage}
          onChange={(img) => set("cardImage", img)}
          uploadPath={`${uploadBase}/card`}
        />
      </section>

      <section className="adm-section">
        <h2>Story heading</h2>
        <AccentHeadingField
          label="Title"
          value={value.title ?? EMPTY_HEADING}
          onChange={(h) => set("title", h.before || h.accent || h.after ? h : undefined)}
        />
        <RepeaterField
          label="Stats"
          items={value.stats ?? []}
          onChange={(n) => set("stats", n)}
          emptyItem={(): CaseStudyStat => ({ num: "", label: "" })}
          addLabel="stat"
          max={4}
          renderItem={(s, on) => (
            <div className="adm-row">
              <TextField label="Number" value={s.num} onChange={(v) => on({ ...s, num: v })} />
              <TextField label="Label" value={s.label} onChange={(v) => on({ ...s, label: v })} />
            </div>
          )}
        />
      </section>

      <section className="adm-section">
        <h2>Story rows</h2>
        <RepeaterField
          label="Rows"
          items={value.rows ?? []}
          onChange={(n) => set("rows", n)}
          emptyItem={(): CaseStudyRow => ({
            num: "",
            heading: { before: "", accent: "", after: "" },
            body: { text: "" },
            photo: { kind: "placeholder", label: "" },
            layout: "photo-left",
          })}
          addLabel="row"
          renderItem={(row, on) => (
            <>
              <div className="adm-row">
                <TextField label="Number" value={row.num} onChange={(v) => on({ ...row, num: v })} />
                <SelectField
                  label="Layout"
                  value={row.layout}
                  options={[
                    { value: "photo-left", label: "Photo left" },
                    { value: "photo-right", label: "Photo right" },
                  ]}
                  onChange={(v) => on({ ...row, layout: v })}
                />
              </div>
              <AccentHeadingField label="Heading" value={row.heading} onChange={(h) => on({ ...row, heading: h })} />
              <TextArea label="Body" value={row.body.text} onChange={(v) => on({ ...row, body: { ...row.body, text: v } })} />
              <TextField label="Bold lead-in" hint="Optional bold phrase before the body." value={row.body.bold ?? ""} onChange={(v) => on({ ...row, body: { ...row.body, bold: v || undefined } })} />
              <StoryPhotoField value={row.photo} onChange={(p) => on({ ...row, photo: p })} uploadPath={`${uploadBase}/rows`} />
            </>
          )}
        />
      </section>

      <section className="adm-section">
        <h2>Publishing</h2>
        <TextField label="CTA hook" hint="Optional closing line." value={value.ctaHook ?? ""} onChange={(v) => set("ctaHook", v || undefined)} />
        <TextField label="Published date" hint="ISO date, e.g. 2026-02-14. Used for sorting." value={value.publishedAt ?? ""} onChange={(v) => set("publishedAt", v || undefined)} />
        <Toggle label="Coming soon" hint="Shows a teaser card instead of the full study." value={value.comingSoon} onChange={(v) => set("comingSoon", v)} />
        <Toggle label="Published" hint="Off = hidden from the public site." value={value.published} onChange={(v) => set("published", v)} />
      </section>

      <SaveBar
        dirty={dirty}
        saving={saving}
        status={status}
        onSave={onPrimary}
        saveLabel={mode === "create" ? "Create case study" : "Save"}
        viewHref={mode === "edit" ? `/case-studies/${value.slug}` : undefined}
        onDelete={mode === "edit" ? onDelete : undefined}
        deleting={deleting}
      />
    </div>
  );
}
