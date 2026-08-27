// G2G's own category slugs sometimes abbreviate the brand oddly (e.g. Canva
// -> "cnva"), which a plain title-case would render as a typo. Override the
// display word only for known cases; everything else falls through to the
// generic formatter below.
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
