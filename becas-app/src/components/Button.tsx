import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  isLoading?: boolean;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
  outline: "bg-transparent border-2 border-gray-200 text-gray-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-base rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = "primary", 
    size = "md", 
    href, 
    isLoading, 
    fullWidth,
    className = "",
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`;

    if (href && !disabled) {
      return (
        <Link href={href} className={classes}>
          {isLoading && <LoadingSpinner />}
          {children}
        </Link>
      );
    }

    return (
      <button 
        ref={ref} 
        className={classes} 
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

function LoadingSpinner() {
  return (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
}

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
