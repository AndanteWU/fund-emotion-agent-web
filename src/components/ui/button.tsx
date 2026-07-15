import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full border border-transparent bg-clip-padding text-sm font-medium transition-[background-color,border-color,color,box-shadow,filter,transform] duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:cursor-not-allowed disabled:opacity-100 data-disabled:cursor-not-allowed data-disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-[13px] bg-[#1f1f1d] text-white shadow-[0_1px_2px_rgb(17_17_15_/_10%)] hover:bg-[#343430] hover:shadow-[0_2px_6px_rgb(17_17_15_/_10%)] active:bg-[#11110f] active:scale-[0.99] focus-visible:ring-[#1f1f1d]/20 disabled:bg-[#d8d5ce] disabled:text-[#5f5b54] disabled:shadow-none data-disabled:bg-[#d8d5ce] data-disabled:text-[#5f5b54] data-disabled:shadow-none",
        outline:
          "border-border/80 bg-card/70 text-foreground shadow-[0_1px_2px_rgb(42_38_30_/_3%)] hover:border-foreground/15 hover:bg-card",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_4%)]",
        ghost: "text-foreground hover:bg-muted/80",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:border-destructive/30 focus-visible:ring-destructive/15",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-7 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-3.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };