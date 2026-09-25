"use client";

import AuthGate from "@/components/AuthGate";
import RecipesPage from "@/components/RecipesPage";

export default function Recettes() {
  return <AuthGate>{(userId) => <RecipesPage userId={userId} />}</AuthGate>;
}
