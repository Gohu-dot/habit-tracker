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
import { Button } from "./ui/button";

type PushReminderToggleProps = {
  userId: string;
  // "rpg" adapte les couleurs au fond sombre de cet espace, même logique
  // que AppHeader/NavTabs.
  variant?: "default" | "rpg";
};

type Status = "checking" | "unsupported" | "off" | "on";

export default function PushReminderToggle({ userId, variant = "default" }: PushReminderToggleProps) {
  const isRpg = variant === "rpg";
  const [status, setStatus] = useState<Status>("checking");
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
      if (!ignore) setStatus(existing ? "on" : "off");
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
        .upsert({ user_id: userId, endpoint, p256dh, auth_key }, { onConflict: "endpoint" });
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

  if (status === "checking") return null;

  if (status === "unsupported") {
    return (
      <p className={`text-xs ${isRpg ? "text-rpg-text-soft" : "text-ink-soft"}`}>
        Les rappels ne sont pas disponibles sur ce navigateur. Sur iPhone, il faut d&rsquo;abord
        installer le site sur l&rsquo;écran d&rsquo;accueil (Safari uniquement).
      </p>
    );
  }

  // L'espace RPG garde ses classes manuelles (palette toujours sombre, non
  // concernée par le passage aux tokens shadcn ci-dessous) ; seule la
  // variante par défaut adopte le composant Button.
  const rpgButtonClass =
    "rounded-md border border-rpg-border bg-rpg-panel px-3 py-1.5 text-sm text-rpg-text-soft hover:text-rpg-text disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {status === "off" ? (
        isRpg ? (
          <button onClick={handleEnable} disabled={busy} className={rpgButtonClass}>
            🔔 Activer le rappel du soir (19h)
          </button>
        ) : (
          <Button onClick={handleEnable} disabled={busy} variant="outline" size="sm">
            🔔 Activer le rappel du soir (19h)
          </Button>
        )
      ) : isRpg ? (
        <button onClick={handleDisable} disabled={busy} className={rpgButtonClass}>
          🔕 Désactiver le rappel du soir
        </button>
      ) : (
        <Button onClick={handleDisable} disabled={busy} variant="outline" size="sm">
          🔕 Désactiver le rappel du soir
        </Button>
      )}
      {error && (
        <span className={`text-xs ${isRpg ? "text-rpg-danger" : "text-danger-text"}`}>{error}</span>
      )}
    </div>
  );
}
