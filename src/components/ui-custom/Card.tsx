
import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glass?: boolean;
  hover?: boolean;
  border?: boolean;
  padding?: "none" | "small" | "medium" | "large";
  variant?: "default" | "dark" | "black";
}

const paddingMap = {
  none: "p-0",
  small: "p-3",
  medium: "p-5",
  large: "p-8",
};

const Card = ({
  children,
  className,
  glass = false,
  hover = false,
  border = true,
  padding = "medium",
  variant = "default",
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl shadow-sm transition-all duration-300",
        // Default variant - white in light mode, dark gray in dark mode
        variant === "default" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white" : "",
        // Dark variant - white in light mode, darker in dark mode
        variant === "dark" ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white" : "",
        // Black variant
        variant === "black" ? "bg-black text-white" : "",
        // Border styles
        border && variant === "default" && "border border-slate-200 dark:border-slate-800",
        border && variant === "dark" && "border border-slate-200 dark:border-slate-800",
        border && variant === "black" && "border border-gray-800",
        // Glass effect
        glass && "glassmorphism backdrop-blur-md border-white/10 dark:border-slate-800/50",
        // Hover effect
        hover && "hover:shadow-lg hover:-translate-y-1",
        // Padding
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
