import { jsPDF } from "jspdf";
import type { ResumeAnalysis } from "@/types/resume";

const MARGIN = 48;
const PAGE_WIDTH = 595.28; // A4 width in pt
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addSection(
  doc: jsPDF,
  cursorY: number,
  title: string,
  items: string[],
  bulletColor: [number, number, number]
): number {
  let y = cursorY;

  if (items.length === 0) return y;

  if (y > 760) {
    doc.addPage();
    y = MARGIN;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text(title, MARGIN, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);

  for (const item of items) {
    const lines = doc.splitTextToSize(item, CONTENT_WIDTH - 16);

    if (y + lines.length * 14 > 780) {
      doc.addPage();
      y = MARGIN;
    }

    doc.setTextColor(...bulletColor);
    doc.text("•", MARGIN, y);
    doc.setTextColor(50, 50, 50);
    doc.text(lines, MARGIN + 14, y);
    y += lines.length * 14 + 6;
  }

  return y + 10;
}

export function exportAnalysisToPdf(
  analysis: ResumeAnalysis,
  fileName: string
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  let y = MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text("Resume Analysis Report", MARGIN, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text(`Source file: ${fileName}`, MARGIN, y);
  y += 14;
  doc.text(`Generated: ${new Date().toLocaleString()}`, MARGIN, y);
  y += 30;

  const scores: Array<[string, number]> = [
    ["ATS Match", analysis.ats_score],
    ["Clarity & Formatting", analysis.clarity_score],
    ["Keyword Optimization", analysis.keyword_score],
    ["Action & Impact", analysis.impact_score],
  ];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("Score Breakdown", MARGIN, y);
  y += 20;

  const colWidth = CONTENT_WIDTH / 2;
  scores.forEach(([label, score], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * colWidth;
    const rowY = y + row * 34;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(70, 70, 70);
    doc.text(label, x, rowY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(`${Math.round(score)}/100`, x, rowY + 16);
  });

  y += Math.ceil(scores.length / 2) * 34 + 20;

  y = addSection(doc, y, "Strengths", analysis.strengths, [34, 139, 34]);
  y = addSection(doc, y, "Weaknesses", analysis.weaknesses, [196, 90, 20]);
  y = addSection(doc, y, "Missing Skills", analysis.missing_skills, [178, 34, 52]);
  y = addSection(doc, y, "AI Suggestions", analysis.suggestions, [37, 99, 235]);

  const safeName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9-_]+/gi, "_");
  doc.save(`${safeName || "resume"}-analysis.pdf`);
}
