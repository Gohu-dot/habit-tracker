import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utilitaire standard des composants shadcn/ui : clsx gère les classes
// conditionnelles, twMerge résout les conflits (ex. deux classes p-* en
// même temps) en gardant la dernière. Utilisé par tous les composants de
// components/ui.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
