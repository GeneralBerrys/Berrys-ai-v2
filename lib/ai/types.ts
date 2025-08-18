export type AIKind = "text" | "image" | "video" | "audio-tts" | "audio-stt";

export type AISuccess<T> = {
  ok: true;
  type: AIKind;
  model: string;                 // resolved slug
  data: T;                       // payload (text, image, urls, etc.)
  meta?: Record<string, any>;    // logs, raw output, etc.
  took_ms?: number;
};

export type AIError = {
  ok: false;
  error: {
    code: string;                // e.g. BAD_REQUEST, PROVIDER_ERROR, TIMEOUT
    message: string;
    details?: any;
  };
  took_ms?: number;
};

export type AIResponse<T> = AISuccess<T> | AIError;

export function aiError(code: string, message: string, details?: any, took_ms?: number): AIError {
  return { ok: false, error: { code, message, details }, took_ms };
}
