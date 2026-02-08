import { HTMLAttributes, forwardRef } from "react";

type TitleSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type TitleAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

type TitleProps = {
  size?: TitleSize;
  as?: TitleAs;
  gradient?: boolean;
  muted?: boolean;
} & HTMLAttributes<HTMLHeadingElement>;

const sizes: Record<TitleSize, string> = {
  xs: "text-sm font-semibold",
  sm: "text-base font-semibold",
  md: "text-lg font-bold",
  lg: "text-xl sm:text-2xl font-bold",
  xl: "text-2xl sm:text-3xl font-bold",
  "2xl": "text-3xl sm:text-4xl font-bold",
};

const Title = forwardRef<HTMLHeadingElement, TitleProps>(
  ({ 
    size = "lg", 
    as: Component = "h2",
    gradient = false,
    muted = false,
    className = "",
    children, 
    ...props 
  }, ref) => {
    let colorStyles = "text-gray-900";
    
    if (gradient) {
      colorStyles = "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent";
    } else if (muted) {
      colorStyles = "text-gray-500";
    }
    
    const classes = `${sizes[size]} ${colorStyles} ${className}`;

    return (
      <Component ref={ref as never} className={classes} {...props}>
        {children}
      </Component>
    );
  }
);

Title.displayName = "Title";

// Subtitle for secondary text
function Subtitle({ className = "", children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-gray-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

// Section header with title and optional subtitle
function SectionHeader({ 
  title, 
  subtitle,
  size = "lg",
  className = "",
  children,
  ...props 
}: { 
  title: string; 
  subtitle?: string;
  size?: TitleSize;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`} {...props}>
      <div>
        <Title size={size}>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </div>
      {children}
    </div>
  );
}

export { Title, Subtitle, SectionHeader };
export type { TitleProps, TitleSize, TitleAs };
