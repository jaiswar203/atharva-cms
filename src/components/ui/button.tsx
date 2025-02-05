import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { TailSpin, ThreeCircles, ThreeDots } from "react-loader-spinner"; // Default loader component

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LoadingProps {
  isLoading: boolean;
  size?: number;
  color?: string;
  width?: number;
  height?: number;
  loader?: "three-dots" | "three-cicles" | "tailspin"
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: LoadingProps;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const renderLoader = (loader: string, height: number, width: number, color: string, size: number) => {
      switch (loader) {
        case "three-dots":
          return <ThreeDots
            visible={true}
            height={height}
            width={width}
            color={color}
            radius={size} // Adjusted to keep the same ratio as default
            ariaLabel="three-dots-loading"
          />
        case "three-cicles":
          return <ThreeCircles
            visible={true}
            height={height}
            width={width}
            color={color}
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        case "tailspin":
          return <TailSpin
            visible={true}
            height={height}
            width={width}
            color={color}
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
          />

        default:
          return <ThreeDots
            visible={true}
            height={height}
            width={width}
            color={color}
            radius={size} // Adjusted to keep the same ratio as default
            ariaLabel="three-dots-loading"
          />
      }

    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >

        {loading?.isLoading ? (
          renderLoader(loading.loader || "tailspin", loading.height ?? 20, loading.width ?? 20, loading.color ?? "white", (loading.size ?? 20) / 4.44)
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button"

export { Button, buttonVariants }