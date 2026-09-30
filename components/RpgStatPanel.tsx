"use client";

import { computeLevel, type RpgStat } from "@/lib/rpg";

type RpgStatPanelProps = {
  stat: RpgStat;
  xp: number;
};

export default function RpgStatPanel({ stat, xp }: RpgStatPanelProps) {
  const { level, xpIntoLevel, xpForNextLevel } = computeLevel(xp);
  const percent = xpForNextLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100;

  return (
    <div className="rounded-xl border border-rpg-border bg-rpg-panel p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-rpg-text">
          {stat.icon} {stat.name}
        </span>
        <span className="text-xs text-rpg-text-soft">Nv. {level}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-rpg-bg">
        <div className="h-full rounded-full bg-rpg-gold" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-rpg-text-soft">
        {xpIntoLevel} / {xpForNextLevel} XP
      </p>
    </div>
  );
}
