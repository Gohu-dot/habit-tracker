// Titre de section partagé par les panneaux de RpgPage : police display
// pixel art (VT323 via font-rpg-display), petites majuscules espacées,
// liseré doré en dessous — répété
// sur assez de panneaux (niveau, quêtes principales, quêtes du jour,
// gestion...) pour mériter un composant plutôt que de dupliquer les
// classes à chaque fois.
export default function RpgSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 space-y-1">
      <p className="font-rpg-display text-xs font-semibold uppercase tracking-wider text-rpg-gold">
        {children}
      </p>
      <div className="rpg-rule" />
    </div>
  );
}
