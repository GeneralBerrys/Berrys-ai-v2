import { replicateImage } from "@/providers/replicate";
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

    const { value: result, took_ms } = await timed(async () => {
      const model = replicateImage(slug);
      return await model.doGenerate({ prompt, ...options });
    });

    const res: AIResponse<{ image: any }> = {
      ok: true,
      type: "image",
      model: slug,
      data: { image: result },
      took_ms,
    };
    return Response.json(res);
  } catch (e: any) {
    return Response.json(aiError("PROVIDER_ERROR", e?.message ?? "Image generation failed"), { status: 500 });
  }
}
