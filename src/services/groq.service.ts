import { supabase } from "@/lib/supabase";
import type { ResumeAnalysisRecord } from "@/types/resume";

interface AnalyzeResumeResponse {
  success: boolean;
  analysis?: ResumeAnalysisRecord;
  error?: string;
}

/**
 * Sends extracted resume text to the `resume-analyzer` Edge Function, which
 * calls Groq for the AI evaluation and persists the result to the
 * `resume_analyses` table. Returns the saved analysis record.
 */
export async function analyzeResume(
  resumeText: string,
  resumeId: string
): Promise<ResumeAnalysisRecord> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("You must be signed in to analyze a resume.");
  }

  const { data, error } = await supabase.functions.invoke<AnalyzeResumeResponse>(
    "resume-analyzer",
    {
      body: { resumeText, resumeId },
    }
  );

  if (error) {
    console.error("resume-analyzer function error:", error);

    // supabase-js FunctionsHttpError exposes the raw response body, which
    // contains the actual error message returned by our Edge Function.
    let serverMessage: string | null = null;

    if ("context" in error && error.context instanceof Response) {
      try {
        const body = await error.context.clone().json();
        if (typeof body?.error === "string") serverMessage = body.error;
      } catch {
        // Response body wasn't JSON (e.g. network-level failure); ignore.
      }
    }

    throw new Error(
      serverMessage ??
        "AI analysis failed. Please check your connection and try again."
    );
  }

  if (!data?.success || !data.analysis) {
    throw new Error(data?.error || "AI analysis failed.");
  }

  return data.analysis;
}
