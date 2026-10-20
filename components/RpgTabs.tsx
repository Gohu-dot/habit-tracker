export type RpgTabKey = "personnage" | "quetes" | "journal";

const TABS: { key: RpgTabKey; label: string }[] = [
  { key: "personnage", label: "Personnage" },
  { key: "quetes", label: "Quêtes" },
  { key: "journal", label: "Journal" },
];

type RpgTabsProps = {
  active: RpgTabKey;
  onChange: (tab: RpgTabKey) => void;
};

// Navigation interne à l'espace RPG (Personnage/Quêtes/Journal), distincte
// de NavTabs (qui navigue entre les routes Habitudes/Recettes/RPG) : façon
// onglets de reliure qui dépassent en haut d'une page de grimoire, plutôt
// qu'une longue page qui scroll tout l'onglet RPG d'un bloc.
export default function RpgTabs({ active, onChange }: RpgTabsProps) {
  return (
    <div className="flex gap-1 border-b border-rpg-border">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`-mb-px rounded-t-lg border border-b-0 px-4 py-2 font-rpg-display text-sm uppercase tracking-wide transition-colors ${
              isActive
                ? "border-rpg-border bg-rpg-panel text-rpg-gold"
                : "border-transparent text-rpg-text-soft hover:text-rpg-text"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
