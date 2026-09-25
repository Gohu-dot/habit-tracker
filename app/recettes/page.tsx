"use client";

import { Suspense } from "react";
import AuthGate from "@/components/AuthGate";
import RecipesPage from "@/components/RecipesPage";

export default function Recettes() {
  return (
    <Suspense fallback={null}>
      <AuthGate>{(userId) => <RecipesPage userId={userId} />}</AuthGate>
    </Suspense>
  );
}
