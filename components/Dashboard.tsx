"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { startOfWeek, todayISO, toISODate } from "@/lib/date";
import type { Habit, HabitLog } from "@/lib/types";
import HabitCard from "./HabitCard";
import AddHabitForm from "./AddHabitForm";

type DashboardProps = {
  userId: string;
};

export default function Dashboard({ userId }: DashboardProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStartISO = toISODate(startOfWeek(new Date()));
  const today = todayISO();

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      const [{ data: habitsData }, { data: logsData }] = await Promise.all([
        supabase
          .from("habits")
          .select("*")
          .eq("archived", false)
          .order("created_at", { ascending: true }),
        supabase.from("habit_logs").select("*").gte("log_date", weekStartISO),
      ]);
      if (ignore) return;
      setHabits(habitsData ?? []);
      setLogs(logsData ?? []);
      setLoading(false);
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [weekStartISO]);

  async function handleAdd(name: string, color: string, targetPerWeek: number) {
    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: userId, name, color, target_per_week: targetPerWeek })
      .select()
      .single();
    if (!error && data) setHabits((prev) => [...prev, data]);
  }

  async function handleDelete(habit: Habit) {
    if (!confirm(`Supprimer "${habit.name}" et tout son historique ?`)) return;
    const { error } = await supabase.from("habits").delete().eq("id", habit.id);
    if (!error) setHabits((prev) => prev.filter((h) => h.id !== habit.id));
  }

  async function handleToggleToday(habit: Habit) {
    const existing = logs.find((l) => l.habit_id === habit.id && l.log_date === today);
    if (existing) {
      const { error } = await supabase.from("habit_logs").delete().eq("id", existing.id);
      if (!error) setLogs((prev) => prev.filter((l) => l.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from("habit_logs")
        .insert({ habit_id: habit.id, user_id: userId, log_date: today })
        .select()
        .single();
      if (!error && data) setLogs((prev) => [...prev, data]);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return <p className="p-8 text-neutral-400">Chargement...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-100">Mes habitudes</h1>
        <button onClick={handleSignOut} className="text-sm text-neutral-400 hover:text-neutral-200">
          Se déconnecter
        </button>
      </div>

      <AddHabitForm onAdd={handleAdd} />

      {habits.length === 0 ? (
        <p className="text-neutral-400">Ajoute ta première habitude ci-dessus.</p>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const weekCount = logs.filter((l) => l.habit_id === habit.id).length;
            const doneToday = logs.some((l) => l.habit_id === habit.id && l.log_date === today);
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                weekCount={weekCount}
                doneToday={doneToday}
                onToggleToday={handleToggleToday}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
