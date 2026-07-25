import * as pdfjsLib from "pdfjs-dist";
// Vite-native worker import: resolves to a hashed URL of the worker file
// at build time so pdf.js can parse PDFs off the main thread.
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/** MIME types accepted by the resume uploader. */
export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** Hard cap on characters sent to the AI model to stay within context limits. */
const MAX_EXTRACTED_CHARS = 15000;

/** Below this many characters of extracted text, we assume parsing failed
 *  (e.g. a scanned/image-only PDF with no embedded text layer). */
const MIN_EXTRACTED_CHARS = 50;

export class ResumeParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeParseError";
  }
}

type ResumeFileKind = "pdf" | "docx";

export function getResumeFileKind(file: File): ResumeFileKind | null {
  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return "docx";
  }

  return null;
}

export function validateResumeFile(file: File): string | null {
  if (!getResumeFileKind(file)) {
    return "Only PDF and DOCX files are supported.";
  }

  if (file.size === 0) {
    return "This file is empty.";
  }

  if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
    return "Maximum file size is 5MB.";
  }

  return null;
}

function isTextItem(item: unknown): item is { str: string } {
  return (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    typeof (item as { str: unknown }).str === "string"
  );
}

async function extractFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  try {
    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();

      const pageText = content.items
  .map((item) => ("str" in item ? item.str : ""))
  .join(" ");

      pageTexts.push(pageText);
    }

    return pageTexts.join("\n\n");
  } finally {
    await pdf.destroy();
  }
}

async function extractFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extracts plain text from an uploaded resume file (PDF or DOCX).
 * Throws a `ResumeParseError` with a user-safe message on any failure.
 */
export async function extractResumeText(file: File): Promise<string> {
  const validationError = validateResumeFile(file);
  if (validationError) {
    throw new ResumeParseError(validationError);
  }

  const kind = getResumeFileKind(file);
  if (!kind) {
    throw new ResumeParseError("Unsupported file type.");
  }

  let rawText: string;

  try {
    rawText =
      kind === "pdf" ? await extractFromPdf(file) : await extractFromDocx(file);
  } catch (err) {
    console.error("Resume text extraction failed:", err);
    throw new ResumeParseError(
      kind === "pdf"
        ? "Could not read this PDF. It may be corrupted, password-protected, or a scanned image without selectable text."
        : "Could not read this DOCX file. It may be corrupted or saved in an unsupported format."
    );
  }

  const normalized = rawText
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (normalized.length < MIN_EXTRACTED_CHARS) {
    throw new ResumeParseError(
      "We couldn't find enough readable text in this file. If it's a scanned image, please upload a text-based PDF or DOCX instead."
    );
  }

  return normalized.length > MAX_EXTRACTED_CHARS
    ? normalized.slice(0, MAX_EXTRACTED_CHARS)
    : normalized;
}
