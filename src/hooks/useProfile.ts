import { useProfileContext } from "@/contexts/ProfileContext";

/**
 * Access the current user's profile (from the `profiles` table).
 * Data is fetched once by ProfileProvider and shared across the app,
 * so calling this in multiple components does not trigger extra requests.
 */
export function useProfile() {
  return useProfileContext();
}
