// Supabase Edge Function: resume-analyzer
//
// 1. Authenticates the caller from their Supabase session JWT.
// 2. Verifies the referenced `resumes` row belongs to that user.
// 3. Sends the extracted resume text to Groq for AI analysis.
// 4. Validates/normalizes the AI's JSON response.
// 5. Persists the result to `resume_analyses` and returns it.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GROQ_MODEL = "openai/gpt-oss-120b";
const MIN_RESUME_TEXT_LENGTH = 50;
const MAX_RESUME_TEXT_LENGTH = 20000;

interface RawAnalysis {
  ats_score?: unknown;
  clarity_score?: unknown;
  keyword_score?: unknown;
  impact_score?: unknown;
  strengths?: unknown;
  weaknesses?: unknown;
  missing_skills?: unknown;
  suggestions?: unknown;
}

interface NormalizedAnalysis {
  ats_score: number;
  clarity_score: number;
  keyword_score: number;
  impact_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  suggestions: string[];
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clampScore(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function toStringArray(value: unknown, maxItems = 12): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const trimmed = entry.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    result.push(trimmed);
    if (result.length >= maxItems) break;
  }

  return result;
}

/**
 * Validates and normalizes the raw AI output into a strict, safe shape.
 * Throws only when the payload is fundamentally unusable (e.g. not an
 * object, or missing every expected numeric field) — partial results are
 * still accepted and cleaned up rather than discarded.
 */
function normalizeAnalysis(raw: unknown): NormalizedAnalysis {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("AI returned an unexpected response format.");
  }

  const data = raw as RawAnalysis;

  const hasAnyScore = [
    data.ats_score,
    data.clarity_score,
    data.keyword_score,
    data.impact_score,
  ].some((v) => typeof v === "number" || typeof v === "string");

  if (!hasAnyScore) {
    throw new Error("AI response did not include any recognizable scores.");
  }

  return {
    ats_score: clampScore(data.ats_score),
    clarity_score: clampScore(data.clarity_score),
    keyword_score: clampScore(data.keyword_score),
    impact_score: clampScore(data.impact_score),
    strengths: toStringArray(data.strengths),
    weaknesses: toStringArray(data.weaknesses),
    missing_skills: toStringArray(data.missing_skills),
    suggestions: toStringArray(data.suggestions),
  };
}

/** Extracts the first top-level JSON object from a string, tolerating
 *  stray whitespace or accidental markdown code fences around it. */
function parseJsonLoosely(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI returned malformed JSON structure.");
    return JSON.parse(match[0]);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed." }, 405);
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase environment variables are not configured.");
    }
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in environment variables.");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(
        { success: false, error: "Missing Authorization header." },
        401
      );
    }

    // User-scoped client: every query through this client is subject to
    // Postgres RLS as the authenticated caller, so ownership is enforced
    // by the database itself, not just application logic.
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse(
        { success: false, error: "Invalid or expired session. Please sign in again." },
        401
      );
    }

    let body: { resumeText?: unknown; resumeId?: unknown };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ success: false, error: "Invalid JSON body." }, 400);
    }

    const resumeText = typeof body.resumeText === "string" ? body.resumeText.trim() : "";
    const resumeId = typeof body.resumeId === "string" ? body.resumeId : null;

    if (!resumeText) {
      return jsonResponse({ success: false, error: "Resume text is missing." }, 400);
    }
    if (resumeText.length < MIN_RESUME_TEXT_LENGTH) {
      return jsonResponse(
        { success: false, error: "Resume text is too short to analyze." },
        400
      );
    }
    if (!resumeId) {
      return jsonResponse({ success: false, error: "resumeId is required." }, 400);
    }

    const truncatedText =
      resumeText.length > MAX_RESUME_TEXT_LENGTH
        ? resumeText.slice(0, MAX_RESUME_TEXT_LENGTH)
        : resumeText;

    // Confirm the resume exists and belongs to this user (RLS-enforced).
    const { data: resumeRow, error: resumeError } = await supabase
      .from("resumes")
      .select("id, file_name, user_id")
      .eq("id", resumeId)
      .maybeSingle();

    if (resumeError) {
      throw new Error(`Failed to look up resume: ${resumeError.message}`);
    }
    if (!resumeRow) {
      return jsonResponse(
        { success: false, error: "Resume not found for this account." },
        404
      );
    }

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.2,
          max_completion_tokens: 2048,
          reasoning_effort: "low",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are an expert ATS (Applicant Tracking System) resume analyzer with deep experience in technical and non-technical recruiting. " +
                "Evaluate the resume text you are given and respond with ONLY a single valid JSON object — no markdown, no commentary, no code fences. " +
                "The JSON must match exactly this schema:\n" +
                "{\n" +
                '  "ats_score": number (0-100, how well the resume would parse in an ATS),\n' +
                '  "clarity_score": number (0-100, formatting and readability),\n' +
                '  "keyword_score": number (0-100, relevant industry/role keyword coverage),\n' +
                '  "impact_score": number (0-100, use of quantified achievements and strong action verbs),\n' +
                '  "strengths": string[] (3-6 concise, specific strengths),\n' +
                '  "weaknesses": string[] (3-6 concise, specific weaknesses),\n' +
                '  "missing_skills": string[] (skills or keywords commonly expected for this resume\'s apparent target role that are absent),\n' +
                '  "suggestions": string[] (4-8 concrete, actionable improvements)\n' +
                "}\n" +
                "Base every score and observation strictly on the resume text provided. Do not invent facts not implied by the text.",
            },
            {
              role: "user",
              content: `Analyze the following resume and return the JSON evaluation:\n\n${truncatedText}`,
            },
          ],
        }),
      }
    );

    const groqData = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq API error:", JSON.stringify(groqData));
      const groqMessage =
        typeof groqData?.error?.message === "string"
          ? groqData.error.message
          : "Failed to reach the AI analysis service.";
      throw new Error(groqMessage);
    }

    const rawContent = groqData.choices?.[0]?.message?.content;
    if (!rawContent || typeof rawContent !== "string") {
      throw new Error("Empty response received from the AI model.");
    }

    const parsed = parseJsonLoosely(rawContent);
    const analysis = normalizeAnalysis(parsed);

    const { data: savedAnalysis, error: insertError } = await supabase
  .from("resume_analysis")
  .insert({
    user_id: user.id,
    resume_id: resumeRow.id,
    ats_score: analysis.ats_score,
    clarity_score: analysis.clarity_score,
    keyword_score: analysis.keyword_score,
    impact_score: analysis.impact_score,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    missing_skills: analysis.missing_skills,
    suggestions: analysis.suggestions,
  })
  .select()
  .single();

    if (insertError) {
      throw new Error(`Failed to save analysis: ${insertError.message}`);
    }

    return jsonResponse({ success: true, analysis: savedAnalysis });
  } catch (err) {
    console.error("resume-analyzer Edge Function error:", err);
    return jsonResponse(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred.",
      },
      500
    );
  }
});
