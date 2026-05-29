"use client";

import type { ReactNode } from "react";

// Generic array editor: add / remove / reorder, with a render-prop for each
// item's fields. Composes (a repeater can render another repeater inside).
export function RepeaterField<T>({
  label,
  hint,
  items,
  onChange,
  emptyItem,
  renderItem,
  addLabel = "Add item",
  min = 0,
  max,
}: {
  label: string;
  hint?: string;
  items: T[];
  onChange: (next: T[]) => void;
  emptyItem: () => T;
  renderItem: (item: T, onItemChange: (next: T) => void, index: number) => ReactNode;
  addLabel?: string;
  min?: number;
  max?: number;
}) {
  const updateAt = (i: number, next: T) =>
    onChange(items.map((it, j) => (j === i ? next : it)));
  const removeAt = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="adm-repeater">
      <div className="adm-repeater-head">
        <span className="adm-label">{label}</span>
        {hint && <span className="adm-hint">{hint}</span>}
      </div>

      {items.map((item, i) => (
        <div className="adm-repeater-item" key={i}>
          <div className="adm-repeater-item-head">
            <span className="adm-repeater-idx">#{i + 1}</span>
            <div className="adm-repeater-controls">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
              <button
                type="button"
                onClick={() => removeAt(i)}
                disabled={items.length <= min}
                aria-label="Remove"
                className="adm-repeater-remove"
              >
                ✕
              </button>
            </div>
          </div>
          {renderItem(item, (next) => updateAt(i, next), i)}
        </div>
      ))}

      {(max === undefined || items.length < max) && (
        <button type="button" className="adm-add" onClick={() => onChange([...items, emptyItem()])}>
          + {addLabel}
        </button>
      )}
    </div>
  );
}
