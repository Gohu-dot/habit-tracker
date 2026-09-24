"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getExistingSubscription,
  isPushSupported,
  serializeSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push";

type PushReminderToggleProps = {
  userId: string;
};

type Status = "checking" | "unsupported" | "off" | "on";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => h);
const DEFAULT_HOUR = 19;

export default function PushReminderToggle({ userId }: PushReminderToggleProps) {
  const [status, setStatus] = useState<Status>("checking");
  const [reminderHour, setReminderHour] = useState(DEFAULT_HOUR);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function checkStatus() {
      if (!isPushSupported()) {
        if (!ignore) setStatus("unsupported");
        return;
      }
      const existing = await getExistingSubscription();
      if (ignore) return;
      if (existing) {
        const { endpoint } = serializeSubscription(existing);
        const { data } = await supabase
          .from("push_subscriptions")
          .select("reminder_hour")
          .eq("endpoint", endpoint)
          .maybeSingle();
        if (!ignore) {
          if (data) setReminderHour(data.reminder_hour);
          setStatus("on");
        }
      } else {
        setStatus("off");
      }
    }
    checkStatus();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleEnable() {
    setError(null);
    setBusy(true);
    try {
      const subscription = await subscribeToPush();
      const { endpoint, p256dh, auth_key } = serializeSubscription(subscription);
      const { error: dbError } = await supabase
        .from("push_subscriptions")
        .upsert(
          { user_id: userId, endpoint, p256dh, auth_key, reminder_hour: reminderHour },
          { onConflict: "endpoint" }
        );
      if (dbError) throw dbError;
      setStatus("on");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Impossible d'activer les rappels.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setError(null);
    setBusy(true);
    try {
      const subscription = await getExistingSubscription();
      if (subscription) {
        const { endpoint } = serializeSubscription(subscription);
        await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
        await unsubscribeFromPush(subscription);
      }
      setStatus("off");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Impossible de désactiver les rappels.");
    } finally {
      setBusy(false);
    }
  }

  async function handleHourChange(hour: number) {
    setReminderHour(hour);
    if (status !== "on") return; // pas encore d'abonnement à mettre à jour
    setError(null);
    try {
      const subscription = await getExistingSubscription();
      if (!subscription) return;
      const { endpoint } = serializeSubscription(subscription);
      const { error: dbError } = await supabase
        .from("push_subscriptions")
        .update({ reminder_hour: hour })
        .eq("endpoint", endpoint);
      if (dbError) throw dbError;
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Impossible de changer l'heure.");
    }
  }

  if (status === "checking") return null;

  if (status === "unsupported") {
    return (
      <p className="text-xs text-ink-soft">
        Les rappels ne sont pas disponibles sur ce navigateur. Sur iPhone, il faut d&rsquo;abord
        installer le site sur l&rsquo;écran d&rsquo;accueil (Safari uniquement).
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <select
        value={reminderHour}
        onChange={(e) => handleHourChange(Number(e.target.value))}
        className="rounded-md border border-sand bg-ivory px-2 py-1.5 text-ink-soft"
        aria-label="Heure du rappel du soir"
      >
        {HOUR_OPTIONS.map((h) => (
          <option key={h} value={h}>
            {h}h
          </option>
        ))}
      </select>

      {status === "off" ? (
        <button
          onClick={handleEnable}
          disabled={busy}
          className="rounded-md border border-sand bg-ivory px-3 py-1.5 text-ink-soft hover:text-ink disabled:opacity-50"
        >
          🔔 Activer le rappel du soir
        </button>
      ) : (
        <button
          onClick={handleDisable}
          disabled={busy}
          className="rounded-md border border-sand bg-ivory px-3 py-1.5 text-ink-soft hover:text-ink disabled:opacity-50"
        >
          🔕 Désactiver le rappel du soir
        </button>
      )}
      {error && <span className="text-xs text-danger-text">{error}</span>}
    </div>
  );
}
