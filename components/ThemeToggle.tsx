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
