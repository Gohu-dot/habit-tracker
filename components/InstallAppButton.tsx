"use client";

import { useEffect, useState } from "react";
import { isIOS, isStandalone, type BeforeInstallPromptEvent } from "@/lib/pwa";
import { Button } from "./ui/button";

type InstallAppButtonProps = {
  // "rpg" adapte les couleurs au fond sombre de cet espace, même logique
  // que AppHeader/PushReminderToggle.
  variant?: "default" | "rpg";
};

const DISMISS_KEY = "pwa-install-dismissed";

// Bouton d'installation PWA discret dans AppHeader (donc présent sur les
// trois pages). Le site est déjà installable sans lui (manifest.ts + icônes
// + service worker suffisent pour que Chrome/Edge proposent "Installer
// l'application" dans leur propre menu), mais ce menu est peu visible : ce
// bouton déclenche directement l'invite native via beforeinstallprompt,
// capturé une seule fois par le navigateur — à ne pas appeler deux fois sur
// le même événement. Sur iOS, cette API n'existe pas du tout (Safari/WebKit)
// : on affiche à la place un rappel textuel du geste manuel (Partager →
// Sur l'écran d'accueil), seule façon d'installer là-bas.
export default function InstallAppButton({ variant = "default" }: InstallAppButtonProps) {
  const isRpg = variant === "rpg";
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true); // true tant qu'on n'a pas vérifié localStorage, pour éviter un flash

  useEffect(() => {
    if (isStandalone()) return; // déjà installé, rien à proposer
    // Déféré en microtâche (plutôt qu'un setState synchrone dans le corps de
    // l'effet) — même convention que ThemeToggle.tsx pour lire une valeur
    // côté client sans déclencher le lint react-hooks/set-state-in-effect.
    queueMicrotask(() => {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
      if (isIOS()) setShowIosHint(true);
    });
    if (isIOS()) return;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }
    function handleInstalled() {
      setPromptEvent(null);
      localStorage.setItem(DISMISS_KEY, "1");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleInstall() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    // L'invite ne peut servir qu'une fois, qu'elle soit acceptée ou non.
    setPromptEvent(null);
  }

  if (dismissed || (!promptEvent && !showIosHint)) return null;

  const mutedText = isRpg ? "text-rpg-text-soft" : "text-ink-soft";
  const dismissClass = isRpg
    ? "text-rpg-text-soft hover:text-rpg-text"
    : "text-ink-soft hover:text-ink";

  if (showIosHint) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <p className={mutedText}>
          📲 Installe le site : bouton Partager de Safari → « Sur l&rsquo;écran d&rsquo;accueil ».
        </p>
        <button onClick={handleDismiss} className={dismissClass} aria-label="Masquer ce rappel">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button onClick={handleInstall} variant={isRpg ? "rpg-outline" : "outline"} size="sm">
        📲 Installer l&rsquo;application
      </Button>
      <button onClick={handleDismiss} className={dismissClass} aria-label="Masquer ce bouton">
        ✕
      </button>
    </div>
  );
}
