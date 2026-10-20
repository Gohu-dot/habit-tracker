import type { RpgStatKey } from "@/lib/rpg";

type RpgStatIconProps = {
  statKey: RpgStatKey;
  className?: string;
};

// Glyphes dessinés à la main (traits, pas de remplissage) pour évoquer les
// emblèmes de caractéristiques d'un jeu comme Oblivion, plutôt que les
// emoji de départ (💪🧠🛡️...) — mêmes rôles, traités en sceau gravé via
// RpgStatPanel (cercle + currentColor) plutôt qu'en couleurs multiples.
const GLYPHS: Record<RpgStatKey, React.ReactNode> = {
  // Force : épée.
  force: (
    <>
      <path d="M7 17 L17 7" />
      <path d="M12 12 L15 9 M12 12 L9 15" />
      <circle cx="7" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  // Intelligence : livre ouvert.
  intelligence: (
    <>
      <path d="M3 6.5 C6 5 9 5 12 6.5 C15 5 18 5 21 6.5 L21 17.5 C18 16 15 16 12 17.5 C9 16 6 16 3 17.5 Z" />
      <path d="M12 6.5 L12 17.5" />
    </>
  ),
  // Volonté : œil.
  volonte: (
    <>
      <path d="M3 12 C6 6.5 18 6.5 21 12 C18 17.5 6 17.5 3 12 Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  // Agilité : plume.
  agilite: (
    <>
      <path d="M6 18 C6 18 7 9 17 5 C17 5 15 14 6 18 Z" />
      <path d="M8.5 15.5 L15 6.5" />
    </>
  ),
  // Rapidité : éclair.
  rapidite: <path d="M13 2 L5 13.5 H11 L10 22 L19 9.5 H13 Z" />,
  // Endurance : bouclier.
  endurance: (
    <>
      <path d="M12 2.5 L19.5 5.8 V11 C19.5 16.3 16.2 19.8 12 21.5 C7.8 19.8 4.5 16.3 4.5 11 V5.8 Z" />
      <path d="M12 7 L12 16.5 M8.5 10 L15.5 10" />
    </>
  ),
  // Personnalité : masque.
  personnalite: (
    <>
      <path d="M12 3.2 C6.5 3.2 4.5 6.8 4.5 11.5 C4.5 16.8 7.8 20.8 12 20.8 C16.2 20.8 19.5 16.8 19.5 11.5 C19.5 6.8 17.5 3.2 12 3.2 Z" />
      <path d="M8.7 10.8 C8.7 10.1 9.3 9.6 9.9 9.6 C10.6 9.6 11.1 10.1 11.1 10.8" />
      <path d="M12.9 10.8 C12.9 10.1 13.5 9.6 14.1 9.6 C14.8 9.6 15.3 10.1 15.3 10.8" />
      <path d="M9 15 C10.5 16.3 13.5 16.3 15 15" />
    </>
  ),
  // Chance : fer à cheval.
  chance: <path d="M6.5 4 V12.5 C6.5 17 9 20 12 20 C15 20 17.5 17 17.5 12.5 V4" />,
};

// Icônes pixel art générées (public/rpg/icons/), chacune avec son propre
// cadre ornemental peint dans l'image (recadrage uniforme fait à
// l'import — voir CLAUDE.md) — même logique que le portrait
// (RpgPortrait.tsx) : affichées carrées telles quelles, pas de wrapper
// circulaire CSS par-dessus. Capacités sans icône générée pour l'instant :
// repli sur le glyphe SVG dessiné à la main (GLYPHS ci-dessus), à
// remplacer ici à mesure qu'elles sont générées.
export const RPG_STAT_ICON_IMAGES: Partial<Record<RpgStatKey, string>> = {
  chance: "/rpg/icons/chance.png",
  endurance: "/rpg/icons/endurance.png",
  agilite: "/rpg/icons/agilite.png",
  intelligence: "/rpg/icons/intelligence.png",
  personnalite: "/rpg/icons/personnalite.png",
  rapidite: "/rpg/icons/rapidite.png",
  volonte: "/rpg/icons/volonte.png",
  force: "/rpg/icons/force.png",
};

export default function RpgStatIcon({ statKey, className }: RpgStatIconProps) {
  const imageSrc = RPG_STAT_ICON_IMAGES[statKey];
  if (imageSrc) {
    // eslint-disable-next-line @next/next/no-img-element -- icône fournie localement (public/), cadre déjà peint dans l'image
    return <img src={imageSrc} alt="" className={`rounded-md object-cover ${className ?? ""}`} />;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {GLYPHS[statKey]}
    </svg>
  );
}
