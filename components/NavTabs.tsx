"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_TABS = [
  { href: "/", label: "Habitudes" },
  { href: "/recettes", label: "Recettes" },
];

const RPG_TAB = { href: "/rpg", label: "RPG" };

// La variable d'env n'existe côté client que préfixée NEXT_PUBLIC_ : c'est
// un simple UUID (l'identifiant du compte), pas une donnée sensible. Sans
// elle (pas encore configurée), personne ne voit l'onglet RPG.
const RPG_USER_ID = process.env.NEXT_PUBLIC_RPG_USER_ID;

type NavTabsProps = {
  userId: string;
  variant?: "default" | "rpg";
};

export default function NavTabs({ userId, variant = "default" }: NavTabsProps) {
  const pathname = usePathname();
  const tabs = RPG_USER_ID && userId === RPG_USER_ID ? [...BASE_TABS, RPG_TAB] : BASE_TABS;
  const isRpg = variant === "rpg";

  return (
    <nav className="flex items-center gap-1">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        const activeClass = isRpg ? "bg-rpg-gold text-rpg-bg" : "bg-blush-deep text-white";
        const inactiveClass = isRpg
          ? "text-rpg-text-soft hover:text-rpg-text"
          : "text-ink-soft hover:text-ink";
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? activeClass : inactiveClass
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
