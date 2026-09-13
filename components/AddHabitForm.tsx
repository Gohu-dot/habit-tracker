"use client";

import { useState } from "react";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#a855f7", "#ef4444"];

type AddHabitFormProps = {
  onAdd: (name: string, color: string, targetPerWeek: number) => Promise<void>;
};

export default function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [targetPerWeek, setTargetPerWeek] = useState(7);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    await onAdd(trimmed, color, targetPerWeek);
    setSubmitting(false);
    setName("");
    setTargetPerWeek(7);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4"
    >
      <div className="min-w-[10rem] flex-1 space-y-1">
        <label className="text-sm text-neutral-300">Nouvelle habitude</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : boire 1,5L d'eau"
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-neutral-300">Objectif / semaine</label>
        <select
          value={targetPerWeek}
          onChange={(e) => setTargetPerWeek(Number(e.target.value))}
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
        >
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>
              {n}x
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-1">
        {COLORS.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setColor(c)}
            aria-label={`Couleur ${c}`}
            className="h-7 w-7 rounded-full border-2"
            style={{ backgroundColor: c, borderColor: c === color ? "white" : "transparent" }}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        Ajouter
      </button>
    </form>
  );
}
