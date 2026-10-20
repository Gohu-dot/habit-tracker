import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Polices "pixel art" réservées à l'espace RPG, en phase avec le portrait
// généré (voir public/rpg/portraits/) — remplacent Cinzel/EB Garamond
// (essai précédent, plus "manuscrit médiéval" que "jeu vidéo rétro").
// Jamais utilisées hors de l'espace RPG, qui garde Geist partout ailleurs.
// Press Start 2P : très blocky, réservée aux gros titres/chiffres (le
// niveau, "NIVEAU X") — illisible en paragraphe à cette densité de pixels.
const pressStart2P = Press_Start_2P({
  variable: "--font-rpg-pixel-display",
  subsets: ["latin"],
  weight: "400",
});

// VT323 : pixel art aussi mais beaucoup plus lisible en texte courant
// (c'est un monospace pensé pour de longues lignes de terminal rétro) —
// labels, descriptions, tout le texte qui n'est pas un titre.
const vt323 = VT323({
  variable: "--font-rpg-pixel-body",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Suivi personnel d'habitudes de vie",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Habitudes",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5efe6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${vt323.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {/* Applique le thème sauvegardé avant le premier rendu, pour éviter
            un flash du thème clair au chargement quand le thème sombre est
            actif. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var stored = localStorage.getItem('theme');
              if (stored === 'dark' || stored === 'light') {
                document.documentElement.setAttribute('data-theme', stored);
              } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            } catch (e) {}
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
