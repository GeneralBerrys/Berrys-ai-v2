import { createReplicate } from '@ai-sdk/replicate';

const BASE = 'https://api.replicate.com/v1';
const TOKEN = process.env.REPLICATE_API_TOKEN ?? '';

export const replicate = createReplicate({
  apiToken: TOKEN,
});

// IMAGE via Vercel AI SDK (official path)
export const replicateImage = (slug: string) => replicate.image(slug);

// Minimal REST helper for future text/video/audio routes (unused in Step 3)
type Prediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: any;
  error?: string | null;
  logs?: string;
  urls?: { get?: string; cancel?: string };
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Token ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Replicate ${res.status}: ${text}`);
  }
  return res.json();
}

// Exported for Step 4 usage (not referenced elsewhere yet)
export async function createPrediction(modelVersionOrOwnerModel: string, input: Record<string, any>) {
  return api('/predictions', {
    method: 'POST',
    body: JSON.stringify({ version: modelVersionOrOwnerModel, input }),
  }) as Promise<Prediction>;
}

export async function getPrediction(idOrUrl: string) {
  const url = idOrUrl.startsWith('http') ? idOrUrl : `${BASE}/predictions/${idOrUrl}`;
  const res = await fetch(url, {
    headers: { Authorization: `Token ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Replicate GET ${res.status}`);
  return (await res.json()) as Prediction;
}

export async function cancelPrediction(id: string) {
  return api(`/predictions/${id}/cancel`, { method: 'POST' });
}

export async function waitForPrediction(idOrUrl: string, opts: { intervalMs?: number; timeoutMs?: number } = {}) {
  const { intervalMs = 1500, timeoutMs = 120_000 } = opts;
  const start = Date.now();
  let pred = await getPrediction(idOrUrl);
  while (['starting', 'processing'].includes(pred.status)) {
    if (Date.now() - start > timeoutMs) {
      await cancelPrediction(pred.id).catch(() => {});
      throw new Error('Replicate prediction timed out');
    }
    await new Promise(r => setTimeout(r, intervalMs));
    pred = await getPrediction(pred.urls?.get || pred.id);
  }
  if (pred.status !== 'succeeded') {
    throw new Error(pred.error || `Prediction ${pred.status}`);
  }
  return pred;
}
