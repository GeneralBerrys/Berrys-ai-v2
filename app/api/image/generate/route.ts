import { createPrediction, waitForPrediction } from "@/providers/replicate";
import { resolveReplicateSlug } from "@/lib/models/replicate-registry";
import { aiError, type AIResponse } from "@/lib/ai/types";
import { timed } from "@/lib/ai/exec";

const DEFAULT_IMAGE = process.env.REPLICATE_IMAGE_MODEL ?? "black-forest-labs/flux-schnell";

export async function POST(req: Request) {
  try {
    const { prompt, modelKey, options } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return Response.json(aiError("BAD_REQUEST", "Missing prompt"), { status: 400 });
    }
    const slug = resolveReplicateSlug(modelKey, DEFAULT_IMAGE);
    if (!slug) {
      return Response.json(aiError("BAD_REQUEST", "Invalid model key"), { status: 400 });
    }

    const { value: final, took_ms } = await timed(async () => {
      const pred = await createPrediction(slug, { prompt, ...options });
      return await waitForPrediction(pred.urls?.get || pred.id);
    });

    const output = final.output; // usually URL(s)
    const urls = Array.isArray(output) ? output : [output];
    const res: AIResponse<{ urls: string[] }> = {
      ok: true,
      type: "image",
      model: slug,
      data: { urls },
      meta: { logs: final.logs ?? null },
      took_ms,
    };
    return Response.json(res);
  } catch (e: any) {
    const m = e?.message || "Image generation failed";
    const status = /timed out/i.test(m) ? 504 : 500;
    const code = /timed out/i.test(m) ? "TIMEOUT" : "PROVIDER_ERROR";
    return Response.json(aiError(code, m), { status });
  }
}
