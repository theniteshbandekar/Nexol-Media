"use client";

import type {
  SiteSettings,
  NavItem,
  FooterLink,
  RouteKey,
} from "@/lib/sanity/site-settings";
import { saveSiteSettings } from "@/lib/actions/admin/site-settings";

import { useEditorForm } from "../use-editor-form";
import { TextField, TextArea, Toggle } from "../fields";
import { RepeaterField } from "../repeater-field";
import { SaveBar } from "../save-bar";

const ROUTE_TOGGLES: { key: RouteKey; label: string; hint: string }[] = [
  { key: "blog", label: "Blog", hint: "Show the Blog section in the nav, footer and sitemap." },
  { key: "caseStudies", label: "Case Studies", hint: "Show the Case Studies section in the nav, footer and sitemap." },
  { key: "services", label: "Services", hint: "Show the Services section." },
  { key: "about", label: "About", hint: "Show the About page link." },
  { key: "contact", label: "Contact", hint: "Show the Contact page link." },
];

function navItem(item: NavItem, on: (n: NavItem) => void) {
  return (
    <div className="adm-row">
      <TextField label="Label" value={item.label} onChange={(v) => on({ ...item, label: v })} />
      <TextField label="Link (href)" value={item.href} onChange={(v) => on({ ...item, href: v })} />
    </div>
  );
}

function footerLink(item: FooterLink, on: (n: FooterLink) => void) {
  return (
    <>
      <div className="adm-row">
        <TextField label="Label" value={item.label} onChange={(v) => on({ ...item, label: v })} />
        <TextField label="Link (href)" value={item.href} onChange={(v) => on({ ...item, href: v })} />
      </div>
      <Toggle
        label="External link"
        hint="Opens in a new tab — for off-site URLs."
        value={!!item.external}
        onChange={(v) => on({ ...item, external: v || undefined })}
      />
    </>
  );
}

export function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const { value, set, setValue, dirty, saving, status, save } = useEditorForm(
    initial,
    saveSiteSettings,
  );

  return (
    <div className="adm-editor">
      <h1>Site settings</h1>

      <section className="adm-section">
        <h2>Section visibility</h2>
        <p className="adm-section-note">
          Hide a section to remove it from the nav, footer and sitemap. Hidden
          pages show a placeholder.
        </p>
        {ROUTE_TOGGLES.map((t) => (
          <Toggle
            key={t.key}
            label={t.label}
            hint={t.hint}
            value={value.routeVisibility[t.key]}
            onChange={(v) =>
              setValue({
                ...value,
                routeVisibility: { ...value.routeVisibility, [t.key]: v },
              })
            }
          />
        ))}
      </section>

      <section className="adm-section">
        <h2>Header</h2>
        <RepeaterField
          label="Primary nav"
          items={value.primaryNav}
          onChange={(n) => set("primaryNav", n)}
          emptyItem={() => ({ label: "", href: "/" })}
          addLabel="nav link"
          renderItem={navItem}
        />
        <div className="adm-row">
          <TextField label="CTA label" value={value.headerCtaLabel} onChange={(v) => set("headerCtaLabel", v)} />
          <TextField label="CTA link" value={value.headerCtaHref} onChange={(v) => set("headerCtaHref", v)} />
        </div>
      </section>

      <section className="adm-section">
        <h2>Footer</h2>
        <TextArea label="Tagline" value={value.footerTagline} onChange={(v) => set("footerTagline", v)} />
        <RepeaterField
          label="Services links"
          items={value.footerServices}
          onChange={(n) => set("footerServices", n)}
          emptyItem={() => ({ label: "", href: "/" })}
          addLabel="link"
          renderItem={footerLink}
        />
        <RepeaterField
          label="Company links"
          items={value.footerCompany}
          onChange={(n) => set("footerCompany", n)}
          emptyItem={() => ({ label: "", href: "/" })}
          addLabel="link"
          renderItem={footerLink}
        />
        <RepeaterField
          label="Connect links"
          items={value.footerConnect}
          onChange={(n) => set("footerConnect", n)}
          emptyItem={() => ({ label: "", href: "/" })}
          addLabel="link"
          renderItem={footerLink}
        />
        <div className="adm-row">
          <TextField label="Location" value={value.footerLocation} onChange={(v) => set("footerLocation", v)} />
          <TextField label="Rights" value={value.footerRights} onChange={(v) => set("footerRights", v)} />
        </div>
      </section>

      <SaveBar dirty={dirty} saving={saving} status={status} onSave={save} viewHref="/" />
    </div>
  );
}
