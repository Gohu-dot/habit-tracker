"use client";

import AuthGate from "@/components/AuthGate";
import LessonsPage from "@/components/LessonsPage";

export default function Lecons() {
  return <AuthGate>{(userId) => <LessonsPage userId={userId} />}</AuthGate>;
}
