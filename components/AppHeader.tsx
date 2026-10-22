"use client";

import { supabase } from "@/lib/supabaseClient";
import InstallAppButton from "./InstallAppButton";
import NavTabs from "./NavTabs";
import ThemeToggle from "./ThemeToggle";

type AppHeaderProps = {
  userId: string;
  // "rpg" adapte les couleurs au fond sombre de cet espace et masque le
  // bouton thème (sans effet là-bas : l'espace RPG ne suit pas le
  // clair/sombre du reste du site, voir app/globals.css).
  variant?: "default" | "rpg";
};

// Header partagé entre les pages authentifiées (Dashboard, RecipesPage,
// RpgPage) : navigation entre onglets, thème, déconnexion, et bouton
// d'installation PWA (InstallAppButton, invisible la plupart du temps).
export default function AppHeader({ userId, variant = "default" }: AppHeaderProps) {
  const isRpg = variant === "rpg";

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <NavTabs userId={userId} variant={variant} />
        <div className="flex items-center gap-3">
          {!isRpg && <ThemeToggle />}
          <button
            onClick={handleSignOut}
            className={`text-sm ${isRpg ? "text-rpg-text-soft hover:text-rpg-text" : "text-ink-soft hover:text-ink"}`}
          >
            Se déconnecter
          </button>
        </div>
      </div>
      {/* Ne rend rien tant qu'il n'y a rien à proposer (déjà installé,
          déjà masqué...) — pas d'espace réservé inutile. */}
      <InstallAppButton variant={variant} />
    </div>
  );
}
