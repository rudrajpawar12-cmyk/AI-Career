import { supabase } from "@/lib/supabase";

/**
 * Shape of the data collected by the onboarding wizard (src/pages/onboarding.tsx).
 * Keys here are camelCase form-state names; saveProfile() maps them onto the
 * real `profiles` table columns below.
 */
export interface OnboardingFormData {
  name: string;
  college: string;
  degree: string;
  gradYear: string;
  targetRole: string;
  githubUser: string;
  /** Flat list of skill "chips" selected in the UI (mixed categories). */
  skills: string[];
  /** Free-text comma-separated extra skills from the "Add other skills" input. */
  otherSkills?: string;
}

// Buckets the flat suggestion-chip list into the schema's per-category
// skill columns (skills_languages / skills_frameworks / skills_databases /
// skills_tools / skills_other) without requiring any UI changes.
const SKILL_CATEGORY_MAP: Record<
  string,
  "languages" | "frameworks" | "databases" | "tools" | "other"
> = {
  Python: "languages",
  Java: "languages",
  "C++": "languages",
  React: "frameworks",
  "Node.js": "frameworks",
  SQL: "databases",
  AWS: "tools",
  Docker: "tools",
  Figma: "tools",
  "Machine Learning": "other",
  "System Design": "other",
};

function bucketSkills(skills: string[]) {
  const buckets = {
    languages: [] as string[],
    frameworks: [] as string[],
    databases: [] as string[],
    tools: [] as string[],
    other: [] as string[],
  };

  for (const skill of skills) {
    const category = SKILL_CATEGORY_MAP[skill] ?? "other";
    buckets[category].push(skill);
  }

  return buckets;
}

export const profileService = {
  async saveProfile(data: OnboardingFormData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not found");

    const buckets = bucketSkills(data.skills);

    const otherSkillsFromInput = (data.otherSkills ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const githubUsername = data.githubUser?.trim() || null;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: data.name || null,
        college: data.college || null,
        degree: data.degree || null,
        graduation_year: data.gradYear ? Number(data.gradYear) : null,
        target_role: data.targetRole || null,
        github_username: githubUsername,
        github_url: githubUsername
          ? `https://github.com/${githubUsername}`
          : null,
        skills_languages: buckets.languages,
        skills_frameworks: buckets.frameworks,
        skills_databases: buckets.databases,
        skills_tools: buckets.tools,
        skills_other: [...buckets.other, ...otherSkillsFromInput],
        onboarding_completed: true,
      });

    if (error) throw error;
  },
};
