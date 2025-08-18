import { resolveReplicateSlug } from "@/lib/models/replicate-registry";
import { createPrediction, waitForPrediction } from "@/providers/replicate";
import { aiError, type AIResponse } from "@/lib/ai/types";
import { timed } from "@/lib/ai/exec";

export async function POST(req: Request) {
  try {
    const { audio_url, modelKey, input } = await req.json();
    if (!audio_url || typeof audio_url !== "string") {
      return Response.json(aiError("BAD_REQUEST", "Missing audio_url"), { status: 400 });
    }

    const slug = resolveReplicateSlug(modelKey, "openai/whisper");
    if (!slug) {
      return Response.json(aiError("BAD_REQUEST", "Invalid model key"), { status: 400 });
    }

    const { value: final, took_ms } = await timed(async () => {
      const pred = await createPrediction(slug, { audio: audio_url, ...(input ?? {}) });
      return await waitForPrediction(pred.urls?.get || pred.id);
    });

    const transcript = Array.isArray(final.output) ? final.output.join("\n") : final.output;
    const res: AIResponse<{ text: string }> = {
      ok: true,
      type: "audio-stt",
      model: slug,
      data: { text: transcript },
      meta: { logs: final.logs ?? null },
      took_ms,
    };
    return Response.json(res);
  } catch (e: any) {
    const m = e?.message || "STT failed";
    const status = /timed out/i.test(m) ? 504 : 500;
    const code = /timed out/i.test(m) ? "TIMEOUT" : "PROVIDER_ERROR";
    return Response.json(aiError(code, m), { status });
  }
}
