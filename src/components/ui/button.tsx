import { forwardRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Motherson-style pill buttons (Theme 1).
 * - `pill`: red #DA2128 pill that inverts to charcoal #120304 on hover, right arrow nudges forward.
 * - `outline`: hairline charcoal pill with a red up-right arrow.
 * - `outline-light`: outline pill for dark backgrounds.
 * Visual rules live in globals.css (.pill / .link-pill) so every pill on the site is identical.
 */
type Variant = "pill" | "outline" | "outline-light";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  pill: "pill",
  outline: "link-pill",
  "outline-light": "link-pill link-pill--light",
};

function sizeClass(variant: Variant, size: Size): string {
  if (variant === "pill") return size === "sm" ? "pill--sm" : size === "lg" ? "pill--lg" : "";
  return size === "lg" ? "link-pill--lg" : "";
}

function DefaultIcon({ variant }: { variant: Variant }) {
  return variant === "pill" ? (
    <ArrowRight className="i" aria-hidden="true" />
  ) : (
    <ArrowUpRight className="i" aria-hidden="true" />
  );
}

interface PillOptions {
  variant?: Variant;
  size?: Size;
  /** Trailing icon. Defaults to the variant's arrow; pass `null` for none. */
  icon?: React.ReactNode | null;
  isLoading?: boolean;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    PillOptions {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "pill",
      size = "md",
      icon,
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(variantClass[variant], sizeClass(variant, size), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? "Sending…" : children}
      {!isLoading && (icon === undefined ? <DefaultIcon variant={variant} /> : icon)}
    </button>
  ),
);
Button.displayName = "Button";

export interface ButtonLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    Omit<PillOptions, "isLoading"> {
  href: string;
  /** Opens in a new tab with rel="noopener" and an accessible hint */
  external?: boolean;
}

const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant = "pill", size = "md", icon, href, external, children, ...props }, ref) => {
    const classes = cn(variantClass[variant], sizeClass(variant, size), className);
    const content = (
      <>
        {children}
        {icon === undefined ? <DefaultIcon variant={variant} /> : icon}
        {external && <span className="sr-only">(opens in a new tab)</span>}
      </>
    );
    if (external) {
      return (
        <a ref={ref} href={href} target="_blank" rel="noopener" className={classes} {...props}>
          {content}
        </a>
      );
    }
    return (
      <Link ref={ref} href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  },
);
ButtonLink.displayName = "ButtonLink";

export { Button, ButtonLink };
