"use client";

import { useState } from "react";
import { HABITS, type HabitKey } from "@/lib/habits";

type EditPastDayProps = {
  today: string;
  minDate: string;
  doneKeysForDate: (date: string) => Set<HabitKey>;
  isPeriodForDate: (date: string) => boolean;
  onToggleHabit: (habit: (typeof HABITS)[number], date: string) => void;
  onTogglePeriod: (date: string) => void;
};

export default function EditPastDay({
  today,
  minDate,
  doneKeysForDate,
  isPeriodForDate,
  onToggleHabit,
  onTogglePeriod,
}: EditPastDayProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);

  const doneKeys = doneKeysForDate(selectedDate);
  const isPeriod = isPeriodForDate(selectedDate);

  return (
    <div className="rounded-xl border border-sand bg-ivory p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-medium text-ink"
      >
        <span>✏️ Corriger un jour passé</span>
        <span className="text-ink-soft">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-ink-soft" htmlFor="edit-past-day-date">
              Date à corriger
            </label>
            <input
              id="edit-past-day-date"
              type="date"
              value={selectedDate}
              min={minDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border border-sand bg-cream px-2 py-1 text-sm text-ink"
            />
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={isPeriod}
              onChange={() => onTogglePeriod(selectedDate)}
              className="h-4 w-4 accent-terracotta-deep"
            />
            Règles ce jour-là
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            {HABITS.map((habit) => (
              <label
                key={habit.key}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-sand bg-cream px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={doneKeys.has(habit.key)}
                  onChange={() => onToggleHabit(habit, selectedDate)}
                  className="h-5 w-5 shrink-0 accent-blush-deep"
                />
                <span className="min-w-0 flex-1 text-ink">{habit.name}</span>
                <span className="shrink-0 text-xs text-ink-soft">
                  +{habit.points} pt{habit.points > 1 ? "s" : ""}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
