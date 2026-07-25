import { AppLayout } from "@/components/layouts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  FileText, CheckCircle2, AlertTriangle,
  Download, Eye, Sparkles, Target, Zap,
  Loader2, History as HistoryIcon, RotateCcw, XCircle, Ban,
} from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import ResumeUpload from "@/components/resume/ResumeUpload";
import { resumeService } from "@/services/resume.service";
import { analyzeResume } from "@/services/groq.service";
import { extractResumeText } from "@/lib/resume-parser";
import { exportAnalysisToPdf } from "@/lib/export-analysis";
import type { ResumeAnalysisRecord } from "@/types/resume";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface CachedFile {
  resumeId: string;
  file: File;
}

function scoreLabel(score: number | undefined) {
  if (score === undefined) return "Upload Resume";
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  return "Needs Improvement";
}

export default function Resume() {
  const { toast } = useToast();

  const [analysis, setAnalysis] = useState<ResumeAnalysisRecord | null>(null);
  const [history, setHistory] = useState<ResumeAnalysisRecord[]>([]);
  const safeAnalysis = analysis
  ? {
      ...analysis,
      strengths: analysis.strengths ?? [],
      weaknesses: analysis.weaknesses ?? [],
      missing_skills: analysis.missing_skills ?? [],
      suggestions: analysis.suggestions ?? [],
    }
  : null;
  const [cachedFile, setCachedFile] = useState<CachedFile | null>(null);

  const [loading, setLoading] = useState(false);
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const records = await resumeService.getAnalysisHistory();
        if (cancelled) return;

        setHistory(records);
        if (records.length > 0) setAnalysis(records[0]);
      } catch (err) {
        console.error("Failed to load resume analysis history:", err);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpload = async (file: File) => {
    setLoading(true);

    try {
      const uploaded = await resumeService.uploadResume(file);
      const text = await extractResumeText(file);
      const result = await analyzeResume(text, uploaded.id);

      setAnalysis(result);
      setHistory((prev) => [result, ...prev]);
      setCachedFile({ resumeId: uploaded.id, file });

      toast({
        title: "Analysis complete",
        description: `"${file.name}" scored ${result.ats_score}/100 for ATS match.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Analysis failed",
        description:
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
      // Re-throw so ResumeUpload's own catch block resets its uploading state
      // and surfaces the same message via its inline error handling.
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async (target: ResumeAnalysisRecord | null) => {
    if (!target) {
      toast({
        title: "No resume to re-analyze",
        description: "Upload a resume first.",
        variant: "destructive",
      });
      return;
    }

    if (!target.resume_id) {
      toast({
        title: "Original file unavailable",
        description: "This resume was removed. Upload it again to re-analyze.",
        variant: "destructive",
      });
      return;
    }

    setReanalyzingId(target.id);

    try {
      let file: File;

      if (cachedFile && cachedFile.resumeId === target.resume_id) {
        file = cachedFile.file;
      } else {
        const resume = await resumeService.getResumeById(target.resume_id);
        if (!resume) {
          throw new Error("The original resume record could not be found.");
        }
        file = await resumeService.downloadResumeFile(resume);
        setCachedFile({ resumeId: resume.id, file });
      }

      const text = await extractResumeText(file);
      const result = await analyzeResume(text, target.resume_id);

      setAnalysis(result);
      setHistory((prev) => [result, ...prev]);

      toast({
        title: "Re-analysis complete",
        description: `Updated ATS score: ${result.ats_score}/100.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Re-analysis failed",
        description:
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReanalyzingId(null);
    }
  };

  const handleExport = () => {
    if (!analysis) {
      toast({
        title: "Nothing to export yet",
        description: "Upload and analyze a resume first.",
        variant: "destructive",
      });
      return;
    }

    try {
      exportAnalysisToPdf(analysis, analysis.resume_file_name);
    } catch (err) {
      console.error(err);
      toast({
        title: "Export failed",
        description: "Could not generate the PDF report.",
        variant: "destructive",
      });
    }
  };

  const busy = loading || reanalyzingId !== null;

  return (
    <AppLayout>
      <div className="space-y-8">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Resume Intelligence</h1>
            <p className="text-muted-foreground mt-1 text-sm">Optimize your resume for ATS and human recruiters.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={!analysis}
              className="h-10 px-4 bg-card border border-white/10 hover:bg-muted rounded-full text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={() => handleReanalyze(analysis)}
              disabled={!analysis || busy}
              className="h-10 px-4 bg-primary text-white rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 glow-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {reanalyzingId && reanalyzingId === analysis?.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Re-Analyze
            </button>
          </div>
        </div>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="bg-card/50 p-1 rounded-full mb-8">
            <TabsTrigger value="analysis" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Analysis</TabsTrigger>
            <TabsTrigger value="builder" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Live Builder</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <ResumeUpload
              onUpload={handleUpload}
              onError={(message) =>
                toast({ title: "Upload error", description: message, variant: "destructive" })
              }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Score Card */}
              <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-aurora opacity-10 pointer-events-none"></div>
                <h3 className="font-medium text-muted-foreground mb-6">Overall Score</h3>
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset={
                      283 -
                      (283 * (analysis?.ats_score ?? 0)) / 100
                    } className="text-primary drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold">{analysis?.ats_score ?? 0}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
                  {scoreLabel(analysis?.ats_score)}
                </p>
                {analysis && (
                  <p className="text-xs text-muted-foreground mt-3 truncate max-w-full">
                    {analysis.resume_file_name}
                  </p>
                )}
              </div>

              {/* Breakdown */}
              <div className="lg:col-span-2 glass-card rounded-3xl p-8">
                <h3 className="font-semibold text-lg mb-6">Score Breakdown</h3>
                <div className="space-y-6">
                  {[
                    { label: "ATS Match", score: analysis?.ats_score ?? 0, icon: Target, color: "bg-blue-500" },
                    { label: "Clarity & Formatting", score: analysis?.clarity_score ?? 0, icon: Eye, color: "bg-green-500" },
                    { label: "Action & Impact", score: analysis?.impact_score ?? 0, icon: Zap, color: "bg-orange-500" },
                    { label: "Keyword Optimization", score: analysis?.keyword_score ?? 0, icon: FileText, color: "bg-purple-500" },
                  ].map(metric => (
                    <div key={metric.label}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <metric.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{metric.label}</span>
                        </div>
                        <span className="text-sm font-bold">{metric.score}%</span>
                      </div>
                      <Progress value={metric.score} className="h-2" indicatorClassName={metric.color} />
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Suggestions */}
            <h3 className="text-xl font-bold mt-10 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Suggestions
            </h3>
            <div className="grid gap-4">
              {analysis && (safeAnalysis?.suggestions ?? []).length === 0 && (
  <p className="text-sm text-muted-foreground">
    No suggestions returned for this analysis.
  </p>
)}

              {(analysis?.suggestions ?? []).map((suggestion, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="p-5 rounded-2xl bg-card border border-white/5 flex gap-4 items-start"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed">{suggestion}</p>
                  </div>
                </motion.div>
              ))}

              {!analysis && (
                <p className="text-sm text-muted-foreground">
                  Upload a resume above to get AI-powered suggestions.
                </p>
              )}
            </div>

            {/* Strengths / Weaknesses / Missing Skills */}
            {analysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="glass-card rounded-3xl p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-4 h-4" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.length === 0 && (
                      <li className="text-sm text-muted-foreground">None identified.</li>
                    )}
                    {analysis.strengths.map((item, i) => (
                      <li key={i} className="text-sm leading-relaxed text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-orange-400">
                    <XCircle className="w-4 h-4" /> Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {analysis.weaknesses.length === 0 && (
                      <li className="text-sm text-muted-foreground">None identified.</li>
                    )}
                    {analysis.weaknesses.map((item, i) => (
                      <li key={i} className="text-sm leading-relaxed text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-400">
                    <Ban className="w-4 h-4" /> Missing Skills
                  </h4>
                  {analysis.missing_skills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">None identified.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs font-medium px-3 py-1 rounded-full bg-red-400/10 text-red-400 border border-red-400/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis History */}
            <div className="mt-10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-primary" /> Analysis History
              </h3>

              {historyLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading history...
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your past analyses will appear here once you upload a resume.
                </p>
              ) : (
                <div className="grid gap-3">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className={`p-4 rounded-2xl bg-card border flex items-center justify-between gap-4 transition-colors ${
                        analysis?.id === record.id ? "border-primary/50" : "border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{record.resume_file_name}</p>
                          <p className="text-xs text-muted-foreground">
                           {record.analyzed_at
  ? format(new Date(record.analyzed_at), "MMM d, yyyy • h:mm a")
  : "Unknown date"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-bold">{record.ats_score}<span className="text-muted-foreground text-xs">/100</span></span>
                        <button
                          onClick={() => setAnalysis(record)}
                          className="h-8 px-3 text-xs font-medium rounded-full bg-muted hover:bg-muted/70 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleReanalyze(record)}
                          disabled={!record.resume_id || busy}
                          title={
                            record.resume_id
                              ? "Re-analyze this resume"
                              : "Original file no longer available"
                          }
                          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {reanalyzingId === record.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="builder">
            <div className="h-[600px] flex items-center justify-center glass-card rounded-3xl border border-dashed border-white/20">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Builder UI Workspace</h3>
                <p className="text-sm text-muted-foreground">Form on the left, live preview on the right.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[1/1.4] bg-card rounded-2xl border border-white/10 hover:border-primary/50 transition-colors p-4 relative group cursor-pointer">
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-sm z-10">
                    <button className="px-6 py-2 bg-primary text-white rounded-full font-medium shadow-lg">Use Template</button>
                  </div>
                  <div className="w-full h-full bg-background border border-white/5 shadow-sm p-4 space-y-4 rounded overflow-hidden opacity-50">
                    <div className="h-6 bg-muted w-1/2 mx-auto rounded"></div>
                    <div className="h-2 bg-muted w-1/3 mx-auto rounded"></div>
                    <div className="space-y-2 pt-4">
                      <div className="h-3 bg-muted w-full rounded"></div>
                      <div className="h-3 bg-muted w-5/6 rounded"></div>
                      <div className="h-3 bg-muted w-full rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  );
}
