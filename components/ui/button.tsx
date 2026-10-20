import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:opacity-90",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-80",
        outline: "border border-border bg-transparent text-foreground hover:bg-secondary/50",
        ghost: "text-foreground hover:bg-secondary/50",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
        // Réservée à l'espace RPG : dégradé doré + petites majuscules
        // espacées façon bouton d'action de jeu, lueur au survol plutôt
        // qu'un simple hover:opacity-90 comme les autres variantes.
        rpg: "border border-rpg-gold/40 bg-gradient-to-b from-rpg-gold to-[#c99304] uppercase tracking-wide text-rpg-bg shadow-sm hover:shadow-[0_0_12px_2px_rgba(242,183,5,0.45)]",
        "rpg-outline":
          "border border-rpg-border bg-rpg-panel text-rpg-text-soft hover:border-rpg-gold/40 hover:text-rpg-text",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

// Pas de prop asChild/Slot ici (contrairement au shadcn/ui d'origine) :
// rien dans ce projet n'a besoin de composition polymorphe, ça éviterait
// juste une dépendance à @radix-ui/react-slot pour aucun usage réel.
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
