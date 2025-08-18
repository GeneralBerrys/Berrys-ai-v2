/**
 * Central registry of model "keys" to Replicate slugs.
 * Using these keys later lets us swap models without changing route code.
 * This file is not referenced anywhere yet in Step 3.
 */
export const ReplicateModels = {
  // 🖼️ Image
  'openai:gpt-image-1': 'openai/gpt-image-1',
  'bfl:flux-1.1-pro': 'black-forest-labs/flux-1.1-pro',
  'bfl:flux-dev': 'black-forest-labs/flux-dev',
  'bfl:flux-schnell': 'black-forest-labs/flux-schnell',
  'bfl:flux-kontext-pro': 'black-forest-labs/flux-kontext-pro',
  'bfl:flux-kontext-max': 'black-forest-labs/flux-kontext-max',
  'bfl:flux-fill-pro': 'black-forest-labs/flux-fill-pro',
  'sdxl:controlnet': 'lucataco/sdxl-controlnet',
  'luma:photon': 'luma/photon',
  'google:imagen-4-ultra': 'google/imagen-4-ultra',
  'google:imagen-4-fast': 'google/imagen-4-fast',
  'ideogram:v3-quality': 'ideogram-ai/ideogram-v3-quality',
  'ideogram:character': 'ideogram-ai/ideogram-character',
  'bytedance:seedream-3': 'bytedance/seedream-3',

  // 🎥 Video
  'google:veo-3': 'google/veo-3',
  'google:veo-3-fast': 'google/veo-3-fast',
  'minimax:hailuo-02': 'minimax/hailuo-02',
  'bytedance:seedance-1-pro': 'bytedance/seedance-1-pro',
  'bytedance:seedance-1-lite': 'bytedance/seedance-1-lite',
  'wan:wan-2.2-t2v-fast': 'wan-video/wan-2.2-t2v-fast',
  'runway:gen4-aleph': 'runwayml/gen4-aleph',

  // 🔊 Audio
  'minimax:speech-02-turbo': 'minimax/speech-02-turbo',
  'minimax:speech-02-hd': 'minimax/speech-02-hd',
  'openai:whisper': 'openai/whisper',
  'whisperx:base': 'alireza0/whisperx',
  'whisperx:large': 'alireza0/whisperx-large-v3',

  // 📝 Text
  'openai:gpt-4o-mini': 'openai/gpt-4o-mini',
  'openai:gpt-4o': 'openai/gpt-4o',
  'openai:gpt-5': 'openai/gpt-5', // future-flagged
  'deepseek:r1': 'deepseek-ai/deepseek-r1',
} as const;

export type ReplicateModelKey = keyof typeof ReplicateModels;

export function resolveReplicateSlug(keyOrSlug?: string, fallback?: string) {
  if (!keyOrSlug) return fallback;
  return ReplicateModels[keyOrSlug as ReplicateModelKey] ?? keyOrSlug;
}
