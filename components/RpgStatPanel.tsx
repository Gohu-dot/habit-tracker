"use client";

import { computeLevel, type RpgStat } from "@/lib/rpg";
import RpgStatIcon from "./RpgStatIcon";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

type RpgStatPanelProps = {
  stat: RpgStat;
  xp: number;
};

export default function RpgStatPanel({ stat, xp }: RpgStatPanelProps) {
  const { level, xpIntoLevel, xpForNextLevel } = computeLevel(xp);
  const percent = xpForNextLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100;
  // Petit coup de pouce visuel quand la capacité est sur le point de
  // monter de niveau, pour donner envie de finir la quête du jour.
  const almostThere = percent >= 85;

  return (
    <Card variant="rpg" className="p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-rpg-text">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rpg-gold-dim/60 bg-rpg-bg text-rpg-gold-dim">
            <RpgStatIcon statKey={stat.key} className="h-5 w-5" />
          </span>
          <span className="font-rpg-display tracking-wide">{stat.name}</span>
        </span>
        <Badge variant="rpg">Nv. {level}</Badge>
      </div>
      <div
        className={`mt-3 h-2 overflow-hidden rounded-full bg-rpg-bg ${almostThere ? "rpg-glow" : ""}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-rpg-purple to-rpg-gold"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-rpg-text-soft">
        {xpIntoLevel} / {xpForNextLevel} XP
      </p>
    </Card>
  );
}
