export const SLUG_MAX_LENGTH = 100;
// Unicode-aware: works for non-Latin scripts (Bengali included), not just ASCII.
export const SLUG_PATTERN = /^[\p{L}\p{M}\p{N}]+(?:-[\p{L}\p{M}\p{N}]+)*$/u;

function format(text: string, trimEdges: boolean): string {
  let out = text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .slice(0, SLUG_MAX_LENGTH);
  if (trimEdges) out = out.replace(/^-+|-+$/g, "");
  return out;
}

/** From a title, for the initial value. */
export const generateSlug = (title: string) => format(title, true);
/** While the user is typing — keeps a trailing hyphen so they can keep going. */
export const sanitizeSlugInput = (input: string) => format(input, false);
/** On blur, on paste, and ALWAYS again on the server. */
export const normalizeSlug = (input: string) => format(input, true);
export const isValidSlug = (s: string) => SLUG_PATTERN.test(s);
/** Route params arrive percent-encoded. */
export const resolveSlugParam = (p: string) => normalizeSlug(decodeURIComponent(p));
