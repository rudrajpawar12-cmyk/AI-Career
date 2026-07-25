import { useRef, useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { validateResumeFile } from "@/lib/resume-parser";

interface ResumeUploadProps {
  onUpload: (file: File) => Promise<void>;
  onError?: (message: string) => void;
}

export default function ResumeUpload({
  onUpload,
  onError,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const reportError = (message: string) => {
    if (onError) {
      onError(message);
    } else {
      alert(message);
    }
  };

  const uploadFile = async (file: File) => {
    const validationError = validateResumeFile(file);
    if (validationError) {
      reportError(validationError);
      return;
    }

    try {
      setUploading(true);

      await onUpload(file);

      setUploadedFile(file);
    } catch (err) {
      console.error(err);
      reportError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);

        const file = e.dataTransfer.files[0];

        if (file) uploadFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-3xl border-2 border-dashed p-12 transition-all duration-300
      ${
        dragging
          ? "border-primary bg-primary/10"
          : "border-white/10 bg-card hover:border-primary/40"
      }`}
    >
      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => {
          if (e.target.files?.length) {
            uploadFile(e.target.files[0]);
          }
        }}
      />

      <div className="flex flex-col items-center gap-5 text-center">

        {uploading ? (
          <Loader2 className="w-14 h-14 animate-spin text-primary" />
        ) : uploadedFile ? (
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        ) : (
          <Upload className="w-14 h-14 text-primary" />
        )}

        <div>
          <h2 className="text-xl font-semibold">
            {uploadedFile
              ? "Resume Uploaded Successfully"
              : "Upload Your Resume"}
          </h2>

          <p className="text-sm text-muted-foreground mt-2">
            Drag & Drop your PDF or DOCX here
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            Maximum size: 5 MB
          </p>
        </div>

        {uploadedFile && (
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">{uploadedFile.name}</span>
          </div>
        )}

      </div>
    </motion.div>
  );
}