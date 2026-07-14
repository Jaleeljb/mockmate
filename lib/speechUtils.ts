export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, onDone?: () => void): void {
  if (!isSpeechSynthesisSupported()) {
    onDone?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.98;
  utterance.pitch = 1;
  utterance.onend = () => onDone?.();
  utterance.onerror = () => onDone?.();
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

export interface RecognitionHandle {
  stop: () => void;
}

interface StartRecognitionOptions {
  onInterim: (text: string) => void;
  onFinalChunk: (text: string) => void;
  onEnd: () => void;
  onError?: (error: string) => void;
}

/**
 * Wraps the browser SpeechRecognition API for continuous, interim-result
 * capture of a spoken answer. Purely client-side — no network round trip.
 */
export function startRecognition(options: StartRecognitionOptions): RecognitionHandle | null {
  if (!isSpeechRecognitionSupported()) return null;
  const w = window as any;
  const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionCtor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        options.onFinalChunk(result[0].transcript);
      } else {
        interim += result[0].transcript;
      }
    }
    if (interim) options.onInterim(interim);
  };

  recognition.onerror = (event: any) => {
    options.onError?.(event.error || "unknown-error");
  };

  recognition.onend = () => {
    options.onEnd();
  };

  try {
    recognition.start();
  } catch {
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

const FILLER_WORDS = ["um", "uh", "like", "you know", "sort of", "kind of", "basically", "actually"];

export function countFillerWords(text: string): number {
  const lower = ` ${text.toLowerCase()} `;
  let count = 0;
  for (const filler of FILLER_WORDS) {
    const pattern = new RegExp(`\\s${filler}\\s`, "g");
    const matches = lower.match(pattern);
    if (matches) count += matches.length;
  }
  return count;
}

export function countWords(text: string): number {
  return text.trim().length ? text.trim().split(/\s+/).length : 0;
}
