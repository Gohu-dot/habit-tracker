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
  };
}
