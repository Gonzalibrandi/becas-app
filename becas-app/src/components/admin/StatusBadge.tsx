type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    DRAFT: "bg-amber-100 text-amber-800 border-amber-200",
    REVIEW: "bg-blue-100 text-blue-800 border-blue-200",
    PUBLISHED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ARCHIVED: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const labels: Record<string, string> = {
    DRAFT: "Borrador",
    REVIEW: "En Revisión",
    PUBLISHED: "Publicada",
    ARCHIVED: "Archivada",
  };

  const icons: Record<string, string> = {
    DRAFT: "✏️",
    REVIEW: "👁️",
    PUBLISHED: "✅",
    ARCHIVED: "📦",
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border
      ${styles[status] || styles.DRAFT}
    `}>
      <span>{icons[status] || "📄"}</span>
      <span>{labels[status] || status}</span>
    </span>
  );
}
