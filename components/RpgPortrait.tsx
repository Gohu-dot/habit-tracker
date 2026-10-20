type RpgPortraitProps = {
  title: string;
  // Portrait généré (pixel art), voir public/rpg/portraits/ — chaque
  // image porte déjà son propre cadre ornemental peint, donc affichée
  // carrée telle quelle, sans médaillon circulaire CSS par-dessus. Sans
  // image fournie, repli sur une silhouette SVG générique (médaillon
  // circulaire classique) en attendant qu'un portrait existe.
  imageSrc?: string;
  className?: string;
};

export default function RpgPortrait({ title, imageSrc, className }: RpgPortraitProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- portrait fourni localement (public/), pas de domaine externe à déclarer
        <img
          src={imageSrc}
          alt=""
          className="h-28 w-28 rounded-lg object-cover shadow-[0_8px_20px_-8px_rgba(0,0,0,0.7)] sm:h-32 sm:w-32"
        />
      ) : (
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-rpg-gold-dim bg-gradient-to-b from-rpg-panel to-rpg-panel-deep shadow-[inset_0_0_0_3px_rgba(0,0,0,0.35)]">
          <svg viewBox="0 0 100 100" className="h-16 w-16 text-rpg-gold-dim" fill="currentColor" aria-hidden="true">
            <circle cx="50" cy="36" r="18" />
            <path d="M18 92 C18 66 32 54 50 54 C68 54 82 66 82 92 Z" />
          </svg>
        </div>
      )}
      <p className="font-rpg-display text-xs uppercase tracking-widest text-rpg-text-soft">{title}</p>
    </div>
  );
}
