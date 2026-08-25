// Kept in sync with web/src/lib/format.ts — some G2G category slugs
// abbreviate the brand oddly (e.g. Canva -> "cnva"), which a plain
// title-case would render as a typo.
const WORD_OVERRIDES: Record<string, string> = {
  cnva: 'Canva',
  ppq: 'PPQ',
  ai: 'AI',
};

/** "google-accounts" -> "Google Accounts", "cnva-accounts" -> "Canva Accounts" */
export function formatCategoryName(slug: string): string {
  return slug
    .split('-')
    .map((word) => WORD_OVERRIDES[word] ?? word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
