// Catalogue fixe des catégories et statuts de recettes, même logique que
// HABITS dans lib/habits.ts : la liste vit dans le code, pas en base.
export const RECIPE_CATEGORIES = [
  { key: "petit_dej", name: "Petit-déj" },
  { key: "dejeuner", name: "Déjeuner" },
  { key: "diner", name: "Dîner" },
  { key: "encas", name: "Encas / snack" },
  { key: "dessert", name: "Dessert" },
  { key: "boisson", name: "Boisson" },
] as const;

export type RecipeCategoryKey = (typeof RECIPE_CATEGORIES)[number]["key"];

export const RECIPE_STATUSES = [
  { key: "a_tester", name: "À tester" },
  { key: "testee", name: "Testée" },
  { key: "validee", name: "Validée ⭐" },
] as const;

export type RecipeStatusKey = (typeof RECIPE_STATUSES)[number]["key"];

// Prochain statut dans le cycle à_tester → testée → validée → à_tester, pour
// un bouton qui fait avancer le statut d'un clic sans menu déroulant.
export function nextRecipeStatus(current: RecipeStatusKey): RecipeStatusKey {
  const index = RECIPE_STATUSES.findIndex((s) => s.key === current);
  return RECIPE_STATUSES[(index + 1) % RECIPE_STATUSES.length].key;
}

// Utilisé côté client (déclencher la récupération de légende) et côté
// serveur (app/api/tiktok-caption) : seul TikTok a un oEmbed public
// exploitable sans compte développeur, contrairement à Instagram.
export function isTikTokUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === "tiktok.com" || hostname.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}
