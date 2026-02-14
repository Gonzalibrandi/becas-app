type DeadlineStatus = {
  label: string;
  color: "red" | "orange" | "amber" | "gray";
  urgent: boolean;
  expired: boolean;
};

export function getDeadlineStatus(deadline: Date | string | null): DeadlineStatus {
  if (!deadline) {
    return { label: "Sin fecha", color: "gray", urgent: false, expired: false };
  }

  const date = typeof deadline === "string" ? new Date(deadline) : deadline;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { label: "Vencida", color: "red", urgent: false, expired: true };
  }

  if (days === 0) {
    return { label: "Vence hoy", color: "red", urgent: true, expired: false };
  }

  if (days <= 7) {
    return {
      label: `Vence en ${days} día${days !== 1 ? "s" : ""}`,
      color: "orange",
      urgent: true,
      expired: false,
    };
  }

  if (days <= 30) {
    return {
      label: `Vence en ${days} días`,
      color: "amber",
      urgent: false,
      expired: false,
    };
  }

  return { label: "", color: "gray", urgent: false, expired: false };
}

const DEADLINE_STYLES: Record<DeadlineStatus["color"], string> = {
  red: "bg-red-100 text-red-700 border-red-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  gray: "bg-gray-100 text-gray-500 border-gray-200",
};

export function getDeadlineStyle(color: DeadlineStatus["color"]): string {
  return DEADLINE_STYLES[color];
}
