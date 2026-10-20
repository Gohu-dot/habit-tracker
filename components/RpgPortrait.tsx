type RpgPortraitProps = {
  title: string;
  // Prévu pour accueillir un vrai portrait généré plus tard (voir
  // discussion CLAUDE.md "Portrait de personnage") : si fourni, affiche
  // cette image à la place de la silhouette SVG, sans toucher au reste du
  // composant (même cadre, même légende).
  imageSrc?: string;
  className?: string;
};

// Médaillon de portrait de personnage, silhouette SVG générique en
// attendant un vrai portrait illustré (voir imageSrc ci-dessus) — ancre
// visuelle de l'onglet "Personnage", comme le buste tournant d'Oblivion.
export default function RpgPortrait({ title, imageSrc, className }: RpgPortraitProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-rpg-gold-dim bg-gradient-to-b from-rpg-panel to-rpg-panel-deep shadow-[inset_0_0_0_3px_rgba(0,0,0,0.35)]">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- portrait fourni localement (public/), pas de domaine externe à déclarer
          <img src={imageSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 100 100" className="h-20 w-20 text-rpg-gold-dim" fill="currentColor" aria-hidden="true">
            <circle cx="50" cy="36" r="18" />
            <path d="M18 92 C18 66 32 54 50 54 C68 54 82 66 82 92 Z" />
          </svg>
        )}
      </div>
      <p className="font-rpg-display text-xs uppercase tracking-widest text-rpg-text-soft">{title}</p>
    </div>
  );
}
