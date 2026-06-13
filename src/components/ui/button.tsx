import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground font-semibold shadow-[0_0_30px_-8px_hsl(var(--primary)/0.6)] hover:shadow-[0_0_40px_-6px_hsl(var(--primary)/0.8)] hover:brightness-110",
        secondary:
          "bg-secondary text-secondary-foreground hover:brightness-110 shadow-[0_0_30px_-12px_hsl(var(--secondary)/0.7)]",
        outline:
          "border border-border bg-surface/40 text-foreground hover:bg-surface hover:border-primary/50",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-surface/60",
        accent:
          "bg-accent text-accent-foreground font-semibold hover:brightness-110 shadow-[0_0_30px_-10px_hsl(var(--accent)/0.7)]",
        link: "text-primary underline-offset-4 hover:underline rounded-none px-0",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type CommonProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Polymorphic button. Renders a Next `<Link>` (internal) or `<a>` (external)
 * when `href` is provided, otherwise a native `<button>`.
 */
export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(({ className, variant, size, ...props }, ref) => {
  const classes = cn(buttonVariants({ variant, size }), className);

  if ("href" in props && props.href !== undefined) {
    const { href, children, ...rest } = props as ButtonAsLink;
    const isExternal = /^https?:\/\//.test(href) || href.startsWith("mailto:");
    if (isExternal) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const { children, ...rest } = props as ButtonAsButton;
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...rest}>
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { buttonVariants };
