"use client";

import type { BlogHero } from "@/lib/blog";

import { SelectField, TextField } from "./fields";
import { ImagePickerField } from "./image-picker-field";

export function BlogHeroField({
  value,
  onChange,
  uploadPath,
}: {
  value: BlogHero;
  onChange: (v: BlogHero) => void;
  uploadPath: string;
}) {
  return (
    <div className="adm-storyphoto">
      <SelectField
        label="Hero"
        value={value.kind}
        options={[
          { value: "image", label: "Uploaded image" },
          { value: "placeholder", label: "Placeholder tile" },
        ]}
        onChange={(k) =>
          onChange(
            k === "image"
              ? {
                  kind: "image",
                  src: value.kind === "image" ? value.src : "",
                  alt: value.kind === "image" ? value.alt : "",
                }
              : {
                  kind: "placeholder",
                  label: value.kind === "placeholder" ? value.label : "",
                },
          )
        }
      />
      {value.kind === "image" ? (
        <ImagePickerField
          label="Image"
          value={{ src: value.src, alt: value.alt }}
          onChange={(img) =>
            onChange({ kind: "image", src: img?.src ?? "", alt: img?.alt ?? "" })
          }
          uploadPath={uploadPath}
        />
      ) : (
        <TextField
          label="Placeholder label"
          hint="Shown when there's no image, e.g. GROWTH · Essay."
          value={value.label}
          onChange={(v) => onChange({ kind: "placeholder", label: v })}
        />
      )}
    </div>
  );
}
