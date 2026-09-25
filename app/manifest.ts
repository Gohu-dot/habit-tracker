import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habit Tracker",
    short_name: "Habitudes",
    description: "Suivi personnel d'habitudes de vie",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe6",
    theme_color: "#f5efe6",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    // Fait apparaître le site dans le menu "Partager" d'Android (ex. depuis
    // TikTok ou Instagram) une fois l'app installée sur l'écran d'accueil.
    // GET + query params, pas de fichier à gérer : voir RecipesPage.tsx pour
    // l'extraction du lien à partir de "shared_text".
    share_target: {
      action: "/recettes",
      method: "GET",
      params: {
        title: "shared_title",
        text: "shared_text",
        url: "shared_url",
      },
    },
  };
}
