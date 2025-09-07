
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button as ShadcnButton } from "@/components/ui/button";
import { ButtonProps as ShadcnButtonProps } from "@/components/ui/button";

interface ButtonProps extends ShadcnButtonProps {
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  gradient?: boolean;
  loading?: boolean;
  color?: "primary" | "green" | "red" | "gray";
}

const Button = ({
  className,
  children,
  variant = "default",
  size = "default",
  icon,
  iconPosition = "left",
  gradient = false,
  loading = false,
  color,
  disabled,
  ...props
}: ButtonProps) => {
  const isIconOnly = icon && !children;
  const gradientClassName = gradient 
    ? "bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 transition-all duration-300" 
    : "";
    
  let colorClassName = "";
  if (color === "green") {
    colorClassName = "bg-green-600 hover:bg-green-700 text-white";
  } else if (color === "red") {
    colorClassName = "bg-red-600 hover:bg-red-700 text-white";
  } else if (color === "gray") {
    colorClassName = "bg-slate-700 hover:bg-slate-800 text-white";
  }

  return (
    <ShadcnButton
      className={cn(
        "font-medium tracking-tight rounded-md shadow-sm transition-all duration-300",
        "active:scale-[0.98]",
        gradient && variant === "default" ? gradientClassName : "",
        color && variant === "default" ? colorClassName : "",
        isIconOnly && "flex items-center justify-center p-2",
        loading && "opacity-80 pointer-events-none",
        className
      )}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        icon && iconPosition === "left" && (
          <span className={cn("mr-2", isIconOnly ? "mr-0" : "")}>{icon}</span>
        )
      )}
      {children}
      {icon && iconPosition === "right" && !loading && <span className="ml-2">{icon}</span>}
    </ShadcnButton>
  );
};

export default Button;
