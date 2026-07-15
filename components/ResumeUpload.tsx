"use client";

import { useCallback, useRef, useState } from "react";
import { parseResumeFile } from "@/lib/resumeParser";
import type { ResumeProfile } from "@/types";

export default function ResumeUpload({
  onProfileReady,
}: {
  onProfileReady: (profile: ResumeProfile) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);
      setFileName(file.name);
      try {
        const profile = await parseResumeFile(file);
        onProfileReady(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong reading that file.");
      } finally {
        setLoading(false);
      }
    },
    [onProfileReady]
  );

  return (
    <div className="mx-auto w-full max-w-xl animate-rise">
      <div className="mb-6 text-center">
        <p className="font-display text-xl font-medium text-paper">Drop your resume to begin</p>
        <p className="mt-2 text-sm text-paper/50">
          Parsed right here in your browser tab — never uploaded to a server.
        </p>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`glass-panel flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-300 ${
          dragging
            ? "border-amber shadow-[0_0_0_1px_rgba(201,166,107,0.4),0_30px_60px_-20px_rgba(201,166,107,0.25)] scale-[1.01]"
            : "border-slate/40 hover:border-slate/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber/15 text-amber shadow-[0_0_30px_-6px_rgba(201,166,107,0.5)] transition-transform duration-300 ${
            dragging ? "scale-110" : ""
          } ${loading ? "animate-pulseRec" : ""}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4M12 4L7 9M12 4l5 5M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {loading ? (
          <p className="font-mono text-sm text-paper/70">Reading {fileName}…</p>
        ) : (
          <>
            <p className="font-medium text-paper">
              Drop your resume here, or{" "}
              <span className="text-amber underline underline-offset-4 decoration-amber/40">
                browse files
              </span>
            </p>
            <p className="mt-2 font-mono text-xs text-paper/40">PDF · DOCX · TXT</p>
          </>
        )}
      </label>

      {error && (
        <p className="mt-4 rounded-lg border border-onair/30 bg-onair/10 px-4 py-3 text-sm text-onair animate-rise">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center gap-3 text-xs text-paper/40">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate/40 to-slate/40" />
        <span className="font-mono uppercase tracking-wide">runs fully in your browser</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-slate/40 to-slate/40" />
      </div>
    </div>
  );
}
