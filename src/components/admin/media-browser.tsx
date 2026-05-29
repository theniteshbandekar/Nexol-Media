"use client";

import Image from "next/image";
import { useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { deleteImageAction, uploadImageAction } from "@/lib/actions/admin/media";
import type { MediaItem } from "@/lib/firebase/storage";

export function MediaBrowser({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("path", "images/library");
    fd.set("alt", "");
    start(async () => {
      const r = await uploadImageAction(fd);
      if (r.ok) router.refresh();
      else setError(r.error);
    });
  }

  function onDelete(path: string) {
    if (!window.confirm("Delete this image? It cannot be undone.")) return;
    setError(null);
    start(async () => {
      const r = await deleteImageAction(path);
      if (r.ok) router.refresh();
      else setError(r.error);
    });
  }

  return (
    <div className="adm-editor">
      <div className="adm-list-head">
        <h1>Media</h1>
        <label className="adm-btn adm-upload">
          {busy ? "Working…" : "Upload image"}
          <input type="file" accept="image/*" hidden onChange={onUpload} disabled={busy} />
        </label>
      </div>
      {error && <span className="adm-savebar-error">{error}</span>}
      <div
        className="adm-media-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
        }}
      >
        {items.map((m) => (
          <div key={m.path} className="adm-media-item">
            <div
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                background: "var(--gray-100, #eee)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {m.src && (
                <Image src={m.src} alt={m.path} fill sizes="160px" style={{ objectFit: "cover" }} />
              )}
            </div>
            <div className="adm-hint" style={{ wordBreak: "break-all", marginTop: 4 }}>
              {m.path}
            </div>
            <div className="adm-media-actions" style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {m.src && (
                <button
                  type="button"
                  className="adm-btn-ghost"
                  onClick={() => navigator.clipboard?.writeText(m.src!)}
                >
                  Copy URL
                </button>
              )}
              <button
                type="button"
                className="adm-btn-danger"
                onClick={() => onDelete(m.path)}
                disabled={busy}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="adm-hint">No images uploaded yet.</p>}
      </div>
    </div>
  );
}
