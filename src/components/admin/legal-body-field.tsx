"use client";

import type { LegalBlock } from "@/lib/sanity/legal-pages";

import { SelectField, TextArea } from "./fields";
import { RepeaterField } from "./repeater-field";

type Kind = "h2" | "h3" | "paragraph" | "bullet";

function kindOf(b: LegalBlock): Kind {
  if (b.listItem === "bullet") return "bullet";
  if (b.style === "h2") return "h2";
  if (b.style === "h3") return "h3";
  return "paragraph";
}

function textOf(b: LegalBlock): string {
  return b.children?.[0]?.text ?? "";
}

function build(kind: Kind, text: string): LegalBlock {
  const children = [{ _type: "span", text, marks: [] as string[] }];
  if (kind === "bullet") {
    return { _type: "block", style: "normal", listItem: "bullet", level: 1, children, markDefs: [] };
  }
  if (kind === "h2") return { _type: "block", style: "h2", children, markDefs: [] };
  if (kind === "h3") return { _type: "block", style: "h3", children, markDefs: [] };
  return { _type: "block", style: "normal", children, markDefs: [] };
}

export function LegalBodyField({
  value,
  onChange,
}: {
  value: LegalBlock[];
  onChange: (v: LegalBlock[]) => void;
}) {
  return (
    <RepeaterField<LegalBlock>
      label="Body"
      hint="Build the page block by block. Reorder with the arrows."
      items={value}
      onChange={onChange}
      emptyItem={() => build("paragraph", "")}
      addLabel="block"
      renderItem={(block, on) => {
        const kind = kindOf(block);
        return (
          <>
            <SelectField
              label="Block type"
              value={kind}
              options={[
                { value: "h2", label: "Heading 2" },
                { value: "h3", label: "Heading 3" },
                { value: "paragraph", label: "Paragraph" },
                { value: "bullet", label: "Bullet point" },
              ]}
              onChange={(k) => on(build(k, textOf(block)))}
            />
            <TextArea
              label="Text"
              value={textOf(block)}
              onChange={(t) => on(build(kind, t))}
            />
          </>
        );
      }}
    />
  );
}
