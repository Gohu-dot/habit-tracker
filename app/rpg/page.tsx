"use client";

import AuthGate from "@/components/AuthGate";
import RpgPage from "@/components/RpgPage";

export default function Rpg() {
  return <AuthGate>{(userId) => <RpgPage userId={userId} />}</AuthGate>;
}
