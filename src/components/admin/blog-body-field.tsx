"use client";

import type { BlogBlock } from "@/lib/blog";

import { SelectField, TextArea, TextField, Toggle } from "./fields";
import { ImagePickerField } from "./image-picker-field";
import { RepeaterField } from "./repeater-field";

type Kind = BlogBlock["kind"];

const KIND_OPTIONS: ReadonlyArray<{ value: Kind; label: string }> = [
  { value: "p", label: "Paragraph" },
  { value: "h2", label: "Heading" },
  { value: "ol", label: "Numbered list" },
  { value: "ul", label: "Bulleted list" },
  { value: "quote", label: "Pull quote" },
  { value: "figure", label: "Figure / image" },
];

// Best-effort text carried across a type change so switching kind isn't lossy.
function textOf(block: BlogBlock): string {
  switch (block.kind) {
    case "p":
    case "h2":
    case "quote":
      return block.text;
    case "ol":
    case "ul":
      return block.items.join("\n");
    case "figure":
      return block.caption ?? block.placeholderLabel ?? "";
  }
}

function switchKind(block: BlogBlock, kind: Kind): BlogBlock {
  if (block.kind === kind) return block;
  const text = textOf(block);
  switch (kind) {
    case "p":
      return { kind: "p", text };
    case "h2":
      return { kind: "h2", num: "", text };
    case "ol":
      return { kind: "ol", items: text ? text.split("\n") : [] };
    case "ul":
      return { kind: "ul", items: text ? text.split("\n") : [] };
    case "quote":
      return { kind: "quote", text };
    case "figure":
      return { kind: "figure", placeholderLabel: text || undefined };
  }
}

function BlockBody({
  block,
  onChange,
  uploadPath,
}: {
  block: BlogBlock;
  onChange: (b: BlogBlock) => void;
  uploadPath: string;
}) {
  switch (block.kind) {
    case "p":
      return (
        <>
          <TextArea
            label="Text"
            value={block.text}
            onChange={(v) => onChange({ ...block, text: v })}
          />
          <Toggle
            label="Drop cap"
            hint="Enlarge the first letter — use on the opening paragraph only."
            value={block.dropCap ?? false}
            onChange={(v) => onChange({ ...block, dropCap: v || undefined })}
          />
        </>
      );
    case "h2":
      return (
        <TextField
          label="Heading"
          hint="Section heading. The (number) is added automatically on save."
          value={block.text}
          onChange={(v) => onChange({ ...block, text: v })}
        />
      );
    case "ol":
    case "ul":
      return (
        <TextArea
          label={block.kind === "ol" ? "List items (numbered)" : "List items (bulleted)"}
          hint="One item per line."
          rows={Math.max(3, block.items.length + 1)}
          value={block.items.join("\n")}
          onChange={(v) => onChange({ ...block, items: v.split("\n") })}
        />
      );
    case "quote":
      return (
        <>
          <TextArea
            label="Quote"
            value={block.text}
            onChange={(v) => onChange({ ...block, text: v })}
          />
          <TextField
            label="Attribution"
            hint="Optional — who said it."
            value={block.by ?? ""}
            onChange={(v) => onChange({ ...block, by: v || undefined })}
          />
        </>
      );
    case "figure":
      return (
        <>
          <ImagePickerField
            label="Image"
            hint="Optional — if set, it renders instead of the placeholder."
            value={block.src ? { src: block.src, alt: block.alt ?? "" } : undefined}
            onChange={(img) =>
              onChange({ ...block, src: img?.src, alt: img?.alt })
            }
            uploadPath={uploadPath}
          />
          <TextField
            label="Placeholder label"
            hint="Shown when there's no image, e.g. CHART · Subscriber growth."
            value={block.placeholderLabel ?? ""}
            onChange={(v) => onChange({ ...block, placeholderLabel: v || undefined })}
          />
          <TextField
            label="Caption"
            hint="Optional caption under the figure."
            value={block.caption ?? ""}
            onChange={(v) => onChange({ ...block, caption: v || undefined })}
          />
        </>
      );
  }
}

export function BlogBodyField({
  value,
  onChange,
  uploadPath,
}: {
  value: BlogBlock[];
  onChange: (v: BlogBlock[]) => void;
  uploadPath: string;
}) {
  return (
    <RepeaterField<BlogBlock>
      label="Body"
      hint="Build the post block by block. Reorder with the arrows."
      items={value}
      onChange={onChange}
      emptyItem={(): BlogBlock => ({ kind: "p", text: "" })}
      addLabel="block"
      renderItem={(block, on) => (
        <>
          <SelectField
            label="Block type"
            value={block.kind}
            options={KIND_OPTIONS}
            onChange={(k) => on(switchKind(block, k))}
          />
          <BlockBody block={block} onChange={on} uploadPath={uploadPath} />
        </>
      )}
    />
  );
}
