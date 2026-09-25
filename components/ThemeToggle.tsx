"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Lit le thème réellement appliqué (déjà posé par le script anti-flash
  // dans app/layout.tsx) une fois le composant monté côté client.
  useEffect(() => {
    queueMicrotask(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
  }, []);

  // Tant qu'aucun choix explicite n'a été fait (rien dans localStorage), on
  // suit le thème du système en direct : si l'utilisateur bascule son
  // téléphone/ordinateur en mode sombre, le site suit sans qu'elle ait
  // besoin de cliquer sur le bouton. Dès qu'elle clique une fois (voir
  // toggleTheme), ce choix explicite prend le pas et le système est ignoré.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function syncFromSystem(e: MediaQueryListEvent | MediaQueryList) {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("theme");
      } catch {
        // navigation privée, etc. : pas de préférence explicite mémorisée.
      }
      if (stored === "dark" || stored === "light") return;
      const next = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      setIsDark(next === "dark");
    }

    mediaQuery.addEventListener("change", syncFromSystem);
    return () => mediaQuery.removeEventListener("change", syncFromSystem);
  }, []);

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage indisponible (navigation privée, etc.) : la préférence
      // ne sera simplement pas retenue d'une visite à l'autre.
    }
    setIsDark(next === "dark");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
      title={isDark ? "Thème clair" : "Thème sombre"}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-sand bg-ivory text-sm hover:bg-sand/40"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
