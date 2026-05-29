"use client";

import type { StoryPhoto } from "@/lib/case-studies";

import { SelectField, TextField } from "./fields";
import { ImagePickerField } from "./image-picker-field";

export function StoryPhotoField({
  value,
  onChange,
  uploadPath,
}: {
  value: StoryPhoto;
  onChange: (v: StoryPhoto) => void;
  uploadPath: string;
}) {
  return (
    <div className="adm-storyphoto">
      <SelectField
        label="Photo"
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
          hint="e.g. PHOTO · Adrien in studio · landscape"
          value={value.label}
          onChange={(v) => onChange({ kind: "placeholder", label: v })}
        />
      )}
    </div>
  );
}
