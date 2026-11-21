// Utilities are small, framework-independent helper functions.
export function formatDate(date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}
