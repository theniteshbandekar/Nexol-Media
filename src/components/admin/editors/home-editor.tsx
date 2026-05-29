"use client";

import type {
  HomePage,
  HomeStat,
  HomeTestimonialCard,
  HomeSecondaryLink,
} from "@/lib/sanity/home-page";
import { saveHomePage } from "@/lib/actions/admin/home-page";

import { useEditorForm } from "../use-editor-form";
import { AccentHeadingField } from "../accent-heading-field";
import { TextField, TextArea, NumberField, Toggle, SelectField } from "../fields";
import { RepeaterField } from "../repeater-field";
import { SaveBar } from "../save-bar";

const SPAN_OPTS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
] as const;

function statItem(s: HomeStat, on: (n: HomeStat) => void) {
  return (
    <>
      <div className="adm-row">
        <NumberField label="Target number" value={s.target} onChange={(v) => on({ ...s, target: v })} />
        <TextField label="Suffix" hint="e.g. M, k, +" value={s.suffix ?? ""} onChange={(v) => on({ ...s, suffix: v || undefined })} />
      </div>
      <TextField label="Label" value={s.label} onChange={(v) => on({ ...s, label: v })} />
      <Toggle label="Comma-format" hint="Show thousands separators (e.g. 8,400)." value={!!s.comma} onChange={(v) => on({ ...s, comma: v || undefined })} />
    </>
  );
}

function testimonialItem(t: HomeTestimonialCard, on: (n: HomeTestimonialCard) => void) {
  return (
    <>
      <div className="adm-row">
        <SelectField
          label="Type"
          value={t.type}
          options={[
            { value: "text", label: "Text quote" },
            { value: "video", label: "Video" },
          ]}
          onChange={(v) =>
            on(
              v === "text"
                ? {
                    type: "text",
                    span: t.span,
                    quote: t.type === "text" ? t.quote : "",
                    name: t.name,
                    role: t.role,
                  }
                : {
                    type: "video",
                    span: t.span,
                    platform: t.type === "video" ? t.platform : "instagram",
                    badgeLabel: t.type === "video" ? t.badgeLabel : "Reel",
                    name: t.name,
                    role: t.role,
                    href: t.type === "video" ? t.href : undefined,
                  },
            )
          }
        />
        <SelectField
          label="Width (span)"
          value={String(t.span)}
          options={SPAN_OPTS}
          onChange={(v) => on({ ...t, span: Number(v) as 1 | 2 | 3 | 4 })}
        />
      </div>
      <div className="adm-row">
        <TextField label="Name" value={t.name} onChange={(v) => on({ ...t, name: v })} />
        <TextField label="Role" value={t.role} onChange={(v) => on({ ...t, role: v })} />
      </div>
      {t.type === "text" ? (
        <>
          <TextArea label="Quote" value={t.quote} onChange={(v) => on({ ...t, quote: v })} />
          <Toggle label="Featured" hint="Larger emphasis card." value={!!t.featured} onChange={(v) => on({ ...t, featured: v || undefined })} />
        </>
      ) : (
        <>
          <div className="adm-row">
            <SelectField
              label="Platform"
              value={t.platform}
              options={[
                { value: "instagram", label: "Instagram" },
                { value: "youtube", label: "YouTube" },
              ]}
              onChange={(v) => on({ ...t, platform: v })}
            />
            <TextField label="Badge label" value={t.badgeLabel} onChange={(v) => on({ ...t, badgeLabel: v })} />
          </div>
          <TextField label="Link (href)" hint="Optional." value={t.href ?? ""} onChange={(v) => on({ ...t, href: v || undefined })} />
        </>
      )}
    </>
  );
}

function linkItem(l: HomeSecondaryLink, on: (n: HomeSecondaryLink) => void) {
  return (
    <div className="adm-row">
      <TextField label="Label" value={l.label} onChange={(v) => on({ ...l, label: v })} />
      <TextField label="Link (href)" value={l.href} onChange={(v) => on({ ...l, href: v })} />
    </div>
  );
}

export function HomeEditor({ initial }: { initial: HomePage }) {
  const { value, set, dirty, saving, status, save } = useEditorForm(
    initial,
    saveHomePage,
  );

  return (
    <div className="adm-editor">
      <h1>Home page</h1>

      <section className="adm-section">
        <h2>Hero</h2>
        <AccentHeadingField label="Headline (H1)" value={value.hero.h1} onChange={(v) => set("hero", { ...value.hero, h1: v })} />
        <TextField label="Tagline" value={value.hero.tagline ?? ""} onChange={(v) => set("hero", { ...value.hero, tagline: v || undefined })} />
        <TextField label="Scroll cue" value={value.hero.scrollCue ?? ""} onChange={(v) => set("hero", { ...value.hero, scrollCue: v || undefined })} />
      </section>

      <section className="adm-section">
        <h2>Video (VSL)</h2>
        <TextField label="Title" value={value.vsl.title ?? ""} onChange={(v) => set("vsl", { ...value.vsl, title: v || undefined })} />
        <div className="adm-row">
          <TextField label="Duration" hint="e.g. 02:14" value={value.vsl.duration ?? ""} onChange={(v) => set("vsl", { ...value.vsl, duration: v || undefined })} />
          <TextField label="Video URL" value={value.vsl.videoUrl ?? ""} onChange={(v) => set("vsl", { ...value.vsl, videoUrl: v || undefined })} />
        </div>
      </section>

      <section className="adm-section">
        <h2>Stats</h2>
        <RepeaterField
          label="Stat blocks"
          items={value.stats}
          onChange={(n) => set("stats", n)}
          emptyItem={(): HomeStat => ({ target: 0, label: "" })}
          addLabel="stat"
          renderItem={statItem}
        />
      </section>

      <section className="adm-section">
        <h2>Testimonials</h2>
        <RepeaterField
          label="Cards"
          items={value.testimonials}
          onChange={(n) => set("testimonials", n)}
          emptyItem={(): HomeTestimonialCard => ({ type: "text", span: 1, quote: "", name: "", role: "" })}
          addLabel="testimonial"
          renderItem={testimonialItem}
        />
      </section>

      <section className="adm-section">
        <h2>Hook</h2>
        <AccentHeadingField label="Heading (H2)" value={value.hook.h2} onChange={(v) => set("hook", { ...value.hook, h2: v })} />
        <RepeaterField
          label="Secondary links"
          items={value.hook.secondaryLinks}
          onChange={(n) => set("hook", { ...value.hook, secondaryLinks: n })}
          emptyItem={(): HomeSecondaryLink => ({ label: "", href: "/" })}
          addLabel="link"
          max={4}
          renderItem={linkItem}
        />
      </section>

      <SaveBar dirty={dirty} saving={saving} status={status} onSave={save} viewHref="/" />
    </div>
  );
}
