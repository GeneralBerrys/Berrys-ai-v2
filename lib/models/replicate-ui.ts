import { providers } from '@/lib/providers';
import { ReplicateModels } from './replicate-registry';

// Helper function to create a Replicate model configuration
const createReplicateModel = (key: string, label: string, providerId: string) => ({
  label,
  chef: providers[providerId as keyof typeof providers],
  providers: [
    {
      ...providers[providerId as keyof typeof providers],
      model: { id: ReplicateModels[key as keyof typeof ReplicateModels] },
      getCost: () => 0, // Cost will be handled by Replicate
    },
  ],
});

// Image Models for Replicate
export const replicateImageModels = {
  'openai:gpt-image-1': createReplicateModel('openai:gpt-image-1', 'GPT Image 1', 'openai'),
  'bfl:flux-1.1-pro': createReplicateModel('bfl:flux-1.1-pro', 'FLUX 1.1 Pro', 'black-forest-labs'),
  'bfl:flux-dev': createReplicateModel('bfl:flux-dev', 'FLUX Dev', 'black-forest-labs'),
  'bfl:flux-schnell': createReplicateModel('bfl:flux-schnell', 'FLUX Schnell', 'black-forest-labs'),
  'bfl:flux-kontext-pro': createReplicateModel('bfl:flux-kontext-pro', 'FLUX Kontext Pro', 'black-forest-labs'),
  'bfl:flux-kontext-max': createReplicateModel('bfl:flux-kontext-max', 'FLUX Kontext Max', 'black-forest-labs'),
  'bfl:flux-fill-pro': createReplicateModel('bfl:flux-fill-pro', 'FLUX Fill Pro', 'black-forest-labs'),
  'sdxl:controlnet': createReplicateModel('sdxl:controlnet', 'SDXL ControlNet', 'openai'),
  'luma:photon': createReplicateModel('luma:photon', 'Luma Photon', 'luma'),
  'google:imagen-4-ultra': createReplicateModel('google:imagen-4-ultra', 'Imagen 4 Ultra', 'google'),
  'google:imagen-4-fast': createReplicateModel('google:imagen-4-fast', 'Imagen 4 Fast', 'google'),
  'ideogram:v3-quality': createReplicateModel('ideogram:v3-quality', 'Ideogram V3 Quality', 'openai'),
  'ideogram:character': createReplicateModel('ideogram:character', 'Ideogram Character', 'openai'),
  'bytedance:seedream-3': createReplicateModel('bytedance:seedream-3', 'Seedream 3', 'openai'),
};

// Video Models for Replicate
export const replicateVideoModels = {
  'google:veo-3': createReplicateModel('google:veo-3', 'Google Veo 3', 'google'),
  'google:veo-3-fast': createReplicateModel('google:veo-3-fast', 'Google Veo 3 Fast', 'google'),
  'minimax:hailuo-02': createReplicateModel('minimax:hailuo-02', 'Hailuo 02', 'minimax'),
  'bytedance:seedance-1-pro': createReplicateModel('bytedance:seedance-1-pro', 'Seedance 1 Pro', 'openai'),
  'bytedance:seedance-1-lite': createReplicateModel('bytedance:seedance-1-lite', 'Seedance 1 Lite', 'openai'),
  'wan:wan-2.2-t2v-fast': createReplicateModel('wan:wan-2.2-t2v-fast', 'WAN 2.2 T2V Fast', 'openai'),
  'runway:gen4-aleph': createReplicateModel('runway:gen4-aleph', 'Runway Gen4 Aleph', 'runway'),
};

// Audio Models for Replicate
export const replicateAudioModels = {
  'minimax:speech-02-turbo': {
    ...createReplicateModel('minimax:speech-02-turbo', 'Speech 02 Turbo', 'minimax'),
    voices: ['default'],
  },
  'minimax:speech-02-hd': {
    ...createReplicateModel('minimax:speech-02-hd', 'Speech 02 HD', 'minimax'),
    voices: ['default'],
  },
  'openai:whisper': {
    ...createReplicateModel('openai:whisper', 'Whisper', 'openai'),
    voices: ['default'],
  },
  'whisperx:base': {
    ...createReplicateModel('whisperx:base', 'WhisperX Base', 'openai'),
    voices: ['default'],
  },
  'whisperx:large': {
    ...createReplicateModel('whisperx:large', 'WhisperX Large', 'openai'),
    voices: ['default'],
  },
};

// Text Models for Replicate
export const replicateTextModels = {
  'openai:gpt-4o-mini': createReplicateModel('openai:gpt-4o-mini', 'GPT-4o Mini', 'openai'),
  'openai:gpt-4o': createReplicateModel('openai:gpt-4o', 'GPT-4o', 'openai'),
  'openai:gpt-5': createReplicateModel('openai:gpt-5', 'GPT-5', 'openai'),
  'deepseek:r1': createReplicateModel('deepseek:r1', 'DeepSeek R1', 'deepseek'),
};
