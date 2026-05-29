"use client";

import Image from "next/image";
import { useState, useTransition, type ChangeEvent } from "react";

import { uploadImageAction } from "@/lib/actions/admin/media";

export type StoredImage = { src: string; alt: string };

export function ImagePickerField({
  label,
  hint,
  value,
  onChange,
  uploadPath,
}: {
  label: string;
  hint?: string;
  value: StoredImage | undefined;
  onChange: (v: StoredImage | undefined) => void;
  uploadPath: string;
}) {
  const [busy, startUpload] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("path", uploadPath);
    fd.set("alt", value?.alt ?? "");
    startUpload(async () => {
      const result = await uploadImageAction(fd);
      if (result.ok) onChange({ src: result.src, alt: value?.alt ?? "" });
      else setError(result.error);
    });
  }

  return (
    <div className="adm-field">
      <span className="adm-label">{label}</span>
      {hint && <span className="adm-hint">{hint}</span>}
      <div className="adm-image-picker">
        {value?.src ? (
          <div className="adm-image-preview">
            <Image src={value.src} alt={value.alt} fill sizes="160px" style={{ objectFit: "cover" }} />
          </div>
        ) : (
          <div className="adm-image-empty">No image</div>
        )}
        <div className="adm-image-controls">
          <label className="adm-btn-ghost adm-upload">
            {busy ? "Uploading…" : value?.src ? "Replace" : "Upload"}
            <input type="file" accept="image/*" hidden onChange={onFile} disabled={busy} />
          </label>
          {value?.src && (
            <button type="button" className="adm-btn-danger" onClick={() => onChange(undefined)}>
              Remove
            </button>
          )}
        </div>
      </div>
      {value?.src && (
        <input
          className="adm-input"
          placeholder="Alt text — describe the image (required for SEO)"
          value={value.alt}
          onChange={(e) => onChange({ src: value.src, alt: e.target.value })}
        />
      )}
      {error && <span className="adm-savebar-error">{error}</span>}
    </div>
  );
}
