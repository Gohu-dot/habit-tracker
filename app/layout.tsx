import type { Metadata, Viewport } from "next";
import { Cinzel, EB_Garamond, Geist, Geist_Mono } from "next/font/google";
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

// Police display réservée à l'espace RPG (titres uniquement, via la classe
// font-display sur RpgPage) — jamais utilisée sur le reste du site, qui
// garde Geist partout.
const cinzel = Cinzel({
  variable: "--font-rpg-cinzel",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Police de texte courant de l'espace RPG (labels, descriptions...) : un
// serif plus "manuscrit ancien" que Geist, en complément de Cinzel qui
// reste réservé aux grands titres. Même logique : jamais utilisée hors de
// l'espace RPG.
const ebGaramond = EB_Garamond({
  variable: "--font-rpg-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${ebGaramond.variable} h-full antialiased`}
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
