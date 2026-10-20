"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { startOfMonth, startOfWeek, todayISO } from "@/lib/date";
import { monthDays } from "@/lib/history";
import { RPG_STATS, computeLevel, levelTitle, type RpgStatKey } from "@/lib/rpg";
import {
  computeDailyXp,
  computeRpgBestStreak,
  computeRpgStreak,
  countActiveDaysInRange,
} from "@/lib/rpgHistory";
import type { RpgMainQuest, RpgQuest, RpgQuestLog } from "@/lib/types";
import AppHeader from "./AppHeader";
import PushReminderToggle from "./PushReminderToggle";
import RpgHistorySection from "./RpgHistorySection";
import RpgSectionHeading from "./RpgSectionHeading";
import RpgStatIcon from "./RpgStatIcon";
import RpgStatPanel from "./RpgStatPanel";
import RpgXpChart from "./RpgXpChart";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type RpgPageProps = {
  userId: string;
};

export default function RpgPage({ userId }: RpgPageProps) {
  const [quests, setQuests] = useState<RpgQuest[]>([]);
  const [logs, setLogs] = useState<RpgQuestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [today] = useState(todayISO());

  const [manageOpen, setManageOpen] = useState(false);
  const [questTitle, setQuestTitle] = useState("");
  const [questStat, setQuestStat] = useState<RpgStatKey>(RPG_STATS[0].key);
  const [questXp, setQuestXp] = useState(10);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [savingQuest, setSavingQuest] = useState(false);

  const [mainQuests, setMainQuests] = useState<RpgMainQuest[]>([]);
  const [manageMainOpen, setManageMainOpen] = useState(false);
  const [mainQuestTitle, setMainQuestTitle] = useState("");
  const [mainQuestStat, setMainQuestStat] = useState<RpgStatKey>(RPG_STATS[0].key);
  const [mainQuestUnlockLevel, setMainQuestUnlockLevel] = useState(2);
  const [mainQuestXpReward, setMainQuestXpReward] = useState(50);
  const [editingMainQuestId, setEditingMainQuestId] = useState<string | null>(null);
  const [savingMainQuest, setSavingMainQuest] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      const [questsRes, logsRes, mainQuestsRes] = await Promise.all([
        supabase.from("rpg_quests").select("*").order("created_at", { ascending: true }),
        supabase.from("rpg_quest_logs").select("*"),
        supabase.from("rpg_main_quests").select("*").order("unlock_level", { ascending: true }),
      ]);
      if (ignore) return;

      const errors: string[] = [];
      if (questsRes.error) {
        console.error(questsRes.error);
        errors.push("quêtes (" + questsRes.error.message + ")");
      } else {
        setQuests(questsRes.data ?? []);
        if ((questsRes.data ?? []).length === 0) setManageOpen(true);
      }
      if (logsRes.error) {
        console.error(logsRes.error);
        errors.push("historique (" + logsRes.error.message + ")");
      } else {
        setLogs(logsRes.data ?? []);
      }
      if (mainQuestsRes.error) {
        console.error(mainQuestsRes.error);
        errors.push("quêtes principales (" + mainQuestsRes.error.message + ")");
      } else {
        setMainQuests(mainQuestsRes.data ?? []);
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
  }, []);

  const completedQuestIdsToday = useMemo(
    () => new Set(logs.filter((l) => l.log_date === today && l.quest_id).map((l) => l.quest_id as string)),
    [logs, today]
  );

  const xpByStat = useMemo(() => {
    const totals = new Map<RpgStatKey, number>();
    for (const stat of RPG_STATS) totals.set(stat.key, 0);
    for (const log of logs) {
      totals.set(log.stat_key, (totals.get(log.stat_key) ?? 0) + log.xp_value);
    }
    return totals;
  }, [logs]);

  const totalXp = useMemo(
    () => Array.from(xpByStat.values()).reduce((sum, xp) => sum + xp, 0),
    [xpByStat]
  );
  const characterLevel = useMemo(() => computeLevel(totalXp), [totalXp]);
  const todayXp = useMemo(
    () => logs.filter((l) => l.log_date === today).reduce((sum, l) => sum + l.xp_value, 0),
    [logs, today]
  );

  // Niveau courant de chaque capacité, nécessaire pour savoir quelles
  // quêtes principales sont débloquées (unlock_level <= levelByStat).
  const levelByStat = useMemo(() => {
    const levels = new Map<RpgStatKey, number>();
    for (const stat of RPG_STATS) {
      levels.set(stat.key, computeLevel(xpByStat.get(stat.key) ?? 0).level);
    }
    return levels;
  }, [xpByStat]);

  const statsWithMainQuests = useMemo(
    () => RPG_STATS.filter((stat) => mainQuests.some((q) => q.stat_key === stat.key)),
    [mainQuests]
  );

  const todayAsDate = useMemo(() => new Date(`${today}T00:00:00`), [today]);
  const dailyXp = useMemo(() => computeDailyXp(logs), [logs]);
  const currentMonthDays = useMemo(() => monthDays(todayAsDate), [todayAsDate]);
  const streak = useMemo(() => computeRpgStreak(dailyXp, today), [dailyXp, today]);
  const bestStreak = useMemo(() => {
    const earliestLogDate = logs.reduce(
      (min, l) => (l.log_date < min ? l.log_date : min),
      today
    );
    return computeRpgBestStreak(dailyXp, new Date(`${earliestLogDate}T00:00:00`), todayAsDate);
  }, [dailyXp, logs, today, todayAsDate]);
  const weekStats = useMemo(
    () => countActiveDaysInRange(dailyXp, startOfWeek(todayAsDate), todayAsDate),
    [dailyXp, todayAsDate]
  );
  const monthStats = useMemo(
    () => countActiveDaysInRange(dailyXp, startOfMonth(todayAsDate), todayAsDate),
    [dailyXp, todayAsDate]
  );

  async function handleToggleQuestToday(quest: RpgQuest) {
    setErrorMessage(null);
    const existing = logs.find((l) => l.quest_id === quest.id && l.log_date === today);
    if (existing) {
      const { error } = await supabase.from("rpg_quest_logs").delete().eq("id", existing.id);
      if (error) {
        console.error(error);
        setErrorMessage("Impossible de décocher cette quête : " + error.message);
      } else {
        setLogs((prev) => prev.filter((l) => l.id !== existing.id));
      }
    } else {
      const { data, error } = await supabase
        .from("rpg_quest_logs")
        .insert({
          user_id: userId,
          quest_id: quest.id,
          log_date: today,
          stat_key: quest.stat_key,
          xp_value: quest.xp_value,
        })
        .select()
        .single();
      if (error) {
        console.error(error);
        setErrorMessage("Impossible de valider cette quête : " + error.message);
      } else if (data) {
        setLogs((prev) => [...prev, data]);
      }
    }
  }

  function resetQuestForm() {
    setEditingQuestId(null);
    setQuestTitle("");
    setQuestStat(RPG_STATS[0].key);
    setQuestXp(10);
  }

  function handleStartEditQuest(quest: RpgQuest) {
    setErrorMessage(null);
    setEditingQuestId(quest.id);
    setQuestTitle(quest.title);
    setQuestStat(quest.stat_key);
    setQuestXp(quest.xp_value);
  }

  async function handleQuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!questTitle.trim() || questXp <= 0) return;
    setErrorMessage(null);
    setSavingQuest(true);
    const payload = { title: questTitle.trim(), stat_key: questStat, xp_value: questXp };

    if (editingQuestId) {
      const { data, error } = await supabase
        .from("rpg_quests")
        .update(payload)
        .eq("id", editingQuestId)
        .select()
        .single();
      setSavingQuest(false);
      if (error) {
        console.error(error);
        setErrorMessage("Impossible de modifier la quête : " + error.message);
      } else if (data) {
        setQuests((prev) => prev.map((q) => (q.id === editingQuestId ? data : q)));
        resetQuestForm();
      }
      return;
    }

    const { data, error } = await supabase
      .from("rpg_quests")
      .insert({ user_id: userId, ...payload })
      .select()
      .single();
    setSavingQuest(false);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible de créer la quête : " + error.message);
    } else if (data) {
      setQuests((prev) => [...prev, data]);
      resetQuestForm();
    }
  }

  async function handleDeleteQuest(quest: RpgQuest) {
    setErrorMessage(null);
    const { error } = await supabase.from("rpg_quests").delete().eq("id", quest.id);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible de supprimer la quête : " + error.message);
    } else {
      setQuests((prev) => prev.filter((q) => q.id !== quest.id));
      if (editingQuestId === quest.id) resetQuestForm();
    }
  }

  function resetMainQuestForm() {
    setEditingMainQuestId(null);
    setMainQuestTitle("");
    setMainQuestStat(RPG_STATS[0].key);
    setMainQuestUnlockLevel(2);
    setMainQuestXpReward(50);
  }

  function handleStartEditMainQuest(quest: RpgMainQuest) {
    setErrorMessage(null);
    setEditingMainQuestId(quest.id);
    setMainQuestTitle(quest.title);
    setMainQuestStat(quest.stat_key);
    setMainQuestUnlockLevel(quest.unlock_level);
    setMainQuestXpReward(quest.xp_reward);
  }

  async function handleMainQuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mainQuestTitle.trim() || mainQuestUnlockLevel <= 0 || mainQuestXpReward <= 0) return;
    setErrorMessage(null);
    setSavingMainQuest(true);
    const payload = {
      title: mainQuestTitle.trim(),
      stat_key: mainQuestStat,
      unlock_level: mainQuestUnlockLevel,
      xp_reward: mainQuestXpReward,
    };

    if (editingMainQuestId) {
      const { data, error } = await supabase
        .from("rpg_main_quests")
        .update(payload)
        .eq("id", editingMainQuestId)
        .select()
        .single();
      setSavingMainQuest(false);
      if (error) {
        console.error(error);
        setErrorMessage("Impossible de modifier la quête principale : " + error.message);
      } else if (data) {
        setMainQuests((prev) => prev.map((q) => (q.id === editingMainQuestId ? data : q)));
        resetMainQuestForm();
      }
      return;
    }

    const { data, error } = await supabase
      .from("rpg_main_quests")
      .insert({ user_id: userId, ...payload })
      .select()
      .single();
    setSavingMainQuest(false);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible de créer la quête principale : " + error.message);
    } else if (data) {
      setMainQuests((prev) => [...prev, data]);
      resetMainQuestForm();
    }
  }

  async function handleDeleteMainQuest(quest: RpgMainQuest) {
    setErrorMessage(null);
    const { error } = await supabase.from("rpg_main_quests").delete().eq("id", quest.id);
    if (error) {
      console.error(error);
      setErrorMessage("Impossible de supprimer la quête principale : " + error.message);
    } else {
      // on delete set null côté rpg_main_quests.xp_log_id, mais la ligne de
      // rpg_quest_logs créée au moment de la validation reste sinon : on la
      // retire nous-mêmes pour ne pas laisser un bonus d'XP fantôme.
      if (quest.xp_log_id) {
        await supabase.from("rpg_quest_logs").delete().eq("id", quest.xp_log_id);
        setLogs((prev) => prev.filter((l) => l.id !== quest.xp_log_id));
      }
      setMainQuests((prev) => prev.filter((q) => q.id !== quest.id));
      if (editingMainQuestId === quest.id) resetMainQuestForm();
    }
  }

  // Valide (ou annule la validation de) une quête principale. La validation
  // crédite un bonus d'XP via une ligne de rpg_quest_logs sans quest_id
  // (quest_id est réservé aux quêtes secondaires) ; l'annulation retire
  // cette même ligne pour ne pas laisser l'XP gagnée en trop.
  async function handleToggleMainQuestComplete(quest: RpgMainQuest) {
    setErrorMessage(null);
    if (quest.completed_at) {
      const { error } = await supabase
        .from("rpg_main_quests")
        .update({ completed_at: null, xp_log_id: null })
        .eq("id", quest.id)
        .select()
        .single();
      if (error) {
        console.error(error);
        setErrorMessage("Impossible d'annuler cette quête principale : " + error.message);
        return;
      }
      if (quest.xp_log_id) {
        await supabase.from("rpg_quest_logs").delete().eq("id", quest.xp_log_id);
        setLogs((prev) => prev.filter((l) => l.id !== quest.xp_log_id));
      }
      setMainQuests((prev) =>
        prev.map((q) => (q.id === quest.id ? { ...q, completed_at: null, xp_log_id: null } : q))
      );
      return;
    }

    const { data: logData, error: logError } = await supabase
      .from("rpg_quest_logs")
      .insert({
        user_id: userId,
        quest_id: null,
        log_date: today,
        stat_key: quest.stat_key,
        xp_value: quest.xp_reward,
      })
      .select()
      .single();
    if (logError) {
      console.error(logError);
      setErrorMessage("Impossible de valider cette quête principale : " + logError.message);
      return;
    }
    setLogs((prev) => [...prev, logData]);

    const completedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("rpg_main_quests")
      .update({ completed_at: completedAt, xp_log_id: logData.id })
      .eq("id", quest.id)
      .select()
      .single();
    if (error) {
      console.error(error);
      setErrorMessage("Impossible de valider cette quête principale : " + error.message);
      return;
    }
    setMainQuests((prev) => prev.map((q) => (q.id === quest.id ? data : q)));
  }

  if (loading) {
    return (
      <div className="rpg-backdrop min-h-screen">
        <p className="p-8 text-rpg-text-soft">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="rpg-backdrop min-h-screen text-rpg-text">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-8">
        <AppHeader userId={userId} variant="rpg" />

        {errorMessage && (
          <p className="rounded-lg border border-rpg-danger/40 bg-rpg-danger/10 px-3 py-2 text-sm text-rpg-danger">
            {errorMessage}
          </p>
        )}

        <PushReminderToggle userId={userId} variant="rpg" />

        <Card variant="rpg" className="p-5">
          <p className="font-rpg-display text-2xl font-semibold tracking-wide text-rpg-text">
            {levelTitle(characterLevel.level)}{" "}
            <span className="text-rpg-gold">— Niveau {characterLevel.level}</span>
          </p>
          <div className="rpg-rule my-3" />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
            <span className="text-rpg-text-soft">
              {totalXp} XP au total
            </span>
            <span className="hidden h-3.5 w-px bg-rpg-border sm:block" />
            <span className="text-rpg-text-soft">
              Aujourd&rsquo;hui : <span className="font-medium text-rpg-gold">+{todayXp} XP</span>
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-rpg-bg">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rpg-purple to-rpg-gold"
              style={{
                width: `${
                  characterLevel.xpForNextLevel > 0
                    ? Math.min(100, Math.round((characterLevel.xpIntoLevel / characterLevel.xpForNextLevel) * 100))
                    : 100
                }%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-rpg-text-soft">
            {characterLevel.xpIntoLevel} / {characterLevel.xpForNextLevel} XP jusqu&rsquo;au niveau{" "}
            {characterLevel.level + 1}
          </p>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RPG_STATS.map((stat) => (
            <RpgStatPanel key={stat.key} stat={stat} xp={xpByStat.get(stat.key) ?? 0} />
          ))}
        </div>

        <RpgXpChart dailyXp={dailyXp} monthDays={currentMonthDays} today={today} />

        <RpgHistorySection
          dailyXp={dailyXp}
          monthDays={currentMonthDays}
          today={today}
          streak={streak}
          bestStreak={bestStreak}
          weekStats={weekStats}
          monthStats={monthStats}
        />

        {statsWithMainQuests.length > 0 && (
          <Card variant="rpg" className="p-4">
            <RpgSectionHeading>🗺️ Quêtes principales</RpgSectionHeading>
            <div className="space-y-4">
              {statsWithMainQuests.map((stat) => {
                const chain = mainQuests
                  .filter((q) => q.stat_key === stat.key)
                  .sort((a, b) => a.unlock_level - b.unlock_level);
                const currentLevel = levelByStat.get(stat.key) ?? 1;
                return (
                  <div key={stat.key}>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-rpg-text-soft">
                      <RpgStatIcon statKey={stat.key} className="h-3.5 w-3.5" />
                      {stat.name} — niveau {currentLevel}
                    </p>
                    <div className="space-y-1.5">
                      {chain.map((quest) => {
                        const unlocked = currentLevel >= quest.unlock_level;
                        const completed = Boolean(quest.completed_at);
                        return (
                          <div
                            key={quest.id}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                              completed
                                ? "border-rpg-gold/40 bg-rpg-gold/10"
                                : unlocked
                                  ? "border-rpg-border bg-rpg-bg"
                                  : "border-rpg-border bg-rpg-bg opacity-50"
                            }`}
                          >
                            <span className="min-w-0 flex-1 text-sm text-rpg-text">
                              {completed ? "✅" : unlocked ? "🎯" : "🔒"} {quest.title}
                            </span>
                            {completed ? (
                              <button
                                type="button"
                                onClick={() => handleToggleMainQuestComplete(quest)}
                                className="shrink-0 text-xs text-rpg-text-soft underline hover:text-rpg-text"
                              >
                                Annuler
                              </button>
                            ) : unlocked ? (
                              <>
                                <Badge variant="rpg" className="shrink-0">
                                  +{quest.xp_reward} XP
                                </Badge>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="rpg"
                                  onClick={() => handleToggleMainQuestComplete(quest)}
                                  className="shrink-0"
                                >
                                  Marquer comme accompli
                                </Button>
                              </>
                            ) : (
                              <Badge variant="rpg-locked" className="shrink-0">
                                Niveau {quest.unlock_level} requis
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card variant="rpg" className="p-4">
          <RpgSectionHeading>⚔️ Quêtes du jour</RpgSectionHeading>
          {quests.length === 0 ? (
            <p className="text-sm text-rpg-text-soft">
              Aucune quête pour l&rsquo;instant — crée-en une dans &laquo;&nbsp;Gérer mes quêtes&nbsp;&raquo;
              ci-dessous.
            </p>
          ) : (
            <div className="space-y-2">
              {quests.map((quest) => {
                const stat = RPG_STATS.find((s) => s.key === quest.stat_key);
                const done = completedQuestIdsToday.has(quest.id);
                return (
                  <label
                    key={quest.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                      done
                        ? "border-rpg-gold/40 bg-rpg-gold/10"
                        : "border-rpg-border bg-rpg-bg hover:border-rpg-gold-dim/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => handleToggleQuestToday(quest)}
                      className="h-5 w-5 shrink-0 accent-rpg-gold"
                    />
                    <span className="flex min-w-0 flex-1 items-center gap-2 text-rpg-text">
                      {stat && <RpgStatIcon statKey={stat.key} className="h-4 w-4 shrink-0 text-rpg-gold-dim" />}
                      {quest.title}
                    </span>
                    <Badge variant="rpg" className="shrink-0">
                      +{quest.xp_value} XP
                    </Badge>
                  </label>
                );
              })}
            </div>
          )}
        </Card>

        <Card variant="rpg" className="p-4">
          <button
            type="button"
            onClick={() => setManageOpen((o) => !o)}
            className="flex w-full items-center justify-between font-rpg-display text-sm font-semibold uppercase tracking-wider text-rpg-gold"
          >
            <span>⚙️ Gérer mes quêtes</span>
            <span className="text-rpg-text-soft">{manageOpen ? "−" : "+"}</span>
          </button>

          {manageOpen && (
            <div className="mt-3 space-y-4">
              <form onSubmit={handleQuestSubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-rpg-text-soft">
                    {editingQuestId ? "Modifier la quête" : "Nouvelle quête"}
                  </p>
                  {editingQuestId && (
                    <button
                      type="button"
                      onClick={resetQuestForm}
                      className="text-xs text-rpg-text-soft underline hover:text-rpg-text"
                    >
                      Annuler la modification
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    required
                    value={questTitle}
                    onChange={(e) => setQuestTitle(e.target.value)}
                    placeholder="Ex. Séance de sport"
                    className="rounded-md border border-rpg-border bg-rpg-bg px-3 py-2 text-sm text-rpg-text placeholder:text-rpg-text-soft sm:col-span-1"
                  />
                  <select
                    value={questStat}
                    onChange={(e) => setQuestStat(e.target.value as RpgStatKey)}
                    className="rounded-md border border-rpg-border bg-rpg-bg px-3 py-2 text-sm text-rpg-text"
                  >
                    {RPG_STATS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    required
                    min={1}
                    value={questXp}
                    onChange={(e) => setQuestXp(Number(e.target.value))}
                    className="rounded-md border border-rpg-border bg-rpg-bg px-3 py-2 text-sm text-rpg-text"
                  />
                </div>
                <Button type="submit" variant="rpg" disabled={savingQuest}>
                  {savingQuest ? "Enregistrement..." : editingQuestId ? "Enregistrer" : "Créer la quête"}
                </Button>
              </form>

              {quests.length > 0 && (
                <div className="space-y-2 border-t border-rpg-border pt-3">
                  {quests.map((quest) => {
                    const stat = RPG_STATS.find((s) => s.key === quest.stat_key);
                    return (
                      <div
                        key={quest.id}
                        className="flex items-center gap-2 rounded-lg border border-rpg-border bg-rpg-bg px-3 py-2 text-sm"
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2 text-rpg-text">
                          {stat && <RpgStatIcon statKey={stat.key} className="h-4 w-4 shrink-0 text-rpg-gold-dim" />}
                          {quest.title}
                        </span>
                        <span className="shrink-0 text-xs text-rpg-text-soft">+{quest.xp_value} XP</span>
                        <button
                          type="button"
                          onClick={() => handleStartEditQuest(quest)}
                          aria-label="Modifier cette quête"
                          title="Modifier"
                          className="shrink-0 text-rpg-text-soft hover:text-rpg-text"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuest(quest)}
                          aria-label="Supprimer cette quête"
                          title="Supprimer"
                          className="shrink-0 text-rpg-text-soft hover:text-rpg-danger"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Card>

        <Card variant="rpg" className="p-4">
          <button
            type="button"
            onClick={() => setManageMainOpen((o) => !o)}
            className="flex w-full items-center justify-between font-rpg-display text-sm font-semibold uppercase tracking-wider text-rpg-gold"
          >
            <span>⚙️ Gérer les quêtes principales</span>
            <span className="text-rpg-text-soft">{manageMainOpen ? "−" : "+"}</span>
          </button>

          {manageMainOpen && (
            <div className="mt-3 space-y-4">
              <form onSubmit={handleMainQuestSubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-rpg-text-soft">
                    {editingMainQuestId ? "Modifier la quête principale" : "Nouvelle quête principale"}
                  </p>
                  {editingMainQuestId && (
                    <button
                      type="button"
                      onClick={resetMainQuestForm}
                      className="text-xs text-rpg-text-soft underline hover:text-rpg-text"
                    >
                      Annuler la modification
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={mainQuestTitle}
                  onChange={(e) => setMainQuestTitle(e.target.value)}
                  placeholder="Ex. Courir 10km"
                  className="w-full rounded-md border border-rpg-border bg-rpg-bg px-3 py-2 text-sm text-rpg-text placeholder:text-rpg-text-soft"
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <select
                    value={mainQuestStat}
                    onChange={(e) => setMainQuestStat(e.target.value as RpgStatKey)}
                    className="rounded-md border border-rpg-border bg-rpg-bg px-3 py-2 text-sm text-rpg-text"
                  >
                    {RPG_STATS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                  <div className="space-y-1">
                    <label className="text-xs text-rpg-text-soft">Niveau requis</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={mainQuestUnlockLevel}
                      onChange={(e) => setMainQuestUnlockLevel(Number(e.target.value))}
                      className="w-full rounded-md border border-rpg-border bg-rpg-bg px-3 py-2 text-sm text-rpg-text"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-rpg-text-soft">Bonus XP</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={mainQuestXpReward}
                      onChange={(e) => setMainQuestXpReward(Number(e.target.value))}
                      className="w-full rounded-md border border-rpg-border bg-rpg-bg px-3 py-2 text-sm text-rpg-text"
                    />
                  </div>
                </div>
                <Button type="submit" variant="rpg" disabled={savingMainQuest}>
                  {savingMainQuest
                    ? "Enregistrement..."
                    : editingMainQuestId
                      ? "Enregistrer"
                      : "Créer la quête principale"}
                </Button>
              </form>

              {mainQuests.length > 0 && (
                <div className="space-y-2 border-t border-rpg-border pt-3">
                  {mainQuests
                    .slice()
                    .sort((a, b) => a.stat_key.localeCompare(b.stat_key) || a.unlock_level - b.unlock_level)
                    .map((quest) => {
                      const stat = RPG_STATS.find((s) => s.key === quest.stat_key);
                      return (
                        <div
                          key={quest.id}
                          className="flex items-center gap-2 rounded-lg border border-rpg-border bg-rpg-bg px-3 py-2 text-sm"
                        >
                          <span className="flex min-w-0 flex-1 items-center gap-2 text-rpg-text">
                            {stat && <RpgStatIcon statKey={stat.key} className="h-4 w-4 shrink-0 text-rpg-gold-dim" />}
                            {quest.title}
                          </span>
                          <span className="shrink-0 text-xs text-rpg-text-soft">
                            Nv. {quest.unlock_level} · +{quest.xp_reward} XP
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEditMainQuest(quest)}
                            aria-label="Modifier cette quête principale"
                            title="Modifier"
                            className="shrink-0 text-rpg-text-soft hover:text-rpg-text"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMainQuest(quest)}
                            aria-label="Supprimer cette quête principale"
                            title="Supprimer"
                            className="shrink-0 text-rpg-text-soft hover:text-rpg-danger"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
