import { supabase } from "@/lib/supabase";

export const authService = {
  // ==========================
  // Login
  // ==========================
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  },

  // ==========================
  // Signup
  // ==========================
  async signup(
    email: string,
    password: string,
    fullName: string
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Create the profile row up front so it exists even before the user
    // verifies their email and completes onboarding. `onboarding_completed`
    // is left false; ProfileContext will also self-heal (create a row) on
    // first login if this insert is ever skipped (e.g. Google OAuth).
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: data.user.id,
            full_name: fullName,
            onboarding_completed: false,
          },
          {
            onConflict: "id",
          }
        );

      if (profileError) {
        console.error(profileError);
      }
    }

    return data;
  },

  // ==========================
  // Google Login
  // ==========================
  //
  // Redirects back to /dashboard. Onboarding-vs-dashboard routing itself is
  // decided centrally by the ProtectedRoute logic in App.tsx (based on
  // profile.onboarding_completed), so Google login goes through the exact
  // same redirect decision as email/password login.
  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;

    return data;
  },

  // ==========================
  // Logout
  // ==========================
  async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

  // ==========================
  // Forgot Password
  // ==========================
  async forgotPassword(email: string) {
    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

    if (error) throw error;
  },

  // ==========================
  // Update Password
  // ==========================
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;

    return data;
  },

  // ==========================
  // Current User
  // ==========================
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return user;
  },

  // ==========================
  // Current Session
  // ==========================
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return session;
  },

  // ==========================
  // Current Profile
  // ==========================
  async getProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return data;
  },

  // ==========================
  // Update Profile
  // ==========================
  async updateProfile(profile: {
    full_name?: string;
    github_username?: string;
    college?: string;
    degree?: string;
    graduation_year?: number;
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("No authenticated user");

    const { data, error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
};