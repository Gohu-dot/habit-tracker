"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { addDays, startOfMonth, startOfWeek, todayISO, toISODate } from "@/lib/date";
import { HABITS, DAILY_TARGET_POINTS, MAX_DAILY_POINTS, type HabitKey } from "@/lib/habits";
import { computeDailyTotals, computeStreak, countSuccessDaysInRange, monthDays } from "@/lib/history";
import type { HabitLog } from "@/lib/types";
import Gauge from "./Gauge";
import HabitCard from "./HabitCard";
import HistorySection from "./HistorySection";

type DashboardProps = {
  userId: string;
};

const HISTORY_DAYS = 90;

export default function Dashboard({ userId }: DashboardProps) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const [today, setToday] = useState(todayISO());

  // Sans ça, un onglet resté ouvert à travers minuit continuerait d'afficher
  // les coches de la veille tant qu'on ne rafraîchit pas la page.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleNextRollover() {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        5 // petite marge de sécurité après minuit
      );
      timeoutId = setTimeout(() => {
        setToday(todayISO());
        scheduleNextRollover();
      }, nextMidnight.getTime() - now.getTime());
    }

    scheduleNextRollover();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      const sinceDate = toISODate(addDays(new Date(), -HISTORY_DAYS));
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*")
        .gte("log_date", sinceDate);
      if (ignore) return;
      if (error) {
        console.error(error);
        setErrorMessage(
          "Impossible de charger les habitudes : " + error.message
        );
      } else {
        setLogs(data ?? []);
      }
      setLoading(false);
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [today]);

  const doneKeys = useMemo(
    () =>
      new Set(
        logs.filter((l) => l.log_date === today).map((l) => l.habit_key as HabitKey)
      ),
    [logs, today]
  );
  const totalPoints = HABITS.filter((h) => doneKeys.has(h.key)).reduce(
    (sum, h) => sum + h.points,
    0
  );
  const success = totalPoints >= DAILY_TARGET_POINTS;

  const todayAsDate = useMemo(() => new Date(`${today}T00:00:00`), [today]);
  const dailyTotals = useMemo(() => computeDailyTotals(logs), [logs]);
  const streak = useMemo(() => computeStreak(dailyTotals, today), [dailyTotals, today]);
  const weekStats = useMemo(
    () => countSuccessDaysInRange(dailyTotals, startOfWeek(todayAsDate), todayAsDate),
    [dailyTotals, todayAsDate]
  );
  const monthStats = useMemo(
    () => countSuccessDaysInRange(dailyTotals, startOfMonth(todayAsDate), todayAsDate),
    [dailyTotals, todayAsDate]
  );
  const currentMonthDays = useMemo(() => monthDays(todayAsDate), [todayAsDate]);

  // Petite animation quand on vient d'atteindre l'objectif du jour (pas au
  // premier chargement si l'objectif était déjà atteint auparavant).
  const prevSuccessRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevSuccessRef.current === false && success) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 1600);
      prevSuccessRef.current = success;
      return () => clearTimeout(timer);
    }
    prevSuccessRef.current = success;
  }, [success]);

  async function handleToggle(habit: (typeof HABITS)[number]) {
    setErrorMessage(null);
    const existing = logs.find((l) => l.habit_key === habit.key && l.log_date === today);
    if (existing) {
      const { error } = await supabase.from("habit_logs").delete().eq("id", existing.id);
      if (error) {
        console.error(error);
        setErrorMessage("Impossible de décocher cette habitude : " + error.message);
      } else {
        setLogs((prev) => prev.filter((l) => l.id !== existing.id));
      }
    } else {
      const { data, error } = await supabase
        .from("habit_logs")
        .insert({ user_id: userId, habit_key: habit.key, log_date: today })
        .select()
        .single();
      if (error) {
        console.error(error);
        setErrorMessage("Impossible d'enregistrer cette habitude : " + error.message);
      } else if (data) {
        setLogs((prev) => [...prev, data]);
      }
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return <p className="p-8 text-ink-soft">Chargement...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Mes habitudes</h1>
        <button onClick={handleSignOut} className="text-sm text-ink-soft hover:text-ink">
          Se déconnecter
        </button>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div
        className={`flex items-center gap-4 rounded-xl border border-sand bg-ivory p-4 shadow-sm ${
          celebrate ? "animate-celebrate" : ""
        }`}
      >
        <Gauge
          value={totalPoints}
          target={MAX_DAILY_POINTS}
          color={success ? "#B8656E" : "#E8B4B8"}
          size={96}
        />
        <div>
          <p className="text-lg font-medium text-ink">
            {totalPoints} point{totalPoints > 1 ? "s" : ""} aujourd&rsquo;hui
          </p>
          <p className="text-sm text-ink-soft">
            Objectif : {DAILY_TARGET_POINTS} points minimum par jour
          </p>
          {success ? (
            <p className="mt-1 text-sm font-medium text-blush-deep">
              {celebrate ? "✨ Objectif atteint !" : "✓ Objectif atteint"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink-soft">
              Encore {DAILY_TARGET_POINTS - totalPoints} point
              {DAILY_TARGET_POINTS - totalPoints > 1 ? "s" : ""} pour atteindre l&rsquo;objectif
            </p>
          )}
        </div>
      </div>

      <HistorySection
        dailyTotals={dailyTotals}
        monthDays={currentMonthDays}
        today={today}
        streak={streak}
        weekStats={weekStats}
        monthStats={monthStats}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {HABITS.map((habit) => (
          <HabitCard
            key={habit.key}
            habit={habit}
            done={doneKeys.has(habit.key)}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
