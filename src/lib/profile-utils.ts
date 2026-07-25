/**
 * Small, pure helper functions for rendering user/profile data
 * consistently across the app (avatars, greetings, lists, etc).
 */

/**
 * Derives up to 2 initials from a full name, e.g. "Arjun Sharma" -> "AS".
 * Falls back to the first letter of an email, or "U" for "User".
 */
export function getInitials(name?: string | null, fallbackEmail?: string | null): string {
  const source = name?.trim();

  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    const initials = parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
    if (initials) return initials;
  }

  if (fallbackEmail) {
    return fallbackEmail[0]?.toUpperCase() ?? "U";
  }

  return "U";
}

/** Returns just the first name, e.g. "Arjun Sharma" -> "Arjun". */
export function getFirstName(name?: string | null, fallback = "there"): string {
  const source = name?.trim();
  if (!source) return fallback;
  return source.split(/\s+/)[0];
}

/** Joins an array of strings for display, with a fallback when empty/missing. */
export function formatList(list?: string[] | null, fallback = "Not set yet"): string {
  if (!list || list.length === 0) return fallback;
  return list.join(", ");
}
