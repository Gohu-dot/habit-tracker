"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { todayISO } from "@/lib/date";
import { RPG_STATS, computeLevel, type RpgStatKey } from "@/lib/rpg";
import type { RpgQuest, RpgQuestLog } from "@/lib/types";
import AppHeader from "./AppHeader";
import RpgStatPanel from "./RpgStatPanel";

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

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      const [questsRes, logsRes] = await Promise.all([
        supabase.from("rpg_quests").select("*").order("created_at", { ascending: true }),
        supabase.from("rpg_quest_logs").select("*"),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-rpg-bg">
        <p className="p-8 text-rpg-text-soft">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rpg-bg text-rpg-text">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-8">
        <AppHeader userId={userId} variant="rpg" />

        {errorMessage && (
          <p className="rounded-lg border border-rpg-danger/40 bg-rpg-danger/10 px-3 py-2 text-sm text-rpg-danger">
            {errorMessage}
          </p>
        )}

        <div className="rounded-xl border border-rpg-border bg-rpg-panel p-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-rpg-text">🏆 Niveau {characterLevel.level}</p>
            <p className="text-sm text-rpg-text-soft">+{todayXp} XP aujourd&rsquo;hui</p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-rpg-bg">
            <div
              className="h-full rounded-full bg-rpg-purple"
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
            {characterLevel.xpIntoLevel} / {characterLevel.xpForNextLevel} XP · {totalXp} XP au total
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RPG_STATS.map((stat) => (
            <RpgStatPanel key={stat.key} stat={stat} xp={xpByStat.get(stat.key) ?? 0} />
          ))}
        </div>

        <div className="rounded-xl border border-rpg-border bg-rpg-panel p-4">
          <p className="mb-3 text-sm font-medium text-rpg-text">Quêtes du jour</p>
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
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-rpg-border bg-rpg-bg px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => handleToggleQuestToday(quest)}
                      className="h-5 w-5 shrink-0 accent-rpg-gold"
                    />
                    <span className="min-w-0 flex-1 text-rpg-text">
                      {stat?.icon} {quest.title}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-rpg-gold">+{quest.xp_value} XP</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-rpg-border bg-rpg-panel p-4">
          <button
            type="button"
            onClick={() => setManageOpen((o) => !o)}
            className="flex w-full items-center justify-between text-sm font-medium text-rpg-text"
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
                <button
                  type="submit"
                  disabled={savingQuest}
                  className="rounded-md bg-rpg-gold px-4 py-2 text-sm font-medium text-rpg-bg hover:opacity-90 disabled:opacity-50"
                >
                  {savingQuest ? "Enregistrement..." : editingQuestId ? "Enregistrer" : "Créer la quête"}
                </button>
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
                        <span className="min-w-0 flex-1 text-rpg-text">
                          {stat?.icon} {quest.title}
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
        </div>
      </div>
    </div>
  );
}
