import { HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "elevated" | "bordered" | "ghost";

type CardProps = {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const variants: Record<CardVariant, string> = {
  default: "bg-white rounded-2xl shadow-sm border border-gray-100",
  elevated: "bg-white rounded-2xl shadow-xl border border-gray-100",
  bordered: "bg-white rounded-2xl border-2 border-gray-200",
  ghost: "bg-gray-50/50 rounded-2xl",
};

const paddings: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = "default", 
    padding = "md",
    hover = false,
    className = "",
    children, 
    ...props 
  }, ref) => {
    const hoverStyles = hover ? "hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer" : "";
    const classes = `${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`;

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card subcomponents for structure
function CardHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`pb-4 border-b border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardContent({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`pt-4 border-t border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
export type { CardProps, CardVariant };
