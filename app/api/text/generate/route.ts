import { resolveReplicateSlug } from "@/lib/models/replicate-registry";
import { createPrediction, waitForPrediction } from "@/providers/replicate";
import { aiError, type AIResponse } from "@/lib/ai/types";
import { timed } from "@/lib/ai/exec";

const DEFAULT_TEXT = process.env.REPLICATE_TEXT_MODEL ?? "openai/gpt-4o-mini";

export async function POST(req: Request) {
  try {
    const { messages, prompt, modelKey, input } = await req.json();

    let p = prompt as string | undefined;
    if (!p && Array.isArray(messages)) {
      p = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
    }
    if (!p || typeof p !== "string") {
      return Response.json(aiError("BAD_REQUEST", "Missing prompt or messages"), { status: 400 });
    }

    const slug = resolveReplicateSlug(modelKey, DEFAULT_TEXT);
    if (!slug) {
      return Response.json(aiError("BAD_REQUEST", "Invalid model key"), { status: 400 });
    }

    const { value: final, took_ms } = await timed(async () => {
      const pred = await createPrediction(slug, { prompt: p, ...(input ?? {}) });
      return await waitForPrediction(pred.urls?.get || pred.id);
    });

    const text = Array.isArray(final.output) ? final.output.join("\n") : final.output;
    const res: AIResponse<{ text: string }> = {
      ok: true,
      type: "text",
      model: slug,
      data: { text },
      meta: { logs: final.logs ?? null },
      took_ms,
    };
    return Response.json(res);
  } catch (e: any) {
    const m = e?.message || "Text generation failed";
    const status = /timed out/i.test(m) ? 504 : 500;
    const code = /timed out/i.test(m) ? "TIMEOUT" : "PROVIDER_ERROR";
    return Response.json(aiError(code, m), { status });
  }
}
