import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Shape of a row in the `profiles` table.
 * This MUST stay in sync with the actual Supabase schema:
 *
 * id, full_name, avatar_url, college, degree, graduation_year,
 * target_role, experience_level, github_username, github_url,
 * linkedin_url, portfolio_url, preferred_location, skills_languages,
 * skills_frameworks, skills_databases, skills_tools, skills_other,
 * resume_url, onboarding_completed, created_at, updated_at
 *
 * Optional fields are nullable because they may not be filled in
 * by every user (e.g. right after signup, before onboarding).
 */
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  college: string | null;
  degree: string | null;
  graduation_year: number | null;
  target_role: string | null;
  experience_level: string | null;
  github_username: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  preferred_location: string | null;
  skills_languages: string[] | null;
  skills_frameworks: string[] | null;
  skills_databases: string[] | null;
  skills_tools: string[] | null;
  skills_other: string[] | null;
  resume_url: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  /** Re-fetches the profile from Supabase (e.g. after an edit). */
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Postgres/PostgREST code returned when `.single()` finds no matching row.
const NO_ROWS_FOUND = "PGRST116";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        // No profile row exists yet (e.g. a brand-new Google OAuth sign-in
        // that never went through the manual signup insert). Create a
        // minimal row so onboarding routing has something to check against.
        if (error.code === NO_ROWS_FOUND) {
          const metadata = user.user_metadata ?? {};
          const fallbackName: string | null =
            metadata.full_name ?? metadata.name ?? null;
          const fallbackAvatar: string | null =
            metadata.avatar_url ?? metadata.picture ?? null;

          const { data: created, error: createError } = await supabase
            .from("profiles")
            .upsert(
              {
                id: user.id,
                full_name: fallbackName,
                avatar_url: fallbackAvatar,
                onboarding_completed: false,
              },
              { onConflict: "id" }
            )
            .select("*")
            .single();

          if (createError) throw createError;

          setProfile(created as Profile);
          return;
        }

        throw error;
      }

      setProfile(data as Profile);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch once per authenticated user (on login / user change).
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfileContext must be used inside ProfileProvider.");
  }

  return context;
}
