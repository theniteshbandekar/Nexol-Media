"use client";

import Link from "next/link";

import type { SaveStatus } from "./use-editor-form";

export function SaveBar({
  dirty,
  saving,
  status,
  onSave,
  saveLabel = "Save",
  viewHref,
  onDelete,
  deleting,
}: {
  dirty: boolean;
  saving: boolean;
  status: SaveStatus;
  onSave: () => void;
  saveLabel?: string;
  viewHref?: string;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  return (
    <div className="adm-savebar">
      <div className="adm-savebar-status">
        {status.type === "error" && (
          <span className="adm-savebar-error" role="alert">
            {status.message}
          </span>
        )}
        {status.type === "saved" && !dirty && (
          <span className="adm-savebar-saved">Saved ✓</span>
        )}
        {dirty && status.type !== "error" && (
          <span className="adm-savebar-dirty">Unsaved changes</span>
        )}
      </div>
      <div className="adm-savebar-actions">
        {viewHref && (
          <Link className="adm-btn-ghost" href={viewHref} target="_blank">
            View on site ↗
          </Link>
        )}
        {onDelete && (
          <button
            type="button"
            className="adm-btn-danger"
            onClick={onDelete}
            disabled={deleting || saving}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
        <button
          type="button"
          className="adm-btn"
          onClick={onSave}
          disabled={!dirty || saving}
        >
          {saving ? "Saving…" : saveLabel}
        </button>
      </div>
    </div>
  );
}
