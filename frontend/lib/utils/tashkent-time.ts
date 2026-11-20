/**
 * Tashkent Timezone (Asia/Tashkent, UTC+5) Formatting Utilities
 */

export function formatTashkentDate(
  date: Date | string | null | undefined
): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export function formatTashkentDateTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "N/A";

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return `${formatted} (Tashkent Time)`;
}
