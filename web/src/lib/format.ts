/** "google-accounts" -> "Google Accounts", "canva-accounts" -> "Canva Accounts" */
export function formatCategoryName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
