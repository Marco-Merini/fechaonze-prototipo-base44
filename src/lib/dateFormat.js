// Formata uma data (YYYY-MM-DD ou ISO) para "1 de janeiro de 2026"
export function formatLongDate(dateStr) {
  if (!dateStr) return "";
  const d = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T12:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

// Formata com dia da semana: "quarta-feira, 1 de janeiro de 2026"
export function formatLongDateWithWeekday(dateStr) {
  if (!dateStr) return "";
  const d = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T12:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}