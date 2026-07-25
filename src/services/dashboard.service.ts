import { supabase } from "@/lib/supabase";

export interface DashboardStats {
  resumeScore: number;
  githubScore: number;
  profileCompletion: number;
  readinessScore: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      resumeScore: 0,
      githubScore: 0,
      profileCompletion: 0,
      readinessScore: 0,
    };
  }

  // Latest Resume Analysis
  const { data: resume } = await supabase
    .from("resume_analysis")
    .select("ats_score")
    .eq("user_id", user.id)
    .order("analyzed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const resumeScore = resume?.ats_score ?? 0;

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let profileCompletion = 0;

  if (profile?.full_name) profileCompletion += 10;
  if (profile?.college) profileCompletion += 10;
  if (profile?.degree) profileCompletion += 10;
  if (profile?.graduation_year) profileCompletion += 10;
  if (profile?.target_role) profileCompletion += 10;
  if (profile?.github_username) profileCompletion += 10;
  if (profile?.linkedin_url) profileCompletion += 10;
  if (profile?.portfolio_url) profileCompletion += 10;
  if (profile?.resume_url) profileCompletion += 10;
  if (profile?.avatar_url) profileCompletion += 10;

  // Placeholder until we wire GitHub score
  const githubScore = 75;

  const readinessScore = Math.round(
    resumeScore * 0.5 +
    githubScore * 0.3 +
    profileCompletion * 0.2
  );

  return {
    resumeScore,
    githubScore,
    profileCompletion,
    readinessScore,
  };
}