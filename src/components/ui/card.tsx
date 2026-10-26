import { cn } from "@/lib/utils";

/**
 * Theme 1 modular card: white surface, 1px #E3E3E3 hairline, square corners.
 * Section-specific cards add their own Theme 1 class (e.g. "cert", "leader", "res")
 * for padding and hover behaviour.
 */
type CardElement = "div" | "article" | "section" | "li";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: CardElement;
  /** Adds the Theme 1 hover: charcoal hairline + gentle lift */
  interactive?: boolean;
  children: React.ReactNode;
}

export function Card({
  as: Tag = "div",
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "border border-slate-border bg-white",
        interactive &&
          "transition-[border-color,transform,box-shadow] duration-300 ease-theme hover:-translate-y-1 hover:border-charcoal hover:shadow-[0_20px_40px_rgba(18,3,4,0.08)]",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 space-y-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[19px] font-normal leading-snug text-charcoal",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-[14.5px] text-slate-body", className)} {...props}>
      {children}
    </div>
  );
}
