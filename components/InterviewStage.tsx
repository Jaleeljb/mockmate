"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnswerRecord, InterviewQuestion, ResumeProfile } from "@/types";
import Timer from "./Timer";
import Waveform from "./Waveform";
import ProgressRail from "./ProgressRail";
import {
  cancelSpeech,
  countFillerWords,
  countWords,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speak,
  startRecognition,
  type RecognitionHandle,
} from "@/lib/speechUtils";
import { MIN_INTERVIEW_SECONDS } from "@/lib/interviewEngine";
import { CLOSING_POOL, OPENING_POOL } from "@/lib/questionBank";
import { getNextQuestion } from "@/lib/realtimeEngine";

type StagePhase = "speaking" | "listening" | "paused";

export default function InterviewStage({
  profile,
  initialPlan,
  onComplete,
}: {
  profile: ResumeProfile;
  initialPlan: InterviewQuestion[];
  onComplete: (answers: AnswerRecord[], totalDurationSeconds: number) => void;
}) {
  // The session always opens on the standard opener. Every question after
  // that is generated live, one at a time, by realtimeEngine.getNextQuestion —
  // it reacts to what the candidate just said and to the resume, so nothing
  // here is a fixed script. `initialPlan` is only used as a fallback opener
  // in case the opening pool is ever empty.
  const [questions, setQuestions] = useState<InterviewQuestion[]>([
    OPENING_POOL[0] ?? initialPlan[0],
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<StagePhase>("speaking");
  const [transcript, setTranscript] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [answerElapsed, setAnswerElapsed] = useState(0);
  const [micActive, setMicActive] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const answersRef = useRef<AnswerRecord[]>([]);
  const usedTextsRef = useRef<Set<string>>(new Set([OPENING_POOL[0]?.text].filter(Boolean) as string[]));
  const usedKeywordsRef = useRef<Set<string>>(new Set());
  const recognitionRef = useRef<RecognitionHandle | null>(null);
  const interimRef = useRef("");
  const finalRef = useRef("");
  const answerStartRef = useRef(0);
  const maxAnswerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = questions[currentIndex];
  const speechSupported = isSpeechSynthesisSupported();
  const micSupported = isSpeechRecognitionSupported();

  // Global session clock — ticks continuously from the moment the session starts.
  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Per-answer clock — resets each time we move to a new question's listening phase.
  useEffect(() => {
    if (phase !== "listening") return;
    const interval = setInterval(() => setAnswerElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [phase, currentIndex]);

  const stopRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setMicActive(false);
  }, []);

  const beginListening = useCallback(() => {
    finalRef.current = "";
    interimRef.current = "";
    setTranscript("");
    setAnswerElapsed(0);
    answerStartRef.current = Date.now();
    setPhase("listening");

    if (micSupported) {
      const handle = startRecognition({
        onInterim: (text) => {
          interimRef.current = text;
          setTranscript(`${finalRef.current} ${interimRef.current}`.trim());
        },
        onFinalChunk: (text) => {
          finalRef.current = `${finalRef.current} ${text}`.trim();
          interimRef.current = "";
          setTranscript(finalRef.current);
        },
        onEnd: () => {
          setMicActive(false);
        },
        onError: () => {
          setMicActive(false);
        },
      });
      recognitionRef.current = handle;
      setMicActive(Boolean(handle));
    }

    if (currentQuestion) {
      if (maxAnswerTimeoutRef.current) clearTimeout(maxAnswerTimeoutRef.current);
      maxAnswerTimeoutRef.current = setTimeout(() => {
        finishAnswerRef.current?.();
      }, currentQuestion.maxAnswerSeconds * 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, micSupported]);

  const askCurrentQuestion = useCallback(() => {
    if (!currentQuestion) return;
    setPhase("speaking");
    if (speechSupported) {
      speak(currentQuestion.text, () => beginListening());
    } else {
      beginListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, speechSupported, beginListening]);

  // Ask the question whenever we advance to a new index.
  useEffect(() => {
    askCurrentQuestion();
    return () => {
      cancelSpeech();
      stopRecognition();
      if (maxAnswerTimeoutRef.current) clearTimeout(maxAnswerTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const finishAnswerRef = useRef<() => void>();

  const finishAnswer = useCallback(() => {
    if (!currentQuestion) return;
    if (maxAnswerTimeoutRef.current) clearTimeout(maxAnswerTimeoutRef.current);
    stopRecognition();

    const finalText = transcript.trim();
    const durationSeconds = Math.max(1, Math.round((Date.now() - answerStartRef.current) / 1000));

    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      category: currentQuestion.category,
      transcript: finalText,
      durationSeconds,
      wordCount: countWords(finalText),
      fillerWordCount: countFillerWords(finalText),
    };
    answersRef.current = [...answersRef.current, record];

    // The closing question is always the true final question — once it's
    // answered, the interview ends, no exceptions.
    if (currentQuestion.category === "closing") {
      setFinishing(true);
      cancelSpeech();
      onComplete(answersRef.current, elapsedSeconds);
      return;
    }

    // Once the 15-minute floor is reached, the next question asked is always
    // the closing question — otherwise ask the live engine for the next
    // resume-aware question, grounded in the answer that was just given.
    const readyToClose = elapsedSeconds >= MIN_INTERVIEW_SECONDS;
    const closing = CLOSING_POOL[0];

    const nextQuestion =
      readyToClose && !usedTextsRef.current.has(closing.text)
        ? closing
        : getNextQuestion({
            profile,
            lastAnswer: record,
            usedTexts: usedTextsRef.current,
            usedKeywords: usedKeywordsRef.current,
          });

    usedTextsRef.current.add(nextQuestion.text);
    setQuestions((prev) => [...prev, nextQuestion]);
    setCurrentIndex((i) => i + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, elapsedSeconds, transcript, profile, onComplete, stopRecognition]);

  useEffect(() => {
    finishAnswerRef.current = finishAnswer;
  }, [finishAnswer]);

  if (!currentQuestion || finishing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-mono text-sm text-paper/50">Wrapping up your session…</p>
      </div>
    );
  }

  const minReached = answerElapsed >= currentQuestion.minAnswerSeconds;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 animate-rise">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Timer elapsedSeconds={elapsedSeconds} targetSeconds={MIN_INTERVIEW_SECONDS} live={phase !== "paused"} />
      </div>

      <ProgressRail plan={questions} currentIndex={currentIndex} />

      <div className="glass-panel rounded-2xl border border-slate/15 p-6 sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
          Question {currentIndex + 1} · {currentQuestion.category}
        </p>
        <h2 className="mt-3 font-display text-2xl font-medium leading-snug text-paper sm:text-3xl">
          {currentQuestion.text}
        </h2>

        <div className="mt-6 flex items-center gap-3">
          <Waveform active={phase === "listening" && micActive} />
          <span className="font-mono text-xs text-paper/40">
            {phase === "speaking" && "Reading question aloud…"}
            {phase === "listening" && micActive && "Listening…"}
            {phase === "listening" && !micActive && micSupported && "Mic paused — tap to resume, or type below."}
            {phase === "listening" && !micSupported && "Speech-to-text unavailable — type your answer below."}
          </span>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your answer will appear here as you speak — or just type it directly."
          rows={5}
          className="mt-4 w-full rounded-xl border border-slate/30 bg-ink/40 p-4 text-paper placeholder:text-paper/30 transition-colors focus:border-amber/60 focus:bg-ink/60 focus:outline-none focus:ring-1 focus:ring-amber/30"
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-xs text-paper/40">
            {answerElapsed}s answered · min {currentQuestion.minAnswerSeconds}s
          </div>
          <div className="flex gap-2">
            {micSupported && phase === "listening" && (
              <button
                onClick={() => {
                  if (micActive) {
                    stopRecognition();
                  } else {
                    const handle = startRecognition({
                      onInterim: (text) => {
                        interimRef.current = text;
                        setTranscript(`${finalRef.current} ${interimRef.current}`.trim());
                      },
                      onFinalChunk: (text) => {
                        finalRef.current = `${finalRef.current} ${text}`.trim();
                        setTranscript(finalRef.current);
                      },
                      onEnd: () => setMicActive(false),
                    });
                    recognitionRef.current = handle;
                    setMicActive(Boolean(handle));
                  }
                }}
                className="rounded-full border border-slate/40 px-4 py-2 text-xs text-paper/70 hover:border-slate"
              >
                {micActive ? "Pause mic" : "Resume mic"}
              </button>
            )}
            <button
              onClick={finishAnswer}
              className="rounded-full bg-amber px-5 py-2 text-sm font-medium text-ink shadow-[0_6px_20px_-6px_rgba(201,166,107,0.6)] transition-all hover:scale-[1.02] hover:shadow-[0_10px_28px_-6px_rgba(201,166,107,0.75)]"
            >
              {currentQuestion.category === "closing" ? "Finish interview" : "Next question →"}
            </button>
          </div>
        </div>
        {!minReached && (
          <p className="mt-2 font-mono text-[10px] text-paper/30">
            Tip: aim for at least {currentQuestion.minAnswerSeconds}s so your answer has room to land.
          </p>
        )}
      </div>
    </div>
  );
}
