"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminAuthor } from "@/lib/firebase/admin-content";
import {
  createAuthor,
  deleteAuthor,
  saveAuthor,
} from "@/lib/actions/admin/authors";

import { TextField } from "../fields";
import { SaveBar } from "../save-bar";
import type { SaveStatus } from "../use-editor-form";

export function AuthorEditor({
  initial,
  mode,
}: {
  initial: AdminAuthor;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [value, setValue] = useState<AdminAuthor>(initial);
  const baseline = useRef(JSON.stringify(initial));
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [status, setStatus] = useState<SaveStatus>({ type: "idle" });

  const dirty = mode === "create" || JSON.stringify(value) !== baseline.current;

  function set<K extends keyof AdminAuthor>(key: K, v: AdminAuthor[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
    setStatus({ type: "idle" });
  }

  function onPrimary() {
    setStatus({ type: "idle" });
    startSave(async () => {
      const result =
        mode === "create" ? await createAuthor(value) : await saveAuthor(value);
      if (result.ok) {
        if (mode === "create") {
          router.push("/admin/authors");
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
    if (!window.confirm("Delete this author? Posts keep their saved snapshot."))
      return;
    startDelete(async () => {
      const result = await deleteAuthor(value.id);
      if (result.ok) {
        router.push("/admin/authors");
        router.refresh();
      } else {
        setStatus({ type: "error", message: result.error });
      }
    });
  }

  return (
    <div className="adm-editor">
      <h1>{mode === "create" ? "New author" : value.name || "Author"}</h1>

      <section className="adm-section">
        <h2>Details</h2>
        <TextField label="Name" value={value.name} onChange={(v) => set("name", v)} />
        <TextField
          label="Role"
          hint="e.g. Founder, Editor, Strategist."
          value={value.role}
          onChange={(v) => set("role", v)}
        />
        <TextField
          label="Initials"
          hint="Shown on the post byline avatar, e.g. NB."
          value={value.initials}
          onChange={(v) => set("initials", v)}
        />
      </section>

      <SaveBar
        dirty={dirty}
        saving={saving}
        status={status}
        onSave={onPrimary}
        saveLabel={mode === "create" ? "Create author" : "Save"}
        onDelete={mode === "edit" ? onDelete : undefined}
        deleting={deleting}
      />
    </div>
  );
}
