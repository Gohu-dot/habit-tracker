"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  addDays,
  DAY_RESET_HOUR,
  DAY_RESET_MINUTE,
  startOfMonth,
  startOfWeek,
  todayISO,
  toISODate,
} from "@/lib/date";
import { HABITS, MAX_DAILY_POINTS, PERIOD_TARGET_POINTS, type HabitKey } from "@/lib/habits";
import {
  computeDailyTotals,
  computeStreak,
  countSuccessDaysInRange,
  monthDays,
  targetForDay,
} from "@/lib/history";
import {
  HIGH_SCORE_PHRASES,
  HIGH_SCORE_PHRASES_PERIOD,
  LOW_SCORE_PHRASES,
  LOW_SCORE_PHRASES_PERIOD,
  pickDailyPhrase,
} from "@/lib/phrases";
import type { HabitLog, PeriodDay } from "@/lib/types";
import Gauge from "./Gauge";
import HabitCard from "./HabitCard";
import HistorySection from "./HistorySection";
import PointsChart from "./PointsChart";
import PushReminderToggle from "./PushReminderToggle";
import ThemeToggle from "./ThemeToggle";

type DashboardProps = {
  userId: string;
};

const HISTORY_DAYS = 90;

export default function Dashboard({ userId }: DashboardProps) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [periodDayRows, setPeriodDayRows] = useState<PeriodDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const [today, setToday] = useState(todayISO());

  // Sans ça, un onglet resté ouvert à travers l'heure de réinitialisation
  // continuerait d'afficher les coches de la veille tant qu'on ne
  // rafraîchit pas la page.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleNextRollover() {
      const now = new Date();
      let nextReset = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        DAY_RESET_HOUR,
        DAY_RESET_MINUTE,
        5 // petite marge de sécurité après l'heure de reset
      );
      if (nextReset.getTime() <= now.getTime()) {
        nextReset = addDays(nextReset, 1);
      }
      timeoutId = setTimeout(() => {
        setToday(todayISO());
        scheduleNextRollover();
      }, nextReset.getTime() - now.getTime());
    }

    scheduleNextRollover();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      const sinceDate = toISODate(addDays(new Date(), -HISTORY_DAYS));
      const [habitLogsRes, periodDaysRes] = await Promise.all([
        supabase.from("habit_logs").select("*").gte("log_date", sinceDate),
        supabase.from("period_days").select("*").gte("log_date", sinceDate),
      ]);
      if (ignore) return;

      // Les deux requêtes sont indépendantes : si l'une échoue (ex. table
      // pas encore migrée), on affiche quand même les données de l'autre
      // plutôt que de tout masquer.
      const errors: string[] = [];
      if (habitLogsRes.error) {
        console.error(habitLogsRes.error);
        errors.push("habitudes (" + habitLogsRes.error.message + ")");
      } else {
        setLogs(habitLogsRes.data ?? []);
      }
      if (periodDaysRes.error) {
        console.error(periodDaysRes.error);
        errors.push("jours de règles (" + periodDaysRes.error.message + ")");
      } else {
        setPeriodDayRows(periodDaysRes.data ?? []);
      }
      if (errors.length > 0) {
        setErrorMessage("Impossible de charger : " + errors.join(" · "));
      }
      setLoading(false);
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [today]);

  const periodDays = useMemo(
    () => new Set(periodDayRows.map((p) => p.log_date)),
    [periodDayRows]
  );
  const isPeriodToday = periodDays.has(today);
  const todayTarget = targetForDay(today, periodDays);

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
  const success = totalPoints >= todayTarget;

  const todayAsDate = useMemo(() => new Date(`${today}T00:00:00`), [today]);
  const dailyTotals = useMemo(() => computeDailyTotals(logs), [logs]);
  const streak = useMemo(
    () => computeStreak(dailyTotals, today, periodDays),
    [dailyTotals, today, periodDays]
  );
  const weekStats = useMemo(
    () => countSuccessDaysInRange(dailyTotals, startOfWeek(todayAsDate), todayAsDate, periodDays),
    [dailyTotals, todayAsDate, periodDays]
  );
  const monthStats = useMemo(
    () => countSuccessDaysInRange(dailyTotals, startOfMonth(todayAsDate), todayAsDate, periodDays),
    [dailyTotals, todayAsDate, periodDays]
  );
  const currentMonthDays = useMemo(() => monthDays(todayAsDate), [todayAsDate]);

  const phrase = useMemo(() => {
    const pool = isPeriodToday
      ? success
        ? HIGH_SCORE_PHRASES_PERIOD
        : LOW_SCORE_PHRASES_PERIOD
      : success
        ? HIGH_SCORE_PHRASES
        : LOW_SCORE_PHRASES;
    return pickDailyPhrase(pool, `${today}-${isPeriodToday ? "p" : "n"}-${success ? "hi" : "lo"}`);
  }, [today, isPeriodToday, success]);

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

  async function handleTogglePeriod() {
    setErrorMessage(null);
    const existing = periodDayRows.find((p) => p.log_date === today);
    if (existing) {
      const { error } = await supabase.from("period_days").delete().eq("id", existing.id);
      if (error) {
        console.error(error);
        setErrorMessage("Impossible de décocher : " + error.message);
      } else {
        setPeriodDayRows((prev) => prev.filter((p) => p.id !== existing.id));
      }
    } else {
      const { data, error } = await supabase
        .from("period_days")
        .insert({ user_id: userId, log_date: today })
        .select()
        .single();
      if (error) {
        console.error(error);
        setErrorMessage("Impossible d'enregistrer : " + error.message);
      } else if (data) {
        setPeriodDayRows((prev) => [...prev, data]);
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
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={handleSignOut} className="text-sm text-ink-soft hover:text-ink">
            Se déconnecter
          </button>
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={isPeriodToday}
            onChange={handleTogglePeriod}
            className="h-4 w-4 accent-terracotta-deep"
          />
          J&rsquo;ai mes règles aujourd&rsquo;hui (objectif abaissé à {PERIOD_TARGET_POINTS} pts)
        </label>
        <PushReminderToggle userId={userId} />
      </div>

      <div
        className={`flex items-center gap-4 rounded-xl border border-sand bg-ivory p-4 shadow-sm ${
          celebrate ? "animate-celebrate" : ""
        }`}
      >
        <Gauge
          value={totalPoints}
          target={MAX_DAILY_POINTS}
          color={
            isPeriodToday
              ? success
                ? "var(--color-terracotta-deep)"
                : "var(--color-terracotta)"
              : success
                ? "var(--color-blush-deep)"
                : "var(--color-blush)"
          }
          size={96}
        />
        <div>
          <p className="text-lg font-medium text-ink">
            {totalPoints} point{totalPoints > 1 ? "s" : ""} aujourd&rsquo;hui
          </p>
          <p className="text-sm text-ink-soft">
            Objectif : {todayTarget} points minimum par jour
            {isPeriodToday ? " (abaissé — règles)" : ""}
          </p>
          {success ? (
            <p
              className={`mt-1 text-sm font-medium ${
                isPeriodToday ? "text-terracotta-deep" : "text-blush-deep"
              }`}
            >
              {celebrate ? "✨ Objectif atteint !" : "✓ Objectif atteint"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink-soft">
              Encore {todayTarget - totalPoints} point
              {todayTarget - totalPoints > 1 ? "s" : ""} pour atteindre l&rsquo;objectif
            </p>
          )}
          <p className="mt-2 text-sm italic text-ink-soft">{phrase}</p>
        </div>
      </div>

      <PointsChart
        dailyTotals={dailyTotals}
        monthDays={currentMonthDays}
        today={today}
        periodDays={periodDays}
      />

      <HistorySection
        dailyTotals={dailyTotals}
        monthDays={currentMonthDays}
        today={today}
        periodDays={periodDays}
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
