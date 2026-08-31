// Shared by the request/assignment list screens so every date reads the same.
// Extracted during R4 rather than copying the same helper into a third and
// fourth page.
export function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
