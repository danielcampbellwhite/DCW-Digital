import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-11 w-full rounded-lg border border-input bg-surface/50 px-3.5 py-2 text-sm text-foreground transition-colors",
      "placeholder:text-muted-foreground/70",
      "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/40",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-red-500/60 aria-[invalid=true]:ring-red-500/20",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
