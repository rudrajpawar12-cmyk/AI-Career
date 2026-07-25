import { supabase } from "@/lib/supabase";
import type { ResumeAnalysisRecord, ResumeRecord } from "@/types/resume";

const RESUME_BUCKET = "resumes";

/**
 * Given a Supabase Storage public URL for the `resumes` bucket, derive the
 * object path within the bucket (e.g. "userId/169..._resume.pdf").
 * We only persist `file_url` on the `resumes` row (existing schema), so this
 * lets us re-download the original file later (for re-analysis) without any
 * schema changes.
 */
function getStoragePathFromPublicUrl(url: string): string {
  const marker = `/object/public/${RESUME_BUCKET}/`;
  const index = url.indexOf(marker);

  if (index === -1) {
    throw new Error("Could not resolve the storage location for this resume.");
  }

  return decodeURIComponent(url.slice(index + marker.length));
}

export const resumeService = {
  /**
   * Uploads a resume file to Supabase Storage and creates its DB record.
   */
  async uploadResume(file: File): Promise<ResumeRecord> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("You must be signed in to upload a resume.");

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      throw new Error(`Failed to upload resume: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(RESUME_BUCKET)
      .getPublicUrl(filePath);

    const { data: resume, error: insertError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
      })
      .select()
      .single();

    if (insertError) {
      // Best-effort cleanup so we don't leave an orphaned file in Storage.
      await supabase.storage.from(RESUME_BUCKET).remove([filePath]);
      throw new Error(`Failed to save resume record: ${insertError.message}`);
    }

    return resume as ResumeRecord;
  },

  /**
   * Re-downloads the original resume file from Storage, for re-analysis of
   * a resume that isn't currently in memory (e.g. after a page reload).
   */
  async downloadResumeFile(resume: ResumeRecord): Promise<File> {
    const path = getStoragePathFromPublicUrl(resume.file_url);

    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .download(path);

    if (error || !data) {
      throw new Error(
        `Could not download "${resume.file_name}" from storage: ${
          error?.message ?? "unknown error"
        }`
      );
    }

    return new File([data], resume.file_name, {
      type: data.type || "application/octet-stream",
    });
  },

  /** Fetches a single resume by id (used to re-download a file for re-analysis). */
  async getResumeById(resumeId: string): Promise<ResumeRecord | null> {
    const { data, error } = await supabase
      .from("resumes")
      .select()
      .eq("id", resumeId)
      .maybeSingle();

    if (error) throw error;

    return (data as ResumeRecord) ?? null;
  },

  /** Fetches the current user's full resume analysis history, newest first. */
  async getAnalysisHistory(limit = 25): Promise<ResumeAnalysisRecord[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
  .from("resume_analysis")
  .select()
  .eq("user_id", user.id)
  .order("analyzed_at", { ascending: false })
  .limit(limit);

    if (error) throw error;

    return (data ?? []) as ResumeAnalysisRecord[];
  },
};
