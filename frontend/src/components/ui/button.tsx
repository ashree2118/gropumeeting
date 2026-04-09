import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "btn-gradient-primary !rounded-full !text-white hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md",
        outline:
          "btn-gradient-secondary !rounded-full !text-[#111] hover:-translate-y-0.5",
        secondary:
          "btn-gradient-secondary !rounded-full !text-[#111] hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-md",
        link: "text-primary underline-offset-4 hover:underline rounded-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const secondaryBg: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(135deg, #c4f5f0 0%, #d8f8e0 30%, #f0f8c0 60%, #f8f4b0 100%)",
};

function getInlineStyle(
  variant: string | null | undefined,
): React.CSSProperties | undefined {
  if (variant === "outline" || variant === "secondary") return secondaryBg;
  return undefined;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const extra = getInlineStyle(variant);
    const mergedStyle = extra ? { ...extra, ...style } : style;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={mergedStyle}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
