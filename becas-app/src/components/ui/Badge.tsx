import { HTMLAttributes, forwardRef } from "react";

type BadgeColor = "emerald" | "amber" | "blue" | "red" | "purple" | "gray";
type BadgeSize = "sm" | "md" | "lg";

type BadgeProps = {
  color?: BadgeColor;
  size?: BadgeSize;
  icon?: string;
} & HTMLAttributes<HTMLSpanElement>;

const colors: Record<BadgeColor, string> = {
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  red: "bg-red-100 text-red-700 border-red-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
};

const sizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    color = "gray", 
    size = "md",
    icon,
    className = "",
    children, 
    ...props 
  }, ref) => {
    const baseStyles = "inline-flex items-center gap-1 font-semibold rounded-lg border";
    const classes = `${baseStyles} ${colors[color]} ${sizes[size]} ${className}`;

    return (
      <span ref={ref} className={classes} {...props}>
        {icon && <span>{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// Predefined badges for common states
function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { color: BadgeColor; label: string }> = {
    DRAFT: { color: "amber", label: "Borrador" },
    REVIEW: { color: "blue", label: "Revisión" },
    PUBLISHED: { color: "emerald", label: "Publicada" },
    ARCHIVED: { color: "gray", label: "Archivada" },
  };
  
  const config = statusMap[status] || { color: "gray", label: status };
  return <Badge color={config.color}>{config.label}</Badge>;
}

function FundingBadge({ type }: { type: string }) {
  const fundingMap: Record<string, { color: BadgeColor; label: string; icon: string }> = {
    FULL: { color: "emerald", label: "Cobertura Total", icon: "💰" },
    PARTIAL: { color: "amber", label: "Parcial", icon: "💵" },
    ONE_TIME: { color: "blue", label: "Pago Único", icon: "💸" },
    UNKNOWN: { color: "gray", label: "Ver detalles", icon: "❔" },
  };
  
  const config = fundingMap[type] || fundingMap.UNKNOWN;
  return <Badge color={config.color} icon={config.icon}>{config.label}</Badge>;
}

export { Badge, StatusBadge, FundingBadge };
export type { BadgeProps, BadgeColor, BadgeSize };
