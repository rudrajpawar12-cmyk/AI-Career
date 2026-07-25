export interface ResumeAnalysis {
  ats_score: number;
  clarity_score: number;
  keyword_score: number;
  impact_score: number;

  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  suggestions: string[];
}

export interface ResumeRecord {
  id: string;

  user_id: string;

  file_name: string;

  file_url: string;

  uploaded_at: string;
}

/**
 * A single AI analysis run, persisted in the `resume_analyses` table.
 * `resume_id` may be null if the source resume was later deleted; the
 * file name is denormalized onto the row so history always displays.
 */
export interface ResumeAnalysisRecord extends ResumeAnalysis {
  id: string;
  resume_id: string;
  user_id: string;
  analyzed_at: string;
}