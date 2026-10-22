"use client";

import AuthGate from "@/components/AuthGate";
import MoviesPage from "@/components/MoviesPage";

export default function Films() {
  return <AuthGate>{(userId) => <MoviesPage userId={userId} />}</AuthGate>;
}
