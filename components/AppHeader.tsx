"use client";

import { supabase } from "@/lib/supabaseClient";
import NavTabs from "./NavTabs";
import ThemeToggle from "./ThemeToggle";

// Header partagé entre les pages authentifiées (Dashboard, RecipesPage) :
// navigation entre onglets, thème, déconnexion.
export default function AppHeader() {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="flex items-center justify-between">
      <NavTabs />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button onClick={handleSignOut} className="text-sm text-ink-soft hover:text-ink">
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
