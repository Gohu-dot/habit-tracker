"use client";

import { computeLevel, type RpgStat } from "@/lib/rpg";
import RpgStatIcon from "./RpgStatIcon";

type RpgStatPanelProps = {
  stat: RpgStat;
  xp: number;
};

// Rangée de caractéristique façon fiche de personnage : le niveau est
// affiché comme un score (grand chiffre), pas comme une barre de
// progression en vedette — l'XP/niveau suivant redescend en détail
// secondaire (fine barre en dessous). Rendu en ligne plate plutôt qu'en
// carte isolée : plusieurs rangées cohabitent dans un seul Card côté
// RpgPage.tsx (liste à deux colonnes), comme l'écran de stats d'Oblivion
// plutôt qu'une grille de tuiles.
export default function RpgStatPanel({ stat, xp }: RpgStatPanelProps) {
  const { level, xpIntoLevel, xpForNextLevel } = computeLevel(xp);
  const percent = xpForNextLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100;
  // Petit coup de pouce visuel quand la capacité est sur le point de
  // monter de niveau, pour donner envie de finir la quête du jour.
  const almostThere = percent >= 85;

  return (
    <div className="flex items-center gap-2.5 py-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rpg-gold-dim/60 bg-rpg-bg text-rpg-gold-dim">
        <RpgStatIcon statKey={stat.key} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-rpg-display text-sm tracking-wide text-rpg-text">{stat.name}</span>
          <span className="font-rpg-pixel text-base leading-none text-rpg-gold">{level}</span>
        </div>
        <div
          className={`mt-1.5 h-1.5 overflow-hidden rounded-full bg-rpg-bg ${almostThere ? "rpg-glow" : ""}`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-rpg-accent to-rpg-gold"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
