// Détection minimale pour le bouton d'installation (InstallAppButton.tsx).
// Pas de librairie dédiée : l'API d'installation PWA tient en quelques
// lignes, et navigator.standalone (iOS) n'est reconnu par aucun type lib.dom
// standard, d'où le cast ci-dessous.

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone;
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone === true;
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPadOS se présente comme un Mac avec écran tactile depuis iOS 13 — le
  // test sur maxTouchPoints distingue ça d'un vrai Mac.
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

// Le navigateur ne type pas cet événement (encore expérimental hors Chromium).
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
