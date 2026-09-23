import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * shadcn Button, minus the Radix `Slot` (`asChild`) escape hatch —
 * @radix-ui/react-slot is not installed in this project. For links, spread
 * `buttonVariants({ variant, size })` onto an <a> or next/link <Link> instead.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-foreground text-black shadow-sm shadow-black/5 hover:bg-foreground/90",
        primary: "bg-primary text-primary-foreground shadow-sm shadow-black/5 hover:bg-primary/90",
        outline: "border border-white/15 bg-transparent text-white hover:border-white/30 hover:bg-white/5",
        ghost: "text-white/80 hover:bg-white/5 hover:text-white",
        link: "text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        full: "h-10 w-full rounded-lg px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
