import { escapeRegex } from "./escape-regex";

/** Mongo $or across fields. `exact` anchors to start-of-string instead of substring. */
export function buildSearchOr(fields: string[], search: string, exact = false) {
  const term = escapeRegex(search.trim());
  if (!term) return undefined;
  const pattern = exact ? `^${term}` : term;
  return fields.map((f) => ({ [f]: { $regex: pattern, $options: "i" } }));
}
